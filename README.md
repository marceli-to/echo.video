# echo.video

Product videos for écho, made with [Remotion](https://www.remotion.dev/). The app's UI is rebuilt in React
from écho's own tokens (colours, Manrope + JetBrains Mono, Phosphor Light icons, paddings from the SwiftUI
views) and filled with the demo index's data (German, nothing real).

- `npm run studio`: preview and scrub in the browser
- `npm run render`: `out/echo-search.mp4`, 3200 × 2000 (16:10), 30 fps, no sound

## SearchDemo (~15 s, loops)

Recent → ⌘K → "sandra offerte" typed (the panel's results follow, as in the app) → ↓↓↓ to the mail →
↵: the results as the list, the thread in the preview → back to Recent.

## Checking against the app

`src/Refs.tsx` renders single states at 1:1 (`Ref` still). `tools/compare.sh <dir>` renders them at 2×
next to the app's own snapshots (`vid-ref-*.png`, taken with écho's debug hooks on demo data:
`tools/launch-demo.sh vid` in echo.app, then `query` / `select` / `results` / `snapshot`).
