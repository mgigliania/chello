# Pancho

**Learn a language by talking to someone.**

Pancho is a voice tutor you can open on your phone. You pick a language, tap
the microphone, and have a real conversation with a patient partner who speaks
only that language, corrects you gently, and quietly keeps track of the words
you managed on your own.

It teaches **Spanish** (Spain), **Portuguese** (Brazil), **Italian**, **French**
and **English**, with meaning subtitles in ten languages and an interface in
five.

It is a web app, so there is no App Store, no Xcode and no Mac. It runs on a
free Vercel account, speech in and out uses the phone's own voice engines, and
it can think on a free API tier — so a working install can cost nothing at all.

## Put it online

Four steps, about ten minutes, nothing to pay:

1. Sign in at [vercel.com](https://vercel.com) with **Continue with GitHub**,
   and choose the free **Hobby** plan.
2. Click **Add New… → Project** and **Import** this repository.
3. Change nothing on the next screen — Vercel recognises Next.js — and click
   **Deploy**.
4. Open the link it gives you, pick a language, and paste a free API key from
   [Google AI Studio](https://aistudio.google.com/apikey). No card needed.

Hosting is free on Vercel's Hobby plan, and each person who uses the app enters
their own key, so nothing is ever billed to you.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/import?s=https%3A%2F%2Fgithub.com%2Fmgigliania%2Fchello)

The button is a shortcut past steps 2 and 3; if it does not land on the import
screen, the four steps above always work.

→ **[The same thing, click by click](docs/deploy.md)** — including how to add it
to an iPhone home screen, what each error message means, and how to pay for
your friends instead of asking them for a key.

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
- **Light and dark.** Follows the phone by default, with Light and Dark in
  Settings when you want to override it. The choice is painted before the page
  appears, so there is no white flash at night.

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

## Where it thinks, and what it costs

Pancho only ever asks a provider for text, so which provider answers is a
setting rather than a rewrite. Three are built in:

| | Cost | Notes |
| --- | --- | --- |
| **Google Gemini** | Free | No card required, no expiry. The default. |
| **Groq** | Free | Noticeably the fastest — replies land almost instantly. |
| **Claude** | Paid | The best teacher of the three. |

Model IDs get retired — Groq withdrew its Llama models in August 2026 — so
Settings has a model-name box. If a provider renames a model, type the new
name; no code change, no redeploy.

Speech recognition and synthesis use the browser's own engines, so audio never
reaches a paid API at all. Only the text costs anything, and on the free tiers
it costs nothing. On Claude, a ten-minute conversation runs about four cents.

## Privacy

Conversations, words and settings are stored **in your browser** and nowhere
else. There is no Pancho account and no Pancho server holding your data.

Your API key is kept in that browser's local storage, excluded from learning
backups, and passed straight through this app's own API route to the provider
you chose — never logged, never persisted. Each provider gets its own slot, so
switching back does not mean retyping.

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
  providers.ts The three services, their models, and which are free
  model.ts    One call, two request shapes (OpenAI-compatible and Anthropic)
  speech.ts   Web Speech in and out, with the restarts mobile needs
  store.ts    The archive, as an external store
tests/        The learning engine's behaviour, pinned
```

Adding a language is one file — see [docs/add-a-language.md](docs/add-a-language.md).

## Credit

The concept, the shape of the teaching policy and the evidence model are taken
from [Chuloo/mural](https://github.com/Chuloo/mural), a native iPhone app for
the same idea. Pancho is an independent reimplementation for the web.
