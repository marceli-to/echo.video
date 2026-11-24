# echo.video

Product videos for écho, made with [Remotion](https://www.remotion.dev/). The app's UI is rebuilt in React
from écho's own tokens (colours, Manrope + JetBrains Mono, Phosphor Light icons, paddings from the SwiftUI
views) and filled with the demo index's data (German, nothing real).

- `npm run studio`: preview and scrub in the browser
- `npm run render`: `out/echo-tour.mp4`, 3200 × 2000 (16:10), 30 fps, no sound
- `npm run render:laura` / `npm run render:next`: `out/echo-ask-laura.mp4`, `out/echo-ask-next.mp4`, same format

## Tour (~33 s, loops)

1. Search: Recent → ⌘K → "sandra offerte" typed (the panel's results follow, as in the app) → ↓↓↓ to
   the mail → ↵: the results as the list, the thread in the preview.
2. People: Sandra Brunner → ↓ the meeting → ↓ the WhatsApp chat.
3. Settings: Sources (scrolled) → Agents: Claude Code connects, down to the access log (which lists
   the search from step 1).

Then back to the first frame. Timings are at the top of `src/Tour.tsx`. Counts in Settings are made up
to look like a real Mac (the demo index only has 38 passages).

## Ask your AI (MCP)

The website's assistant examples. A stand-in assistant (not a real product) asks écho through MCP; its
calls come in one by one, and next to it the map of what écho connects builds up as each call returns,
including where sources disagree (dashed, in the warning colour). The answer streams in, word for word
from the website; a click on one of its sources opens the original in écho (echo://item → Recent with
the item pinned in the preview). Engine: `src/ask/engine.tsx`; scenarios:

- `AskLaura` (~26 s, `src/ask/laura.tsx`): "When is my next appointment with Laura Brunner?" in a
  desktop chat app. Calendar says Thu 10 Dec, WhatsApp says Wed 9 Dec. Ends on the chat in écho.
- `AskNext` (~24 s, `src/ask/next.tsx`): "What’s next?" in a terminal coding agent in the project
  folder. progress.md vs Thomas Keller's mail (launch moved to 14 Dec) and Sandra's WhatsApp
  (newsletter dropped). Ends on the mail in écho.

## Checking against the app

`src/Refs.tsx` renders single states at 1:1 (`Ref` still), People and Settings included. `tools/compare.sh <dir>` renders them at 2×
next to the app's own snapshots (`vid-ref-*.png`, taken with écho's debug hooks on demo data:
`tools/launch-demo.sh vid` in echo.app, then `query` / `select` / `results` / `snapshot`).
