# Pancho

**Learn a language by talking to someone.**

Pancho is a voice tutor you can open on your phone. You pick a language, tap
the microphone, and have a real conversation with a patient partner who speaks
only that language, corrects you gently, and quietly keeps track of the words
you managed on your own.

It teaches **Spanish**, **Portuguese**, **Italian**, **French** and **English**,
with meaning subtitles in ten languages and an interface in five.

It is a web app, so there is no App Store, no Xcode and no Mac. It runs on a
free Vercel account, and speech in and out uses the phone's own voice engines —
so the only thing that ever costs money is the text the model writes.

## Put it online

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/import?s=https%3A%2F%2Fgithub.com%2Fmgigliania%2Fchello)

Click the button, sign in with GitHub, and press **Deploy**. It costs nothing:
Vercel's free plan covers it, and each person who uses the app enters their own
Anthropic key, so their conversations are billed to them rather than to you.

→ **[The same thing, click by click](docs/deploy.md)** — including how to add it
to an iPhone home screen, and how to pay for your friends instead.

---

## What it does

- **Conversation practice.** Live voice, one question at a time, longer pauses
  than a person would leave you, and a recast instead of a red cross when you
  slip. Replying in your own language is fine — it gets bridged back.
- **Meaning when you want it.** A subtitle under each line, in whichever
  language you read most comfortably. Using it is not cheating; it is just
  recorded as supported practice rather than unaided recall.
- **Themes.** Twenty-four situations — a café, a market, the weekend, what you
  are listening to — each written for the language you are learning, so the
  Spanish café is in Spain and the Italian one is a bar with a counter.
- **Words that come back.** Vocabulary is never typed in by hand. It is drawn
  from what you actually said, and the app finds natural reasons to make you
  say it again later.
- **Recall bars.** One to three bars per word. The third needs recall on three
  separate days, in two different situations, spread over at least a week.
- **Tap any word.** Touch a word in the tutor's line to get it explained in
  context, in your reading language, without breaking the conversation.
- **Type instead.** When speaking is awkward, write. The conversation carries on.

## How the teaching works

The interesting part is not the chat — it is what the app refuses to believe.

After each of your turns, a second model call reads only that turn and proposes
evidence: which words you used, and whether each was heard, understood,
produced with help, produced unaided, or forgotten. That proposal is then
checked in `lib/learning.ts` before anything is stored:

- every word must quote your turn exactly, and the quote must come from the
  fragments it cites;
- evidence in another language is dropped;
- low-confidence evidence is dropped;
- and unaided production is **demoted to assisted** when subtitles were on
  screen, when you typed rather than spoke, or when the tutor itself had said
  that exact form in the previous ninety seconds.

Nothing is stored incrementally. Bars, due dates and the difficulty level are
recomputed from the whole evidence history every time, so hiding a word or
importing a backup takes effect immediately and no counter can drift.

The difficulty only rises after two clean turns in a row, and drops
straight away after one breakdown. None of this is a CEFR level or a
certificate, and the app never claims it is.

## Privacy and cost

Conversations, words and settings are stored **in your browser** and nowhere
else. There is no Pancho account and no Pancho server holding your data.

Your Anthropic API key is kept in that browser's local storage, excluded from
learning backups, and passed straight through this app's own API route to
Anthropic — never logged, never persisted.

Speech recognition and speech synthesis use the browser's built-in engines, so
audio never reaches a paid API. A conversation costs only its text tokens,
which for ordinary use is cents rather than dollars.

## Running it locally

```bash
npm install
npm run dev          # http://localhost:3000
```

Open Settings and paste an Anthropic API key from
[console.anthropic.com](https://console.anthropic.com). Nothing else to configure.

```bash
npm test             # the learning engine's rules
npm run typecheck
npm run lint
npm run build

# The conversation loop end to end, with the model mocked. Needs a running
# server and a local Chromium.
npm run build && npm start &
npm run test:e2e
```

## Browser support

Speaking works wherever the Web Speech API does — Safari on iPhone and iPad,
Chrome, and Edge. Firefox cannot listen yet; the app notices, says so, and
falls back to typing. Voices for Spanish, Portuguese, Italian and French ship
with iOS, macOS, Android and Windows.

## Layout

```
app/          Next.js routes; /api/* proxies Anthropic and never stores a key
components/   Screens and the orb
lib/
  languages/  One module per language: voice, writing and lemma guidance
  teaching.ts The tutor's standing instructions and the assessment rubric
  learning.ts Evidence validation and the recall model — the rules above
  speech.ts   Web Speech in and out, with the restarts mobile needs
  store.ts    The archive, as an external store
tests/        The learning engine's behaviour, pinned
```

Adding a language is one file — see [docs/add-a-language.md](docs/add-a-language.md).

## Credit

The concept, the shape of the teaching policy and the evidence model are taken
from [Chuloo/mural](https://github.com/Chuloo/mural), a native iPhone app for
the same idea. Pancho is an independent reimplementation for the web.
