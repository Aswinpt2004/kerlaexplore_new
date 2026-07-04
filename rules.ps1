Write-Host "=== Running Automated Formatting (Prettier) ===" -ForegroundColor Cyan
npm run format

Write-Host "`n=== Running Static Typecheck (TypeScript) ===" -ForegroundColor Cyan
npm run typecheck
if ($LASTEXITCODE -ne 0) {
    Write-Error "TypeScript Typecheck Failed! Cannot commit."
    exit 1
}

Write-Host "`n=== Running Linter (ESLint) ===" -ForegroundColor Cyan
npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Error "ESLint Check Failed! Cannot commit."
    exit 1
}

Write-Host "`n=== Running Tests (Vitest) ===" -ForegroundColor Cyan
npm run test
if ($LASTEXITCODE -ne 0) {
    Write-Error "Unit Tests Failed! Cannot commit."
    exit 1
}

Write-Host "`n=== Running Production Build ===" -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Production Build Failed! Cannot commit."
    exit 1
}

Write-Host "`n🎉 All checks passed! The workspace is clean and conforms to all rules." -ForegroundColor Green
exit 0
