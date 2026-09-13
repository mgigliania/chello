"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Onboarding } from "@/components/Onboarding";
import { SettingsSheet } from "@/components/SettingsSheet";
import { Shell } from "@/components/Shell";
import { ThemeSync } from "@/components/ThemeSync";
import { TabBar, type Tab } from "@/components/TabBar";
import { TalkScreen } from "@/components/TalkScreen";
import { ThemesScreen } from "@/components/ThemesScreen";
import { WordsScreen } from "@/components/WordsScreen";
import { useConversation } from "@/lib/conversation";
import { strings } from "@/lib/i18n";
import { recognitionSupported } from "@/lib/speech";
import { usePancho } from "@/lib/store";
import { themeFor } from "@/lib/themes";

export function App() {
  const store = usePancho();
  const t = strings(store.preferences.interfaceLanguage);
  const [tab, setTab] = useState<Tab>("talk");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const conversation = useConversation({
    preferences: store.preferences,
    learner: store.learner,
    apiKey: store.apiKey,
    onCommit: store.commitSession,
  });

  // Read once from the browser, with an optimistic value during SSR so the
  // warning never flashes before hydration.
  const listenable = useSyncExternalStore(
    () => () => {},
    recognitionSupported,
    () => true,
  );

  // A language change mid-conversation would leave the transcript bilingual
  // and the assessments mis-tagged, so the session closes first. The first
  // run is skipped: there is nothing to end on mount.
  const knownLanguage = useRef<string | null>(null);
  useEffect(() => {
    // Before hydration the preference is still the default, so the first
    // real value is recorded rather than treated as a change.
    if (!store.hydrated) return;
    const current = store.preferences.learningLanguageID;
    if (knownLanguage.current === null) {
      knownLanguage.current = current;
      return;
    }
    if (knownLanguage.current === current) return;
    knownLanguage.current = current;
    conversation.end("language-changed");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.hydrated, store.preferences.learningLanguageID]);

  const themeSync = <ThemeSync theme={store.preferences.theme} />;

  if (!store.hydrated) {
    return (
      <>
        {themeSync}
        <div className="min-h-dvh bg-ground" />
      </>
    );
  }

  if (!store.preferences.hasOnboarded) {
    return (
      <>
        {themeSync}
        <Onboarding
          t={t}
          learningLanguageID={store.preferences.learningLanguageID}
          meaningLanguage={store.preferences.meaningLanguage}
          provider={store.preferences.provider}
          onSetLearning={(id) =>
            store.setPreferences({ learningLanguageID: id })
          }
          onSetMeaning={(language) =>
            store.setPreferences({ meaningLanguage: language })
          }
          keys={store.keys}
          onSetProvider={(id) => store.setPreferences({ provider: id })}
          onSetKey={store.setKey}
          onDone={() => store.setPreferences({ hasOnboarded: true })}
        />
      </>
    );
  }

  const theme = themeFor(
    store.preferences.learningLanguageID,
    conversation.session?.themeID,
  );
  const title =
    theme?.title ?? t.everydayIn(conversation.language.nativeName);

  const banner = (() => {
    if (conversation.error === "key") return t.keyNeeded;
    if (conversation.error === "mic-denied") return t.micBlocked;
    if (conversation.error === "mic-unsupported") return t.micUnsupported;
    if (conversation.error === "network")
      return conversation.errorDetail || t.somethingWentWrong;
    if (!listenable) return t.micUnsupported;
    return "";
  })();

  return (
    <>
      {themeSync}
      <Shell onOpenSettings={() => setSettingsOpen(true)} settingsLabel={t.settings}>
        {banner && (
          <button
            type="button"
            onClick={() => {
              conversation.clearError();
              if (conversation.error === "key") setSettingsOpen(true);
            }}
            className="rise mt-3 w-full shrink-0 rounded-[18px] bg-butter px-4 py-3 text-left text-[15px] leading-snug text-ink"
          >
            {banner}
          </button>
        )}

        {tab === "talk" && (
          <TalkScreen
            t={t}
            language={conversation.language}
            title={title}
            status={conversation.status}
            micOn={conversation.micOn}
            active={conversation.session !== null}
            interim={conversation.interim}
            reply={conversation.reply}
            meaning={conversation.meaning}
            lastUserLine={conversation.lastUserLine}
            meaningVisible={store.preferences.meaningVisible}
            transcript={conversation.transcript}
            onToggleMic={conversation.toggleMic}
            onToggleMeaning={() =>
              store.setPreferences({
                meaningVisible: !store.preferences.meaningVisible,
              })
            }
            onEnd={() => conversation.end()}
            onSendTyped={conversation.sendTyped}
            onAskForHelp={conversation.askForHelp}
            lookup={conversation.lookup}
            onLookUp={conversation.lookUp}
            onClearLookup={conversation.clearLookup}
          />
        )}

        {tab === "themes" && (
          <ThemesScreen
            t={t}
            languageID={store.preferences.learningLanguageID}
            onChoose={(themeID) => {
              setTab("talk");
              conversation.chooseTheme(themeID);
            }}
          />
        )}

        {tab === "words" && (
          <WordsScreen
            t={t}
            language={conversation.language}
            words={store.learner.words}
            onForget={store.forgetWord}
          />
        )}
      </Shell>

      <TabBar active={tab} onChange={setTab} t={t} />

      {settingsOpen && (
        <SettingsSheet
          t={t}
          archive={store.archive}
          preferences={store.preferences}
          keys={store.keys}
          onClose={() => setSettingsOpen(false)}
          onChange={store.setPreferences}
          onSetKey={store.setKey}
          onReplaceArchive={store.replaceArchive}
          onDeleteEverything={store.deleteEverything}
        />
      )}
    </>
  );
}
