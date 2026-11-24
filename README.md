# echo.video

Product videos for écho, made with [Remotion](https://www.remotion.dev/). The app's UI is rebuilt in React
from écho's own tokens (colours, Manrope + JetBrains Mono, Phosphor Light icons, paddings from the SwiftUI
views) and filled with the demo index's data (German, nothing real).

- `npm run studio`: preview and scrub in the browser
- `npm run render`: `out/echo-tour.mp4`, 3200 × 2000 (16:10), 30 fps, no sound

## Tour (~33 s, loops)

1. Search: Recent → ⌘K → "sandra offerte" typed (the panel's results follow, as in the app) → ↓↓↓ to
   the mail → ↵: the results as the list, the thread in the preview.
2. People: Sandra Brunner → ↓ the meeting → ↓ the WhatsApp chat.
3. Settings: Sources (scrolled) → Agents: Claude Code connects, down to the access log (which lists
   the search from step 1).

Then back to the first frame. Timings are at the top of `src/Tour.tsx`. Counts in Settings are made up
to look like a real Mac (the demo index only has 38 passages).

## Checking against the app

`src/Refs.tsx` renders single states at 1:1 (`Ref` still), People and Settings included. `tools/compare.sh <dir>` renders them at 2×
next to the app's own snapshots (`vid-ref-*.png`, taken with écho's debug hooks on demo data:
`tools/launch-demo.sh vid` in echo.app, then `query` / `select` / `results` / `snapshot`).
