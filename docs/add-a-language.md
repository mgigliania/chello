# Adding a language

One file, then two lines in the registry. Everything else — the themes, the
assessment rubric, the voice, the word list — is generated from what you write.

## 1. Write the module

Copy `lib/languages/italian.ts` to `lib/languages/<yours>.ts` and fill it in.
The fields that matter most:

| Field | What it decides |
| --- | --- |
| `id` | The storage key for all progress in this language. Pick it once; renaming it orphans everyone's words. Use the ISO 639-1 code. |
| `locale` | The BCP-47 tag used for both speech recognition and the voice. It must be one browsers actually ship, e.g. `pt-BR`, not `pt`. |
| `voiceFallbacks` | Tried in order when the device has no voice for `locale`. |
| `speechGuidance` | The accent and register to aim for, and — just as important — which regional forms must be *accepted* from the learner rather than corrected. |
| `writingGuidance` | Orthography for the subtitles and the typed replies. |
| `lemmaGuidance` | How a word is stored in the word list: which article shows gender, whether reflexives stay distinct, which diacritics must survive. |
| `teachingFocus` | Six ascending bands of communicative demand, indexed by challenge 0–5. These are what the assessor grades against, so write them as things a person can *do*, not as a grammar syllabus. |

Two things to get right:

- **Do not caricature a region.** Name the variety, describe it plainly, and
  say explicitly which other varieties are valid.
- **Accept more than you produce.** The tutor speaks one variety; the learner
  may speak any. `speechGuidance` should say so, or learners with a perfectly
  good regional form will be "corrected" out of it.

## 2. Override the themes worth localising

`themeOverrides` replaces individual fields of the shared themes in
`lib/themes.ts`. Override a theme when the generic version would be wrong or
bland in context — the café, the market, and the meal are usually worth it:

```ts
themeOverrides: {
  coffee: {
    title: "Un caffè",
    situation: "Meet at a neighbourhood bar in Italy. Order at the counter and chat.",
  },
}
```

Anything you leave out falls back to the shared theme, so a short override
list is fine.

## 3. Register it

In `lib/languages/index.ts`:

```ts
import { yours } from "./yours";

export const LANGUAGES: LanguageModule[] = [spanish, portuguese, italian, french, english, yours];
```

If people should be able to read subtitles in it too, add its English name to
`MEANING_LANGUAGES` and a greeting to `MEANING_GREETINGS`.

## 4. Check it

```bash
npm run typecheck && npm test
```

Then run the app, switch to the new language in Settings, and have a short
conversation. Look for three things: the voice sounds right, the greeting is
natural, and a word you used unaided appears in **Words** with one bar.

Before telling anyone the app teaches this language well, have a fluent speaker
read `speechGuidance` and `teachingFocus` and listen to a conversation. The
guidance is instructions to a model, not evidence that the teaching works.

## Translating the interface

`lib/i18n.ts` holds one dictionary per interface language. Copy the `en` object,
translate the values, and add it to `DICTIONARIES` and `UI_LANGUAGES`. The type
is derived from `en`, so TypeScript will tell you if you miss a key.
