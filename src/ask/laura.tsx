import React from 'react';
import { C, manrope, mono } from '../theme';
import { Bubble, ChatPreviewView } from '../ui/people';
import { MapNode, PersonHub, Scenario, makeAsk } from './engine';

// Website example 1: "Your calendar says Thursday. Your WhatsApp says Wednesday."

const N: Record<string, MapNode['box']> = {
  calendar: { x: 880, y: 190, w: 300, h: 112 },
  wa1: { x: 1258, y: 150, w: 300, h: 112 },
  wa2: { x: 1258, y: 350, w: 300, h: 70 },
  mail: { x: 880, y: 740, w: 300, h: 112 },
};
const HUB = { x: 1124, y: 520, w: 190, h: 150 };
const HUB_C = { x: HUB.x + HUB.w / 2, y: HUB.y + 32 };

const lauraChat: Bubble[] = [
  { day: '15 Oct 2026' },
  { text: 'Bis später, ich bin um halb zehn da.', sent: true },
  { text: 'Perfekt 👍' },
  { day: '2 Nov 2026' },
  { text: 'Ich habe dir die Bestätigung für den 10. per Mail geschickt.' },
  { text: 'Danke, ist eingetragen.', sent: true },
  { day: '12 Nov 2026' },
  { text: 'Danke für die Unterlagen, ich schaue sie bis zum Termin durch.' },
  { text: 'Super, bis dann!', sent: true },
  { day: '20 Nov 2026' },
  { text: 'Hallo Laura, können wir den Termin vom 10. verschieben? Ein Kunde möchte mich an dem Tag treffen. Ginge der 9. oder 11.?', sent: true },
  { text: 'Ja, Mi 9.12. würde gut gehen. OK?', match: true },
];

const calRight = { x: N.calendar.x + N.calendar.w, y: N.calendar.y + 70 };
const wa2Left = { x: N.wa2.x, y: N.wa2.y + N.wa2.h / 2 };

export const laura: Scenario = {
  app: 'chat',
  question: 'When is my next appointment with Laura Brunner?',
  tools: [
    { name: 'person', args: 'Laura Brunner', result: '1 person', reveals: ['hub'] },
    { name: 'search', args: 'with:Laura Brunner · in calendar', result: '3 results', reveals: ['calendar'] },
    { name: 'search', args: 'with:Laura Brunner · in mail', result: '2 results', reveals: ['mail'] },
    { name: 'search', args: 'with:Laura Brunner · in whatsapp', result: '6 results', reveals: ['wa1'] },
    { name: 'get_item', args: 'chat:2291', result: 'ok', reveals: ['wa2', 'conflict'] },
  ],
  answer: [
    { t: 'Your next appointment with Laura Brunner is ' },
    { t: 'probably Wednesday 9 December', b: true },
    { t: ', but it isn’t confirmed yet.' },
    { br: 'li' },
    { t: 'Your calendar', b: true },
    { t: ' still has it on ' },
    { t: 'Thursday 10 Dec at 09:30', b: true },
    { t: ' ' },
    { src: 'event' },
    { br: 'li' },
    { t: 'On WhatsApp on 20 Nov', b: true },
    { t: ', you asked to move it because a client wants to meet you on the 10th, and offered the 9th or 11th. Laura replied at 16:43: “Ja, Mi 9.12. würde gut gehen. OK?” ' },
    { src: 'chat' },
    { br: 'p' },
    { t: 'I don’t see a reply from you after that. To lock it in, confirm the 9th with her, agree on a time (you usually meet at 09:30), and move the calendar entry.' },
  ],
  center: {
    id: 'hub',
    box: HUB,
    anchor: HUB_C,
    render: (frame, at) => (
      <PersonHub
        initials="LB"
        name="Laura Brunner"
        ids={[
          { icon: 'envelope-simple', v: 'laura@brunner-praxis.test' },
          { icon: 'phone', v: '+41 79 555 12 34' },
        ]}
        frame={frame}
        from={at('hub')}
      />
    ),
  },
  nodes: [
    {
      id: 'calendar',
      box: N.calendar,
      icon: 'calendar-blank',
      source: 'Calendar',
      date: 'event',
      warnOn: 'conflict',
      body: (
        <>
          <span style={{ ...manrope(15, 600), color: C.ink }}>Termin Laura Brunner</span>
          <span style={{ ...mono(12, 500), color: C.ink }}>Thu 10 Dec · 09:30–10:30</span>
          <span style={{ ...mono(10.5), color: C.muted }}>earlier: 15 Oct, 17 Sep · both 09:30</span>
        </>
      ),
    },
    {
      id: 'wa1',
      box: N.wa1,
      icon: 'chat-teardrop',
      source: 'WhatsApp · You',
      date: '20 Nov, 14:12',
      body: (
        <span style={{ ...manrope(13.5, 500), color: C.ink, lineHeight: 1.45 }}>
          Hallo Laura, können wir den Termin vom 10. verschieben? Ein Kunde möchte mich an dem Tag treffen. Ginge der 9. oder 11.?
        </span>
      ),
    },
    {
      id: 'wa2',
      box: N.wa2,
      icon: 'chat-teardrop',
      source: 'WhatsApp · Laura',
      date: '20 Nov, 16:43',
      warnOn: 'conflict',
      body: (
        <span style={{ ...manrope(14, 600), color: C.ink, background: C.accentTint, alignSelf: 'flex-start', padding: '0 3px', borderRadius: 3 }}>
          Ja, Mi 9.12. würde gut gehen. OK?
        </span>
      ),
    },
    {
      id: 'mail',
      box: N.mail,
      icon: 'envelope-simple',
      source: 'Mail · Laura Brunner',
      date: '2 Nov',
      body: (
        <>
          <span style={{ ...manrope(15, 600), color: C.ink }}>Terminbestätigung</span>
          <span style={{ ...manrope(13, 500), color: C.muted, lineHeight: 1.45 }}>
            Gerne bestätige ich Ihnen den Termin am Donnerstag, 10. Dezember, um 09:30.
          </span>
        </>
      ),
    },
  ],
  edges: [
    { from: HUB_C, to: { x: N.calendar.x + N.calendar.w / 2, y: N.calendar.y + N.calendar.h }, reveal: 'calendar' },
    { from: HUB_C, to: { x: N.wa1.x + 40, y: N.wa1.y + N.wa1.h }, reveal: 'wa1' },
    { from: HUB_C, to: { x: N.mail.x + N.mail.w / 2, y: N.mail.y }, reveal: 'mail' },
    { from: { x: N.wa1.x + 200, y: N.wa1.y + N.wa1.h }, to: { x: N.wa2.x + 200, y: N.wa2.y }, reveal: 'wa2' },
    { from: calRight, to: wa2Left, reveal: 'conflict', conflict: true },
  ],
  labels: [{ reveal: 'conflict', at: { x: (calRight.x + wa2Left.x) / 2, y: (calRight.y + wa2Left.y) / 2 + 10 }, text: 'Thu 10 Dec ≠ Wed 9 Dec' }],
  focus: [
    { nodes: ['calendar'], from: 'Your calendar', to: 'On WhatsApp on 20 Nov' },
    { nodes: ['wa1', 'wa2'], from: 'On WhatsApp on 20 Nov', to: '<p>' },
  ],
  link: { kind: 'chat', at: { x: 140, y: 577 } },
  echo: <ChatPreviewView source="WhatsApp · 24 messages" title="Laura Brunner" bubbles={lauraChat} />,
};

export const Laura = makeAsk(laura);
