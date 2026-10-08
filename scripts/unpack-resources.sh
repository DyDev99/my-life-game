#!/usr/bin/env bash
# Restore art-source/ and archive/ from resources/*.zip after cloning.
# Usage: scripts/unpack-resources.sh   (existing files are kept; use -o in unzip to overwrite)
set -euo pipefail
cd "$(dirname "$0")/.."
for zip in resources/art-source-*.zip; do [ -f "$zip" ] && unzip -qn "$zip" -d art-source && echo "unpacked $zip"; done
[ -f resources/archive.zip ] && unzip -qn resources/archive.zip -d . && echo "unpacked resources/archive.zip"
