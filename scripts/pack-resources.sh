#!/usr/bin/env bash
# Zip the source-art folders into resources/*.zip (the only form committed to git).
# Raw folders art-source/ and archive/ are git-ignored. A zip is rebuilt only when
# a file in its folder is newer, so unchanged zips don't create new git blobs.
# Usage: scripts/pack-resources.sh [--force]
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p resources

pack() { # pack <source-dir> <zip-name>
  local src="$1" zip="resources/$2.zip"
  [ -d "$src" ] || { echo "skip  $src (missing)"; return; }
  if [ "${FORCE:-0}" != 1 ] && [ -f "$zip" ] && [ -z "$(find "$src" -newer "$zip" -print -quit)" ]; then
    echo "ok    $zip (up to date)"; return
  fi
  rm -f "$zip"
  (cd "$(dirname "$src")" && zip -rqX "$OLDPWD/$zip" "$(basename "$src")" -x '*.DS_Store' '*/__pycache__/*' '*.blend1')
  echo "built $zip ($(du -h "$zip" | cut -f1))"
}

[ "${1:-}" = "--force" ] && FORCE=1
for d in art-source/*/; do pack "${d%/}" "art-source-$(basename "$d")"; done
pack archive archive
