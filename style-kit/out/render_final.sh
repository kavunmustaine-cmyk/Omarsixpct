#!/bin/bash
export NVM_DIR="$HOME/.config/nvm"; . "$NVM_DIR/nvm.sh" >/dev/null; nvm use 22 >/dev/null
cd /home/kevin/Omarsixpct/style-kit
SECONDS=0
for attempt in 1 2; do
  if npx remotion render src/index.ts Library out/library_v2.mp4 --concurrency=2 --crf=18 --timeout=120000 > out/render.log 2>&1; then
    mv -f out/library_v2.mp4 /home/kevin/Omarsixpct/exports/library.mp4
    echo "DONE attempt $attempt in ${SECONDS}s" > out/render.status; exit 0
  fi
  echo "attempt $attempt failed" >> out/render.status
done
echo "FAILED in ${SECONDS}s" >> out/render.status
