// Demo content, word for word from écho's demo index (tools/make-demo-*.swift), as the app shows it.
// **word** = a matching word (bold in rows, tinted in the preview).
import type { IconName } from './ui/Icon';

export type FeedItem = {
  icon: IconName;
  meta?: string;
  time: string;
  title: string;
  snippet?: string;
};

export const recentDays: { label: string; items: FeedItem[] }[] = [
  {
    label: 'Sun 22 Nov',
    items: [
      { icon: 'list-checks', meta: 'Done · Erinnerungen', time: '17:07', title: 'Offerte Café Linde schicken' },
      {
        icon: 'note-blank',
        meta: 'Note · Notizen',
        time: '16:19',
        title: 'Workshop Café Linde',
        snippet: 'Ausgangslage • Neue Speisekarte ab Frühling, saisonal • Website zeigt noch die Winterkarte • Lea möchte die Karte selbst pflegen',
      },
      {
        icon: 'list-checks',
        meta: 'Due yesterday · Erinnerungen',
        time: '15:55',
        title: 'Garage anrufen',
        snippet: 'Winterreifen wechseln, Termin vor dem 1. Dezember',
      },
      {
        icon: 'calendar-blank',
        meta: 'Meeting · 30 min',
        time: '09:00',
        title: 'Jour fixe Relaunch',
        snippet: 'Stand der Arbeiten, offene Punkte, nächste Schritte.',
      },
    ],
  },
  {
    label: 'Sat 21 Nov',
    items: [
      {
        icon: 'note-blank',
        meta: 'Note · Kunden',
        time: '12:19',
        title: 'Ideen Seeblick-Stiftung',
        snippet: 'Jahresbericht als Microsite statt PDF. • Spendenformular mit Twint • Anna fragen, wer die Texte freigibt',
      },
      { icon: 'chat-teardrop', time: '09:41', title: 'Sandra Brunner', snippet: 'You: Perfekt, danke!' },
    ],
  },
  {
    label: 'Thu 19 Nov',
    items: [
      { icon: 'list-checks', meta: 'Einkauf', time: '18:19', title: 'Kaffeebohnen', snippet: 'Für das Büro, zwei Packungen' },
    ],
  },
];

// ⌘K panel matches (MatchRow): label, date, title, snippet.
export type Match = { icon: IconName; label: string; date: string; title: string; snippet: string; open: string };

const pdf: Match = {
  icon: 'file-text',
  label: 'Attachment · page 1',
  date: '3 Nov',
  title: 'Offerte_2026-031_Wartung.pdf',
  snippet: '**Offerte** 2026-031 Atelier Brunner Wartung & Betrieb 2027 Pos. 1 Hosting, Updates und Monitoring pauschal CHF 4’800.– Pos. 2 Support nach Aufwand',
  open: 'open attachment',
};
const waPdf: Match = {
  icon: 'chat-teardrop',
  label: 'WhatsApp',
  date: 'Wed',
  title: 'Sandra Brunner',
  snippet: '**Offerte**_2026-031_Wartung.pdf',
  open: 'open in WhatsApp',
};
const waSuper: Match = {
  icon: 'chat-teardrop',
  label: 'WhatsApp',
  date: 'Sat',
  title: 'Sandra Brunner',
  snippet: 'Super, dann unterschreibe ich die **Offerte** heute noch.',
  open: 'open in WhatsApp',
};
const mail: Match = {
  icon: 'envelope-simple',
  label: 'You → Sandra Brunner',
  date: '3 Nov',
  title: 'Wartung & Betrieb 2027',
  snippet: 'Hallo **Sandra** Anbei unsere **Offerte** für Wartung und Betrieb im nächsten Jahr. Hosting, Updates und Monitoring sind pauschal enthalten.',
  open: 'open in Mail',
};
const kickoff: Match = {
  icon: 'calendar-blank',
  label: 'Calendar · You',
  date: '12 Nov',
  title: 'Kick-off Wartung 2027',
  snippet: 'Atelier Brunner, Zürich · With **Sandra** Brunner, Tom Brunner and you. **Offerte** 2026-031 durchgehen: Hosting, Updates, Monitoring',
  open: 'open in Calendar',
};

/** What the panel shows for "sandra" (10 matches, Sandra under "Jump to"). */
export const sandraMatches: Match[] = [
  { icon: 'chat-teardrop', label: 'You', date: 'Sat', title: 'Sandra Brunner', snippet: 'Perfekt, danke!', open: 'open in WhatsApp' },
  { ...waPdf, snippet: 'Offerte_2026-031_Wartung.pdf' },
  { icon: 'chat-teardrop', label: 'You', date: 'Wed', title: 'Sandra Brunner', snippet: 'Danke, schaue ich mir morgen an.', open: 'open in WhatsApp' },
  { icon: 'chat-teardrop', label: 'WhatsApp', date: '9 Nov', title: 'Sandra Brunner', snippet: 'Passt 👍', open: 'open in WhatsApp' },
  {
    icon: 'calendar-blank',
    label: 'Calendar · You',
    date: 'tomorrow',
    title: 'Abnahme Website Atelier Brunner',
    snippet: 'Zoom · With **Sandra** Brunner and you. Letzte Korrekturen am Header-Bild, danach Go-live.',
    open: 'open in Calendar',
  },
  waSuper,
];

/** "sandra off" … "sandra offer": 6 matches. */
export const offMatches: Match[] = [pdf, waPdf, kickoff, waSuper, mail, waSuper];

/** "sandra offert(e)": 5 matches. */
export const offerteMatches: Match[] = [pdf, waPdf, waSuper, mail, kickoff];
export const MAIL_INDEX = 3;

// The Recent list as search results (ResultFeedRow, best match, with the day).
export const resultRows: FeedItem[] = [
  {
    icon: 'file-text',
    meta: 'Mail · You → Sandra Brunner · attachment · page 1 · +1 more on page 2',
    time: '3 Nov',
    title: 'Offerte_2026-031_Wartung.pdf',
    snippet: pdf.snippet,
  },
  { icon: 'chat-teardrop', meta: '+1 more in this chat', time: '18 Nov', title: 'Sandra Brunner', snippet: waPdf.snippet },
  { icon: 'chat-teardrop', time: '21 Nov', title: 'Sandra Brunner', snippet: waSuper.snippet },
  {
    icon: 'envelope-simple',
    meta: 'You → Sandra Brunner · sandra@atelier-brunner.test',
    time: '3 Nov',
    title: 'Wartung & Betrieb 2027',
    snippet: mail.snippet,
  },
  { icon: 'calendar-blank', meta: 'Calendar · You', time: '12 Nov', title: 'Kick-off Wartung 2027', snippet: kickoff.snippet },
];

export const filterGuide = [
  { key: 'with:', about: 'a person (from: and to: for one direction)', example: 'with:"Sandra Brunner"' },
  { key: 'in:', about: 'mail, chats, files, calendar, notes…', example: 'in:notes' },
  { key: 'type:', about: 'kind of file: pdf, word, csv, markdown…', example: 'type:pdf' },
  { key: 'after:', about: 'from a year, month or day on', example: 'after:2026-03' },
  { key: 'before:', about: 'up to a date', example: 'before:2025' },
  { key: 'has:attachment', about: 'mail with files attached', example: 'has:attachment' },
  { key: 'sent', about: 'only what you sent (or received)', example: 'sent' },
];
