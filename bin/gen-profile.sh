#!/usr/bin/env bash
# Regenerates the AUTO:* marker blocks in README.md from live GitHub data.
# Runs locally (gh authed) and in CI (GITHUB_TOKEN). Curated prose is untouched.
set -euo pipefail

USER=90dy
OWNED_ORGS=(ctnr-io kontabo)
EXCLUDE_REPOS=(90dy deno-ffi digital-products-assets dotenv.sh protoc-gen-hbs)
MAX_AGE_MONTHS=24   # drop repos not pushed within this window from "What I work on"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
README="$ROOT/README.md"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

exclude_jq=$(printf '"%s",' "${EXCLUDE_REPOS[@]}"); exclude_jq="[${exclude_jq%,}]"
cutoff=$(date -u -d "-${MAX_AGE_MONTHS} months" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null \
      || date -u -v-"${MAX_AGE_MONTHS}"m +%Y-%m-%dT%H:%M:%SZ)

{
  echo "### 📦 What I work on"
  echo
  gh api "users/$USER/repos?per_page=100&type=owner&sort=pushed" --paginate \
    | jq -r --argjson excl "$exclude_jq" --arg cutoff "$cutoff" '.[]
        | select(.fork==false and .archived==false and .private==false and (.name|IN($excl[])|not) and .pushed_at >= $cutoff)
        | [(.stargazers_count|tostring), .name, .html_url, (.description // ""), (.language // "")] | @tsv' \
    | sort -t$'\t' -k1,1nr \
    | awk -F'\t' '{
        line="- [" $2 "](" $3 ")"
        if ($4 != "") line=line " - " $4
        if ($5 != "") line=line " `" $5 "`"
        if ($1+0 > 0) line=line " ⭐" $1
        print line
      }'
} > "$tmp/repos.md"

{
  echo "### 🏛️ Organizations I run"
  echo
  for org in "${OWNED_ORGS[@]}"; do
    gh api "orgs/$org" \
      | jq -r '"- [" + (.name // .login) + "](" + .html_url + ")" + (if (.description // "") != "" then " - " + .description else "" end)'
  done
} > "$tmp/orgs.md"

python3 - "$README" "$tmp/repos.md" "$tmp/orgs.md" <<'PY'
import sys, re
readme, repos_f, orgs_f = sys.argv[1:4]
text = open(readme).read()

def splice(text, key, content):
    s, e = f"<!-- AUTO:{key}:START -->", f"<!-- AUTO:{key}:END -->"
    pat = re.compile(re.escape(s) + r".*?" + re.escape(e), re.DOTALL)
    if not pat.search(text):
        raise SystemExit(f"marker {key} not found in README")
    return pat.sub(s + "\n" + content.strip() + "\n" + e, text, count=1)

for key, f in (("REPOS", repos_f), ("ORGS", orgs_f)):
    text = splice(text, key, open(f).read())
open(readme, "w").write(text)
PY

echo "profile README regenerated"
