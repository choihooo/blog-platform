#!/usr/bin/env bash
set -euo pipefail

runs="${1:-5}"

endpoints=(
  "GET https://blog.hozorica.com/api/search?q=seo&limit=10"
  "GET https://blog.hozorica.com/api/search?q=ai&limit=10"
  "GET https://blog.hozorica.com/rss.xml"
  "GET https://blog.hozorica.com/sitemap.xml"
  "GET https://blog.hozorica.com/robots.txt"
  "GET https://blog.hozorica.com/og/verifiable-ai-ui-design"
  "GET https://blog.hozorica.com/og/gangnamunni-technical-seo-strategy"
  "POST https://blog.hozorica.com/api/revalidate"
  "GET https://cms.hozorica.com/api/auth/providers"
  "GET https://cms.hozorica.com/api/auth/csrf"
  "GET https://cms.hozorica.com/api/auth/session"
  "GET https://cms.hozorica.com/api/auth/start/github"
)

printf "%-60s %-8s %-5s %-10s %-10s %-10s %-10s\n" \
  "endpoint" "code" "n" "avg_total" "min_total" "max_total" "avg_ttfb"

for entry in "${endpoints[@]}"; do
  method="${entry%% *}"
  url="${entry#* }"
  tmp="$(mktemp)"

  for ((i = 1; i <= runs; i++)); do
    if [[ "$method" == "POST" ]]; then
      curl -o /dev/null -sS -X POST \
        -H "content-type: application/json" \
        --data '{"secret":"wrong","path":"/"}' \
        -w "%{http_code} %{time_total} %{time_starttransfer}\n" \
        "$url" >>"$tmp"
    else
      curl -o /dev/null -sS \
        --max-redirs 0 \
        -w "%{http_code} %{time_total} %{time_starttransfer}\n" \
        "$url" >>"$tmp" || true
    fi
  done

  awk -v label="$method ${url#https://}" '
    NR == 1 { code = $1; min = $2; max = $2 }
    {
      total += $2
      ttfb += $3
      if ($2 < min) min = $2
      if ($2 > max) max = $2
      if ($1 != code) code = code "," $1
    }
    END {
      printf "%-60s %-8s %-5d %-10.3f %-10.3f %-10.3f %-10.3f\n",
        label, code, NR, total / NR, min, max, ttfb / NR
    }
  ' "$tmp"

  rm -f "$tmp"
done
