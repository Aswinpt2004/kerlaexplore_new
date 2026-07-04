# Project Coding Rules & Guidelines

These rules take precedence and MUST be followed by all developers and AI agents working on this project.

## 1. Git Branch Strategy
* **Never work directly on `main`.**
* Branch hierarchy:
  * `main` → Production only
  * `dev` → Integration branch
  * `feature/*` → New features
  * `fix/*` → Bug fixes
  * `hotfix/*` → Emergency production fixes
* **Never push directly to `main`.**

## 2. Every Commit Must Pass These Checks
Before every commit, the code must successfully pass these checks:
1. `npm run lint` (ESLint: Zero warnings)
2. `npm run typecheck` (TypeScript: Strict mode check)
3. `npm run test` (Vitest/Tests)
4. `npm run build` (Vite production compile)
* **If any check fails, do not commit.**

## 3. Frontend Standards (React + TypeScript)
* **TypeScript Strict Mode:** Ensure `"strict": true` in `tsconfig.json`.
* **Avoid `any`:** Avoid using `any` type. Prefer `unknown` or specific interfaces.
* **ESLint:** Run `npm run lint` for zero warnings.
* **Prettier:** Run `npm run format` for automated formatting. No manual style choices.

## 4. Python Standards (FastAPI / Backend)
If Python code is added, always run:
* **Ruff (Linting):** `ruff check .` (and `ruff check . --fix`)
* **MyPy (Type checking):** `mypy .` (Strict mode: `strict = True` under `[mypy]` config, no ignored type errors)
* **Black (Formatting):** `black .` (formatting must be fully automated)
* **isort (Imports):** `isort .`

## 5. Conventional Commits
All commit messages must follow the Conventional Commits specification:
* `feat(scope): Description` (e.g. `feat(auth): add Google login`)
* `fix(scope): Description` (e.g. `fix(payment): resolve Stripe webhook issue`)
* `refactor(scope): Description` (e.g. `refactor(api): optimize booking queries`)
* `docs(scope): Description` (e.g. `docs(readme): update installation guide`)
* `test(scope): Description` (e.g. `test(chat): add websocket integration tests`)
* **Avoid non-descriptive messages like `updated`, `final`, `working`, `done`, or `changes`.**

## 6. Environment Variables & Security
* **Never commit secrets:** Never commit `.env`, `.env.local`, API keys, JWT secrets, service role keys, or database passwords.
* **Template configuration:** Maintain a `.env.example` in version control containing placeholders.

## 7. Database Migrations
* **Never edit production database manually.**
* Always generate migrations using: `supabase migration new <migration_name>`
* All schema changes must be committed under `supabase/migrations/` for version control.

## 8. Testing Rules
* Before merging, ensure code is verified via:
  * Unit tests (Vitest)
  * Integration & E2E tests (Playwright)

## 9. Pull Request Requirements
Every PR must include:
* Description
* Screenshots (if there are UI changes)
* Detailed testing steps
* Checklist
* Linked issue

## 10. Code Review Checklist
Before approving any code changes, ensure:
* Code compiles cleanly without warnings
* No duplicate code
* Clear naming conventions
* Proper error handling and logging exists
* No secrets/keys exposed
* Performance and tests are addressed
