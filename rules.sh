#!/bin/bash
set -e

echo -e "\033[36m=== Running Automated Formatting (Prettier) ===\033[0m"
npm run format

echo -e "\n\033[36m=== Running Static Typecheck (TypeScript) ===\033[0m"
npm run typecheck

echo -e "\n\033[36m=== Running Linter (ESLint) ===\033[0m"
npm run lint

echo -e "\n\033[36m=== Running Tests (Vitest) ===\033[0m"
npm run test

echo -e "\n\033[36m=== Running Production Build ===\033[0m"
npm run build

echo -e "\n\033[32m🎉 All checks passed! The workspace is clean and conforms to all rules.\033[0m"
exit 0
