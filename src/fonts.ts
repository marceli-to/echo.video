import { continueRender, delayRender, staticFile } from 'remotion';

// The app's own fonts (both OFL): Manrope and JetBrains Mono, variable.
// Declared as CSS @font-face, then each render tab waits until both are usable.
let loaded = false;

export const loadFonts = () => {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const style = document.createElement('style');
  style.textContent = `
    @font-face { font-family: 'Manrope'; src: url('${staticFile('fonts/Manrope-Variable.ttf')}') format('truetype'); font-weight: 200 800; font-display: block; }
    @font-face { font-family: 'JetBrains Mono'; src: url('${staticFile('fonts/JetBrainsMono-Variable.ttf')}') format('truetype'); font-weight: 100 800; font-display: block; }
  `;
  document.head.appendChild(style);
  const handle = delayRender('Loading fonts', { retries: 2, timeoutInMilliseconds: 60000 });
  Promise.all([
    document.fonts.load("500 16px 'Manrope'"),
    document.fonts.load("800 16px 'Manrope'"),
    document.fonts.load("400 16px 'JetBrains Mono'"),
  ])
    .then(() => continueRender(handle))
    .catch((e) => {
      console.error(e);
      continueRender(handle);
    });
};
