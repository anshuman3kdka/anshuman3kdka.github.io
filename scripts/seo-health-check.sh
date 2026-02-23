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
}

echo "Running SEO health check for ${BASE_URL}"
echo

echo "[1/3] Validating sitemap URL"
check_url "$SITEMAP_URL"

echo
echo "[2/3] Validating key pages"
for path in "${KEY_PATHS[@]}"; do
  check_url "${BASE_URL%/}${path}"
done

echo
echo "[3/3] Sampling first 25 sitemap URLs for HTTP status"
# Basic XML URL extraction without additional dependencies.
mapfile -t urls < <(curl -sS "$SITEMAP_URL" | sed -n 's:.*<loc>\(.*\)</loc>.*:\1:p' | head -n 25)

if [ "${#urls[@]}" -eq 0 ]; then
  echo "No URLs found in sitemap or sitemap unavailable."
  exit 1
fi

bad=0
for url in "${urls[@]}"; do
  status=$(curl -L -sS -o /dev/null -w '%{http_code}' "$url")
  if [[ "$status" =~ ^2|3 ]]; then
    printf 'OK   %s %s\n' "$status" "$url"
  else
    printf 'FAIL %s %s\n' "$status" "$url"
    bad=$((bad + 1))
  fi
done

if [ "$bad" -gt 0 ]; then
  echo
  echo "Detected ${bad} failing sitemap URL(s)."
  exit 1
fi

echo

echo "SEO health check completed successfully."
