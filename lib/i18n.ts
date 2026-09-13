/** UI chrome strings. Deliberately separate from the target language: someone
 *  can learn Italian with a Spanish interface and French subtitles. */

export const UI_LANGUAGES = [
  { id: "en", label: "English" },
  { id: "es", label: "Español" },
  { id: "pt", label: "Português" },
  { id: "it", label: "Italiano" },
  { id: "fr", label: "Français" },
] as const;

export type UiLanguageID = (typeof UI_LANGUAGES)[number]["id"];

const en = {
  tagline: "The language app you eventually delete.",
  talk: "Talk",
  themes: "Themes",
  words: "Words",
  settings: "Settings",
  close: "Close",
  done: "Done",
  cancel: "Cancel",

  everydayIn: (language: string) => `A little everyday ${language}`,
  readyWhenYouAre: "Ready when you are",
  listening: "Listening",
  isSpeaking: "Pancho is speaking",
  thinking: "Thinking",
  micOn: "Microphone on",
  micOff: "Microphone off",
  anyLanguageWelcome: "Your own language is welcome, too.",
  meaning: "Meaning",
  transcript: "Transcript",
  end: "End",
  typeInstead: "Type instead",
  aLittleHelp: "A little help",
  newConversation: "New conversation",
  you: "You",
  sendPlaceholder: "Write a reply…",
  send: "Send",
  tapTheOrb: "Tap the microphone to begin",

  findConversation: "Find a conversation",
  aPlaceToBegin: "A place to begin",
  whatsOnYourMind: "What's on your mind?",
  sameFriend: "Same friend. Somewhere new.",
  justTalk: "Just talk",

  findWord: "Find a word",
  littleByLittle: "Little by little",
  yourWords: "Your words.",
  familiarWords: "Familiar words, ready for another conversation.",
  noWordsYet: "Nothing yet. Words appear here after you use them in conversation.",
  barsNote:
    "The bars estimate spoken recall, not permanent mastery. Using a word with visible meanings counts as supported practice.",
  fragile: "Fragile",
  growing: "Growing",
  steady: "Steady",
  newWord: "New",
  forget: "Forget this word",

  learningLanguage: "I'm learning",
  subtitleLanguage: "Show meaning in",
  interfaceLanguage: "App language",
  interests: "Things you'd like to talk about",
  speechRate: "Speaking speed",
  slower: "Slower",
  faster: "Faster",
  apiKey: "Your Anthropic API key",
  apiKeyHelp:
    "Stored in this browser only, and sent only to Anthropic. Get one at console.anthropic.com.",
  apiKeySaved: "Key saved in this browser.",
  yourData: "Your data",
  exportBackup: "Export a backup",
  importBackup: "Import a backup",
  deleteEverything: "Delete all learning data",
  deleteConfirm: "Delete every conversation and word? This cannot be undone.",
  privacyNote:
    "Conversations, words and settings stay in this browser. Nothing is sent to a Pancho server.",

  welcome: "Hello.",
  welcomeBody: "Learn a language by talking with someone. Choose where to start.",
  whichLanguage: "Which language are you learning?",
  whichSubtitles: "When you need a hand, show meaning in…",
  continueButton: "Continue",
  beginButton: "Start talking",

  micBlocked: "Pancho needs microphone access to hear you.",
  micUnsupported:
    "This browser can't listen yet. Safari on iPhone and Chrome work best — you can still type.",
  speechUnsupported: "This browser has no voice for that language yet.",
  keyNeeded: "Add your Anthropic API key in Settings to start talking.",
  somethingWentWrong: "Something went wrong. Try again.",
};

type Dictionary = typeof en;

const es: Dictionary = {
  tagline: "La app de idiomas que acabarás borrando.",
  talk: "Hablar",
  themes: "Temas",
  words: "Palabras",
  settings: "Ajustes",
  close: "Cerrar",
  done: "Listo",
  cancel: "Cancelar",

  everydayIn: (language: string) => `Un poco de ${language} cada día`,
  readyWhenYouAre: "Cuando quieras",
  listening: "Escuchando",
  isSpeaking: "Pancho está hablando",
  thinking: "Pensando",
  micOn: "Micrófono encendido",
  micOff: "Micrófono apagado",
  anyLanguageWelcome: "Tu idioma también es bienvenido.",
  meaning: "Significado",
  transcript: "Transcripción",
  end: "Terminar",
  typeInstead: "Escribir",
  aLittleHelp: "Una ayudita",
  newConversation: "Nueva conversación",
  you: "Tú",
  sendPlaceholder: "Escribe una respuesta…",
  send: "Enviar",
  tapTheOrb: "Toca el micrófono para empezar",

  findConversation: "Buscar una conversación",
  aPlaceToBegin: "Por dónde empezar",
  whatsOnYourMind: "¿Qué te apetece?",
  sameFriend: "El mismo amigo. Otro lugar.",
  justTalk: "Solo hablar",

  findWord: "Buscar una palabra",
  littleByLittle: "Poco a poco",
  yourWords: "Tus palabras.",
  familiarWords: "Palabras conocidas, listas para otra conversación.",
  noWordsYet:
    "Todavía nada. Las palabras aparecen aquí cuando las usas al hablar.",
  barsNote:
    "Las barras estiman el recuerdo al hablar, no un dominio permanente. Usar una palabra con los significados visibles cuenta como práctica con apoyo.",
  fragile: "Frágil",
  growing: "Creciendo",
  steady: "Firme",
  newWord: "Nueva",
  forget: "Olvidar esta palabra",

  learningLanguage: "Estoy aprendiendo",
  subtitleLanguage: "Mostrar el significado en",
  interfaceLanguage: "Idioma de la app",
  interests: "Temas de los que te gustaría hablar",
  speechRate: "Velocidad al hablar",
  slower: "Más despacio",
  faster: "Más rápido",
  apiKey: "Tu clave de API de Anthropic",
  apiKeyHelp:
    "Se guarda solo en este navegador y se envía solo a Anthropic. Consíguela en console.anthropic.com.",
  apiKeySaved: "Clave guardada en este navegador.",
  yourData: "Tus datos",
  exportBackup: "Exportar una copia",
  importBackup: "Importar una copia",
  deleteEverything: "Borrar todos los datos de aprendizaje",
  deleteConfirm:
    "¿Borrar todas las conversaciones y palabras? Esto no se puede deshacer.",
  privacyNote:
    "Las conversaciones, las palabras y los ajustes se quedan en este navegador. No se envía nada a un servidor de Pancho.",

  welcome: "Hola.",
  welcomeBody: "Aprende un idioma hablando con alguien. Elige por dónde empezar.",
  whichLanguage: "¿Qué idioma estás aprendiendo?",
  whichSubtitles: "Cuando necesites ayuda, muestra el significado en…",
  continueButton: "Continuar",
  beginButton: "Empezar a hablar",

  micBlocked: "Pancho necesita acceso al micrófono para escucharte.",
  micUnsupported:
    "Este navegador aún no puede escuchar. Safari en iPhone y Chrome funcionan mejor; también puedes escribir.",
  speechUnsupported: "Este navegador aún no tiene voz para ese idioma.",
  keyNeeded: "Añade tu clave de API de Anthropic en Ajustes para empezar.",
  somethingWentWrong: "Algo ha salido mal. Inténtalo de nuevo.",
};

const pt: Dictionary = {
  tagline: "O app de idiomas que você acaba apagando.",
  talk: "Falar",
  themes: "Temas",
  words: "Palavras",
  settings: "Ajustes",
  close: "Fechar",
  done: "Pronto",
  cancel: "Cancelar",

  everydayIn: (language: string) => `Um pouco de ${language} todo dia`,
  readyWhenYouAre: "Quando você quiser",
  listening: "Ouvindo",
  isSpeaking: "Pancho está falando",
  thinking: "Pensando",
  micOn: "Microfone ligado",
  micOff: "Microfone desligado",
  anyLanguageWelcome: "Seu idioma também é bem-vindo.",
  meaning: "Significado",
  transcript: "Transcrição",
  end: "Encerrar",
  typeInstead: "Escrever",
  aLittleHelp: "Uma ajudinha",
  newConversation: "Nova conversa",
  you: "Você",
  sendPlaceholder: "Escreva uma resposta…",
  send: "Enviar",
  tapTheOrb: "Toque no microfone para começar",

  findConversation: "Procurar uma conversa",
  aPlaceToBegin: "Por onde começar",
  whatsOnYourMind: "O que você quer?",
  sameFriend: "O mesmo amigo. Outro lugar.",
  justTalk: "Só conversar",

  findWord: "Procurar uma palavra",
  littleByLittle: "Aos poucos",
  yourWords: "Suas palavras.",
  familiarWords: "Palavras conhecidas, prontas para outra conversa.",
  noWordsYet:
    "Nada ainda. As palavras aparecem aqui depois que você as usa conversando.",
  barsNote:
    "As barras estimam a lembrança na fala, não o domínio permanente. Usar uma palavra com os significados visíveis conta como prática com apoio.",
  fragile: "Frágil",
  growing: "Crescendo",
  steady: "Firme",
  newWord: "Nova",
  forget: "Esquecer esta palavra",

  learningLanguage: "Estou aprendendo",
  subtitleLanguage: "Mostrar o significado em",
  interfaceLanguage: "Idioma do app",
  interests: "Assuntos sobre os quais você gostaria de falar",
  speechRate: "Velocidade da fala",
  slower: "Mais devagar",
  faster: "Mais rápido",
  apiKey: "Sua chave de API da Anthropic",
  apiKeyHelp:
    "Guardada só neste navegador e enviada só para a Anthropic. Pegue a sua em console.anthropic.com.",
  apiKeySaved: "Chave guardada neste navegador.",
  yourData: "Seus dados",
  exportBackup: "Exportar uma cópia",
  importBackup: "Importar uma cópia",
  deleteEverything: "Apagar todos os dados de aprendizado",
  deleteConfirm:
    "Apagar todas as conversas e palavras? Isso não pode ser desfeito.",
  privacyNote:
    "Conversas, palavras e ajustes ficam neste navegador. Nada é enviado para um servidor do Pancho.",

  welcome: "Olá.",
  welcomeBody: "Aprenda um idioma conversando com alguém. Escolha por onde começar.",
  whichLanguage: "Qual idioma você está aprendendo?",
  whichSubtitles: "Quando precisar de ajuda, mostre o significado em…",
  continueButton: "Continuar",
  beginButton: "Começar a falar",

  micBlocked: "O Pancho precisa do microfone para ouvir você.",
  micUnsupported:
    "Este navegador ainda não consegue ouvir. Safari no iPhone e Chrome funcionam melhor; você também pode escrever.",
  speechUnsupported: "Este navegador ainda não tem voz para esse idioma.",
  keyNeeded: "Adicione sua chave de API da Anthropic nos Ajustes para começar.",
  somethingWentWrong: "Algo deu errado. Tente de novo.",
};

const it: Dictionary = {
  tagline: "L'app di lingue che prima o poi cancellerai.",
  talk: "Parla",
  themes: "Temi",
  words: "Parole",
  settings: "Impostazioni",
  close: "Chiudi",
  done: "Fatto",
  cancel: "Annulla",

  everydayIn: (language: string) => `Un po' di ${language} ogni giorno`,
  readyWhenYouAre: "Quando vuoi",
  listening: "Sto ascoltando",
  isSpeaking: "Pancho sta parlando",
  thinking: "Sto pensando",
  micOn: "Microfono acceso",
  micOff: "Microfono spento",
  anyLanguageWelcome: "Anche la tua lingua va benissimo.",
  meaning: "Significato",
  transcript: "Trascrizione",
  end: "Termina",
  typeInstead: "Scrivi",
  aLittleHelp: "Un piccolo aiuto",
  newConversation: "Nuova conversazione",
  you: "Tu",
  sendPlaceholder: "Scrivi una risposta…",
  send: "Invia",
  tapTheOrb: "Tocca il microfono per iniziare",

  findConversation: "Cerca una conversazione",
  aPlaceToBegin: "Da dove cominciare",
  whatsOnYourMind: "Di cosa parliamo?",
  sameFriend: "Stesso amico. Un posto nuovo.",
  justTalk: "Parliamo e basta",

  findWord: "Cerca una parola",
  littleByLittle: "Poco a poco",
  yourWords: "Le tue parole.",
  familiarWords: "Parole che conosci, pronte per un'altra conversazione.",
  noWordsYet:
    "Ancora niente. Le parole appaiono qui dopo che le usi parlando.",
  barsNote:
    "Le barre stimano il recupero nel parlato, non una padronanza permanente. Usare una parola con i significati visibili conta come pratica assistita.",
  fragile: "Fragile",
  growing: "In crescita",
  steady: "Solida",
  newWord: "Nuova",
  forget: "Dimentica questa parola",

  learningLanguage: "Sto imparando",
  subtitleLanguage: "Mostra il significato in",
  interfaceLanguage: "Lingua dell'app",
  interests: "Argomenti di cui ti piacerebbe parlare",
  speechRate: "Velocità del parlato",
  slower: "Più lento",
  faster: "Più veloce",
  apiKey: "La tua chiave API di Anthropic",
  apiKeyHelp:
    "Salvata solo in questo browser e inviata solo ad Anthropic. Ottienila su console.anthropic.com.",
  apiKeySaved: "Chiave salvata in questo browser.",
  yourData: "I tuoi dati",
  exportBackup: "Esporta una copia",
  importBackup: "Importa una copia",
  deleteEverything: "Elimina tutti i dati di apprendimento",
  deleteConfirm:
    "Eliminare tutte le conversazioni e le parole? Non si può annullare.",
  privacyNote:
    "Conversazioni, parole e impostazioni restano in questo browser. Nulla viene inviato a un server di Pancho.",

  welcome: "Ciao.",
  welcomeBody: "Impara una lingua parlando con qualcuno. Scegli da dove partire.",
  whichLanguage: "Quale lingua stai imparando?",
  whichSubtitles: "Quando ti serve una mano, mostra il significato in…",
  continueButton: "Continua",
  beginButton: "Inizia a parlare",

  micBlocked: "Pancho ha bisogno del microfono per ascoltarti.",
  micUnsupported:
    "Questo browser non può ancora ascoltare. Safari su iPhone e Chrome funzionano meglio; puoi comunque scrivere.",
  speechUnsupported: "Questo browser non ha ancora una voce per quella lingua.",
  keyNeeded: "Aggiungi la tua chiave API di Anthropic nelle Impostazioni per iniziare.",
  somethingWentWrong: "Qualcosa è andato storto. Riprova.",
};

const fr: Dictionary = {
  tagline: "L'appli de langues que tu finiras par supprimer.",
  talk: "Parler",
  themes: "Thèmes",
  words: "Mots",
  settings: "Réglages",
  close: "Fermer",
  done: "Terminé",
  cancel: "Annuler",

  everydayIn: (language: string) => `Un peu de ${language} chaque jour`,
  readyWhenYouAre: "Quand tu veux",
  listening: "J'écoute",
  isSpeaking: "Pancho parle",
  thinking: "Je réfléchis",
  micOn: "Micro activé",
  micOff: "Micro coupé",
  anyLanguageWelcome: "Ta langue est la bienvenue aussi.",
  meaning: "Sens",
  transcript: "Transcription",
  end: "Terminer",
  typeInstead: "Écrire",
  aLittleHelp: "Un petit coup de main",
  newConversation: "Nouvelle conversation",
  you: "Toi",
  sendPlaceholder: "Écris une réponse…",
  send: "Envoyer",
  tapTheOrb: "Touche le micro pour commencer",

  findConversation: "Chercher une conversation",
  aPlaceToBegin: "Par où commencer",
  whatsOnYourMind: "De quoi as-tu envie ?",
  sameFriend: "Le même ami. Ailleurs.",
  justTalk: "Juste parler",

  findWord: "Chercher un mot",
  littleByLittle: "Petit à petit",
  yourWords: "Tes mots.",
  familiarWords: "Des mots familiers, prêts pour une autre conversation.",
  noWordsYet:
    "Rien pour l'instant. Les mots apparaissent ici une fois que tu les utilises en parlant.",
  barsNote:
    "Les barres estiment le rappel à l'oral, pas une maîtrise définitive. Utiliser un mot avec les sens affichés compte comme une pratique assistée.",
  fragile: "Fragile",
  growing: "En progrès",
  steady: "Solide",
  newWord: "Nouveau",
  forget: "Oublier ce mot",

  learningLanguage: "J'apprends",
  subtitleLanguage: "Afficher le sens en",
  interfaceLanguage: "Langue de l'appli",
  interests: "Sujets dont tu aimerais parler",
  speechRate: "Vitesse de parole",
  slower: "Plus lentement",
  faster: "Plus vite",
  apiKey: "Ta clé API Anthropic",
  apiKeyHelp:
    "Conservée uniquement dans ce navigateur et envoyée uniquement à Anthropic. Obtiens-la sur console.anthropic.com.",
  apiKeySaved: "Clé enregistrée dans ce navigateur.",
  yourData: "Tes données",
  exportBackup: "Exporter une sauvegarde",
  importBackup: "Importer une sauvegarde",
  deleteEverything: "Supprimer toutes les données d'apprentissage",
  deleteConfirm:
    "Supprimer toutes les conversations et tous les mots ? C'est irréversible.",
  privacyNote:
    "Les conversations, les mots et les réglages restent dans ce navigateur. Rien n'est envoyé à un serveur Pancho.",

  welcome: "Bonjour.",
  welcomeBody: "Apprends une langue en parlant avec quelqu'un. Choisis par où commencer.",
  whichLanguage: "Quelle langue apprends-tu ?",
  whichSubtitles: "Quand tu as besoin d'aide, affiche le sens en…",
  continueButton: "Continuer",
  beginButton: "Commencer à parler",

  micBlocked: "Pancho a besoin du micro pour t'entendre.",
  micUnsupported:
    "Ce navigateur ne peut pas encore écouter. Safari sur iPhone et Chrome fonctionnent le mieux ; tu peux aussi écrire.",
  speechUnsupported: "Ce navigateur n'a pas encore de voix pour cette langue.",
  keyNeeded: "Ajoute ta clé API Anthropic dans les Réglages pour commencer.",
  somethingWentWrong: "Quelque chose s'est mal passé. Réessaie.",
};

const DICTIONARIES: Record<string, Dictionary> = { en, es, pt, it, fr };

export function strings(id: string): Dictionary {
  return DICTIONARIES[id] ?? en;
}

export type Strings = Dictionary;
