#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
# Project Sentinel — Backlog Manager
#
# Operations on docs/BACKLOG.md
#
#   list                         Print all open items with section headers
#   add <section> <message>      Append a new item under a named section
#
# Usage:
#   bash scripts/backlog.sh list
#   bash scripts/backlog.sh add "Developer Experience" "My new item"
#
# Cross-OS: uses Python 3 for file manipulation to avoid sed -i
# portability differences between macOS and Linux.
# ─────────────────────────────────────────────────────────────────
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKLOG="$REPO_ROOT/docs/BACKLOG.md"

cmd_list() {
  if [[ ! -f "$BACKLOG" ]]; then
    echo "ERROR: $BACKLOG not found" >&2
    exit 1
  fi

  python3 - "$BACKLOG" <<'PYEOF'
import sys

path = sys.argv[1]
current_section = None
section_printed = False
found_any = False
in_fence = False

with open(path, encoding="utf-8") as fh:
    for line in fh:
        line = line.rstrip("\n")
        if line.startswith("```"):
            in_fence = not in_fence
            continue
        if in_fence:
            continue
        if line.startswith("## "):
            current_section = line
            section_printed = False
        elif line.startswith("- [ ]"):
            if current_section and not section_printed:
                print(current_section)
                section_printed = True
            print(line)
            found_any = True

if not found_any:
    print("No open backlog items.")
PYEOF
}

cmd_add() {
  local section="${1:-}"
  local message="${2:-}"

  if [[ -z "$section" || -z "$message" ]]; then
    echo "Usage: bash scripts/backlog.sh add <section> <message>" >&2
    exit 1
  fi

  if [[ ! -f "$BACKLOG" ]]; then
    echo "ERROR: $BACKLOG not found" >&2
    exit 1
  fi

  local today
  today="$(date +%Y-%m-%d)"

  python3 - "$BACKLOG" "$section" "$message" "$today" <<'PYEOF'
import sys

path, section, message, today = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
target_heading = f"## {section}"
new_item = (
    f"- [ ] {message}\n"
    f"      _Discovered: {today} | Context: added via backlog.sh_"
)

with open(path, encoding="utf-8") as fh:
    lines = fh.readlines()

# Find the target section
section_idx = None
for i, line in enumerate(lines):
    if line.rstrip("\n") == target_heading:
        section_idx = i
        break

if section_idx is None:
    print(f"ERROR: Section '{target_heading}' not found in {path}", file=sys.stderr)
    sys.exit(1)

# Find insertion point: after the last item (and its continuation lines)
# within this section, before the next '## ' heading or EOF
insert_after = section_idx
i = section_idx + 1
while i < len(lines):
    stripped = lines[i].rstrip("\n")
    if stripped.startswith("## "):
        break
    if stripped.startswith("- ["):
        insert_after = i
        # absorb indented continuation lines
        j = i + 1
        while j < len(lines) and (lines[j].startswith("      ") or lines[j].strip() == ""):
            if lines[j].startswith("      "):
                insert_after = j
            j += 1
        i = j
        continue
    i += 1

# Insert after insert_after; add a blank separator if inserting right after heading
lines.insert(insert_after + 1, new_item + "\n")
if insert_after == section_idx:
    lines.insert(insert_after + 1, "\n")

with open(path, "w", encoding="utf-8") as fh:
    fh.writelines(lines)

print(f"Added to '{target_heading}': {message}")
PYEOF
}

case "${1:-}" in
  list)  cmd_list ;;
  add)   cmd_add "${2:-}" "${3:-}" ;;
  *)
    echo "Usage: bash scripts/backlog.sh list" >&2
    echo "       bash scripts/backlog.sh add <section> <message>" >&2
    exit 1
    ;;
esac
