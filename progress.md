# echo.video — progress

Product videos for écho's website, made with Remotion. The app's UI is rebuilt in React (approach 1:
not screen recordings), from écho's own tokens and the demo index's data. See README.md for commands.

## State (2026-11-24)

| Video | Composition | Length | Status |
| --- | --- | --- | --- |
| Tour: search → People → Settings (Sources, Agents) | `Tour` | ~33 s, loops | done, confirmed by the user 2026-11-24 |
| Ask your AI #1: Laura Brunner (calendar vs WhatsApp) | `AskLaura` | ~33 s, loops | done, confirmed 2026-11-24 |
| Ask your AI #3: "What's next?" (terminal agent) | `AskNext` | ~30 s, loops | done, confirmed 2026-11-24 ("perfect") |
| Ask your AI #2: Thomas Keller (meeting + Bohemia) | — | — | not made (the user picked #1, then #3) |

All rendered at 3200 × 2000 (16:10, 2×), 30 fps, H.264, no audio track (`--muted`). Renders live in
`out/` (gitignored); not yet on the website.

## Decisions (the user's, 2026-11-24)

- **For the website**, not in the app (the onboarding idea was dropped for now).
- **Light** appearance only, graphite highlight. **No sound, no captions.** Demo data in **German**.
- **Exact** to the app, not a simplified illustration. Checked by rendering single states at 2× next to
  the app's own snapshots (`tools/compare.sh`, `Ref` still; snapshots from echo.app's debug hooks on demo
  data, `tools/launch-demo.sh vid`).
- **One tour** (not separate clips) for the features: People, Settings · Sources, Settings · Agents
  (Privacy left out).
- **MCP showcase**: a stand-in assistant (no real product's UI or name), the calls to écho one by one, a
  map of what écho connects with mismatches dashed in the warning colour, the answer word for word from
  the website, a click on a source opening the original in écho. The user loves the terminal UI.
- Pacing feedback applied: a pause before the link is clicked; a pause after each call once its finds
  are on the map.

## Things to know

- **Font**: the videos use the bundled JetBrains Mono v2 (what testers see). The user's Mac has the old
  JetBrains Mono v1.0 in `~/Library/Fonts`, which écho picks up instead (wider labels, no ⌘ glyph), so
  mono text in écho on that Mac looks slightly different from the videos.
- **Made-up content** beyond the demo index: realistic counts in Settings → Sources (61’742 passages …,
  the demo has 38), the Files folder, Claude Code connected + access log entries, Laura's address,
  number, confirmation mail and older chat, Thomas Keller's mail, Sandra Moser's chat, progress.md.
- The website's example #3 was only on echo.web's `origin/main` (the local checkout was behind); its
  wording was taken from there.
- Recent's preview width (575 pt) and People's (492 pt) are the user's stored widths, measured from the
  snapshots.

## Possible next steps

- Put the videos on the website (poster frames, `autoplay muted loop playsinline`, maybe a smaller
  1600 × 1000 or WebM/AV1 version).
- Example #2 (Thomas Keller) as a third `ask/` scenario, if wanted.
- Dark appearance versions, if the site gets a dark mode.
