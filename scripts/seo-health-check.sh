#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-https://www.anshuman3kdka.in}"
SITEMAP_URL="${BASE_URL%/}/sitemap.xml"
KEY_PATHS=("/" "/essays/" "/projects/" "/about/")

check_url() {
  local url="$1"
  local status
  status=$(curl -L -sS -o /dev/null -w '%{http_code}' "$url")
  echo "$status $url"
  [[ "$status" =~ ^[23][0-9][0-9]$ ]]
}

echo "Running SEO health check for ${BASE_URL}"
echo

failures=0

echo "[1/3] Validating sitemap URL"
if ! check_url "$SITEMAP_URL"; then
  failures=$((failures + 1))
fi

echo
echo "[2/3] Validating key pages"
for path in "${KEY_PATHS[@]}"; do
  if ! check_url "${BASE_URL%/}${path}"; then
    failures=$((failures + 1))
  fi
done

echo
echo "[3/3] Sampling first 25 sitemap URLs for HTTP status"
# Basic XML URL extraction without additional dependencies.
mapfile -t urls < <(curl -sS "$SITEMAP_URL" | sed -n 's:.*<loc>\(.*\)</loc>.*:\1:p' | head -n 25)

if [ "${#urls[@]}" -eq 0 ]; then
  echo "No URLs found in sitemap or sitemap unavailable."
  failures=$((failures + 1))
fi

bad=0
if [ "${#urls[@]}" -gt 0 ]; then
  for url in "${urls[@]}"; do
    status=$(curl -L -sS -o /dev/null -w '%{http_code}' "$url")
    # Match exactly 3-digit 2xx/3xx codes so partial matches (e.g., "30" or "x200") don't slip through.
    if [[ "$status" =~ ^[23][0-9][0-9]$ ]]; then
      printf 'OK   %s %s\n' "$status" "$url"
    else
      printf 'FAIL %s %s\n' "$status" "$url"
      bad=$((bad + 1))
    fi
  done
fi

failures=$((failures + bad))

if [ "$failures" -gt 0 ]; then
  echo
  echo "Detected ${failures} failing URL(s) across all checks."
  exit 1
fi

echo

echo "SEO health check completed successfully."
