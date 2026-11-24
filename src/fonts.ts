import { continueRender, delayRender, staticFile } from 'remotion';

// The app's own fonts (both OFL): Manrope and JetBrains Mono, variable.
let loaded = false;

export const loadFonts = () => {
  if (loaded) return;
  loaded = true;
  const handle = delayRender('Loading fonts');
  const faces = [
    new FontFace('Manrope', `url(${staticFile('fonts/Manrope-Variable.ttf')})`, { weight: '200 800' }),
    new FontFace('JetBrains Mono', `url(${staticFile('fonts/JetBrainsMono-Variable.ttf')})`, { weight: '100 800' }),
  ];
  Promise.all(faces.map((f) => f.load()))
    .then((fs) => {
      fs.forEach((f) => document.fonts.add(f));
      continueRender(handle);
    })
    .catch((e) => {
      console.error(e);
      continueRender(handle);
    });
};
