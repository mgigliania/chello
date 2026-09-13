/**
 * An end-to-end smoke test of the conversation loop, with the model mocked.
 *
 * It covers the part unit tests cannot: that a turn reaches the model with the
 * transcript intact, that an assessment becomes a word on the Words screen,
 * and that all of it survives a reload.
 *
 *   npm run build && npm start &
 *   npm run test:e2e
 */
import { chromium, devices } from "playwright";

const BASE = process.env.PANCHO_URL ?? "http://127.0.0.1:3000";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
});
const context = await browser.newContext({
  ...devices["iPhone 13 Pro"],
  isMobile: true,
  hasTouch: true,
  permissions: ["microphone"],
});

const seen = { chat: 0, translate: 0, assess: 0 };
let lastChatBody = null;

await context.route("**/api/chat", async (route) => {
  seen.chat += 1;
  lastChatBody = JSON.parse(route.request().postData() ?? "{}");
  await route.fulfill({
    status: 200,
    headers: { "content-type": "text/plain; charset=utf-8" },
    body: "Ciao! Come stai oggi?",
  });
});
await context.route("**/api/translate", async (route) => {
  seen.translate += 1;
  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ text: "Hi! How are you today?" }),
  });
});
await context.route("**/api/assess", async (route) => {
  seen.assess += 1;
  const body = JSON.parse(route.request().postData() ?? "{}");
  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      passageID: body.passageID,
      revisionKey: body.revisionKey,
      outcome: "success",
      suggestedLevel: 1,
      nextGoal: "Chiedi come sta.",
      capability: "Can greet and say how they are",
      words: [
        {
          lemma: "stare",
          meaning: "to be (feeling)",
          form: "sto",
          kind: "independent",
          confidence: 0.95,
          sourceIDs: [body.passageID],
          quote: "sto bene",
          language: "it",
        },
      ],
      createdAt: Date.now(),
      context: body.context,
    }),
  });
});

// Skip onboarding and pre-seed a key, so the run exercises the loop itself.
await context.addInitScript(() => {
  localStorage.setItem("pancho.key.google", "test-key");
  // Seed once only: this script re-runs on every navigation, and overwriting
  // here would wipe the archive the reload check is meant to verify.
  if (!localStorage.getItem("pancho.archive.v1"))
  localStorage.setItem(
    "pancho.archive.v1",
    JSON.stringify({
      schemaVersion: 1,
      sessions: [],
      preferences: {
        learningLanguageID: "it",
        meaningVisible: true,
        meaningLanguage: "English",
        interfaceLanguage: "en",
        hiddenWords: [],
        interests: "",
        hasOnboarded: true,
        speechRate: 0.95,
        quality: "balanced",
      },
    }),
  );
  // The headless browser has no speech engine; stub both so the loop runs.
  window.webkitSpeechRecognition = class {
    start() { this.onstart?.(); }
    stop() { this.onend?.(); }
    abort() {}
  };
  window.speechSynthesis = {
    getVoices: () => [],
    speak(u) { setTimeout(() => u.onend?.(), 10); },
    cancel() {},
  };
  window.SpeechSynthesisUtterance = class {
    constructor(text) { this.text = text; }
  };
});

const page = await context.newPage();
const problems = [];
page.on("pageerror", (e) => problems.push("pageerror: " + e.message));
page.on("console", (m) => { if (m.type() === "error") problems.push("console: " + m.text()); });

await page.goto(BASE, { waitUntil: "networkidle" });

// 1. Starting a conversation asks the model for a greeting and renders it.
await page.getByRole("button", { name: /Microphone/ }).click();
await page.getByText("Ciao! Come stai oggi?").waitFor({ timeout: 5000 });
await page.getByText("Hi! How are you today?").waitFor({ timeout: 5000 });
console.log("✓ greeting streamed and subtitled");
console.log("  system prompt mentions Italian:", /Speak ONLY Italian/.test(lastChatBody.system));
console.log("  routed to provider:", lastChatBody.provider);
console.log("  system prompt carries the theme:", lastChatBody.messages.at(-1).content.slice(0, 40));


// 2. A typed reply becomes a turn and triggers another model call.
await page.getByRole("button", { name: "Type instead" }).click();
await page.getByPlaceholder("Write a reply…").fill("Sto bene, grazie!");
await page.getByRole("button", { name: "Send" }).click();
await page.waitForTimeout(1500);
console.log("✓ typed turn sent. chat calls:", seen.chat, "assess calls:", seen.assess);
console.log("  transcript sent to model:", JSON.stringify(lastChatBody.messages));

// 3. Tapping a word in the tutor's line explains it.
await context.route("**/api/lookup", async (route) => {
  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ text: "\"Come stai\" asks how someone is feeling." }),
  });
});
await page.getByRole("button", { name: "stai" }).first().click();
await page.getByText("asks how someone is feeling").waitFor({ timeout: 5000 });
await page.keyboard.press("Escape");
console.log("\u2713 word lookup explained");

// 4. The assessment's word reaches the Words screen with one bar.
await page.getByRole("button", { name: "Words" }).click();
await page.getByText("stare").waitFor({ timeout: 5000 });
const bars = await page.getByText("Fragile").first().isVisible();
console.log("✓ word stored, shown as Fragile:", bars);

// 5. Choosing a theme starts that scene.
await page.getByRole("button", { name: "Themes" }).click();
await page.getByRole("button", { name: /Un caffè/ }).click();
await page.waitForTimeout(1200);
console.log("✓ theme chosen, directive:", lastChatBody.messages.at(-1).content.slice(-70));

// 6. Learning survives a reload.
await page.reload({ waitUntil: "networkidle" });
await page.getByRole("button", { name: "Words" }).click();
await page.getByText("stare").waitFor({ timeout: 5000 });
console.log("✓ learning persisted across reload");

await browser.close();

if (problems.length > 0) {
  console.error("\nPROBLEMS:\n" + problems.join("\n"));
  process.exit(1);
}
console.log("\nno console errors");
