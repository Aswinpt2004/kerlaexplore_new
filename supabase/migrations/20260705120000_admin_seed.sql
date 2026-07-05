-- ================================================================
-- Admin User Seed
-- Creates guide_admin and traveler_admin auth users + profile rows
-- ================================================================

do $$
declare
  v_guide_admin_id    uuid;
  v_traveler_admin_id uuid;
begin

  -- ── Guide Admin ───────────────────────────────────────────
  -- Only insert if email doesn't already exist
  if not exists (select 1 from auth.users where email = 'guideadmin@kuto.com') then
    v_guide_admin_id := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role,
      email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change,
      email_change_token_new, recovery_token
    )
    values (
      '00000000-0000-0000-0000-000000000000',
      v_guide_admin_id,
      'authenticated', 'authenticated',
      'guideadmin@kuto.com',
      extensions.crypt('Admin@Guide123', extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"role":"guide_admin","firstName":"Guide","lastName":"Admin"}',
      now(), now(),
      '', '', '', ''
    );

    insert into public.users (auth_user_id, email, full_name, role, status)
    values (v_guide_admin_id, 'guideadmin@kuto.com', 'Guide Admin', 'guide_admin', 'active')
    on conflict (auth_user_id) do nothing;

  else
    -- Already exists: just ensure the profile row is correct
    update public.users
    set role = 'guide_admin', status = 'active'
    where email = 'guideadmin@kuto.com';
  end if;

  -- ── Traveler Admin ────────────────────────────────────────
  if not exists (select 1 from auth.users where email = 'traveleradmin@kuto.com') then
    v_traveler_admin_id := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role,
      email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change,
      email_change_token_new, recovery_token
    )
    values (
      '00000000-0000-0000-0000-000000000000',
      v_traveler_admin_id,
      'authenticated', 'authenticated',
      'traveleradmin@kuto.com',
      extensions.crypt('Admin@Traveler123', extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"role":"traveler_admin","firstName":"Traveler","lastName":"Admin"}',
      now(), now(),
      '', '', '', ''
    );

    insert into public.users (auth_user_id, email, full_name, role, status)
    values (v_traveler_admin_id, 'traveleradmin@kuto.com', 'Traveler Admin', 'traveler_admin', 'active')
    on conflict (auth_user_id) do nothing;

  else
    -- Already exists: just ensure the profile row is correct
    update public.users
    set role = 'traveler_admin', status = 'active'
    where email = 'traveleradmin@kuto.com';
  end if;

end;
$$;

-- Verify
select email, role, status from public.users order by created_at;
