"use client";

import { useMemo, useState } from "react";
import { PageHeading } from "@/components/PageHeading";
import { SearchField } from "@/components/SearchField";
import { barExplanation } from "@/lib/learning";
import type { Strings } from "@/lib/i18n";
import type { LanguageModule } from "@/lib/languages";
import type { WordState } from "@/lib/types";

function RecallBars({ count }: { count: number }) {
  return (
    <span className="flex gap-1" aria-hidden="true">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className={`h-1.5 w-[18px] rounded-full ${
            index < count ? "bg-iris" : "bg-iris-soft"
          }`}
        />
      ))}
    </span>
  );
}

interface Props {
  t: Strings;
  language: LanguageModule;
  words: WordState[];
  onForget(id: string): void;
}

export function WordsScreen({ t, language, words, onForget }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const labels = [t.newWord, t.fragile, t.growing, t.steady];

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return words;
    return words.filter(
      (word) =>
        word.lemma.toLowerCase().includes(needle) ||
        word.meaning.toLowerCase().includes(needle),
    );
  }, [words, query]);

  return (
    <div className="pb-28">
      <SearchField value={query} onChange={setQuery} placeholder={t.findWord} />

      <PageHeading
        eyebrow={`${t.littleByLittle} · ${language.nativeName}`}
        title={t.yourWords}
        subtitle={t.familiarWords}
      />

      {visible.length === 0 ? (
        <p className="mt-10 text-[17px] leading-relaxed text-muted">
          {t.noWordsYet}
        </p>
      ) : (
        <ul className="mt-8">
          {visible.map((word) => {
            const expanded = open === word.id;
            return (
              <li key={word.id} className="border-b border-hairline last:border-0">
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? null : word.id)}
                  aria-expanded={expanded}
                  className="flex w-full items-start justify-between gap-4 py-5 text-left"
                >
                  <span className="min-w-0">
                    <span
                      className="block truncate text-[22px] font-semibold tracking-[-0.01em]"
                      lang={language.locale}
                    >
                      {word.lemma}
                    </span>
                    <span className="mt-1 block text-[16px] text-muted">
                      {word.meaning}
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1.5 pt-1.5">
                    <RecallBars count={word.bars} />
                    <span className="text-[13px] text-muted">
                      {labels[Math.min(3, Math.max(0, word.bars))]}
                    </span>
                  </span>
                </button>

                {expanded && (
                  <div className="rise pb-5">
                    {word.example && (
                      <p
                        className="text-[15px] italic leading-snug text-muted"
                        lang={language.locale}
                      >
                        “{word.example}”
                      </p>
                    )}
                    <p className="mt-2 text-[14px] leading-snug text-faint">
                      {barExplanation(word)}
                    </p>
                    <button
                      type="button"
                      onClick={() => onForget(word.id)}
                      className="press mt-3 rounded-full bg-ground px-4 py-2 text-[14px] text-muted"
                    >
                      {t.forget}
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {words.length > 0 && (
        <>
          <div className="mt-8 flex justify-between text-[14px] text-muted">
            <span>1 · {t.fragile}</span>
            <span>2 · {t.growing}</span>
            <span>3 · {t.steady}</span>
          </div>
          <p className="mt-5 text-[15px] leading-relaxed text-faint">{t.barsNote}</p>
        </>
      )}
    </div>
  );
}
