#!/usr/bin/env bash
set -e

mkdir -p .git/hooks
cp scripts/hooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

echo "✅ Git hooks successfully installed to .git/hooks/pre-commit"
