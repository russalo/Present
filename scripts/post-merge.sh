#!/bin/bash
# Post-merge hook — delegates to the justfile so logic stays in one place.
# Falls back to direct commands if `just` is not installed.
set -e

if command -v just &> /dev/null; then
  just post-merge
else
  pnpm install --frozen-lockfile
  pnpm --filter db push
fi
