# Putting Pancho online, for free

This takes about ten minutes and costs nothing. You do not need to install
anything or use a terminal.

At the end you will have a link like `https://pancho.vercel.app` that you can
send to anyone. On an iPhone they can add it to the home screen and it behaves
like a normal app.

---

## What it will cost

**Hosting: free.** Vercel's Hobby plan is free for personal projects and this
app fits inside it comfortably.

**The AI: free.** Pancho ships with two free providers and one paid one. The
default is Google Gemini, whose free tier needs no card and does not expire.
Each person who uses your link enters their own key, so nothing reaches your
bill even if you switch to the paid option yourself.

The free tiers have daily caps (Gemini: about 1,500 requests a day, which is
far more than one person can talk through). If you hit one, Settings lets you
switch to the other free provider in two taps.

---

## Step 1 — Get a Vercel account

1. Go to [vercel.com/signup](https://vercel.com/signup).
2. Choose **Continue with GitHub** and sign in with the same GitHub account
   that owns this repository.
3. When it asks what kind of account, pick **Hobby** — that is the free one.

## Step 2 — Import the repository

There is a shortcut button in the [README](../README.md) that jumps straight to
the import screen. If it does not work, do it by hand — this always works:

1. On your Vercel dashboard, click **Add New… → Project**.
2. Find **chello** in the list of your repositories and click **Import**.
   - The repository is still called `chello`; only the app was renamed to
     Pancho. Renaming the repository on GitHub is optional and can wait until
     after the first deploy — Vercel follows the new name automatically.
   - If you do not see it, click **Adjust GitHub App Permissions** and give
     Vercel access to the repository.
3. Leave every setting alone. Vercel recognises Next.js and fills in the build
   settings by itself.
4. Click **Deploy**.

Wait about a minute. When it finishes you will see a screen with a preview
image and a link.

### One tidy-up worth doing

Your repository's **default branch** is currently `claude/personal-ai-agent-app-f03pk2`
rather than `main`. Vercel deploys whichever branch is the default, so this
changes nothing today — both branches hold exactly the same app. But it means
future changes made on `main` would not reach your live site.

To fix it, on GitHub: **Settings → General → Default branch → the ⇄ switch
icon → choose `main` → Update**. Do it before or after deploying; either is
fine.

## Step 3 — Open it and add your key

1. Click the link. You should see the Pancho welcome screen.
2. Go through the two setup screens — pick a language, pick a subtitle language.
3. On the last screen, paste an Anthropic API key.

To get a free key: go to
[aistudio.google.com/apikey](https://aistudio.google.com/apikey), sign in with
a Google account, and click **Create API key**. There is no card to enter and
nothing to pay.

The key you get will start with **`AQ.Ab`**. That is correct — Google moved to
these "auth keys" during 2026 and is retiring the older `AIza` ones. Both work
with Pancho; new keys are all `AQ.`. Copy the whole thing, dots included.

Prefer something else? Settings has **Groq** (also free, and the fastest of the
three) and **Claude** (paid, and the best teacher). You can switch whenever,
and each service keeps its own key, so you never retype one.

4. Tap **Start talking**, allow the microphone, and say hello.

## Step 4 — Put it on your home screen

On an iPhone, in Safari:

1. Open your Pancho link.
2. Tap the **Share** button (the square with the arrow).
3. Scroll down and tap **Add to Home Screen**.

It now has its own icon and opens without Safari's address bar.

On Android, Chrome offers **Install app** in its menu.

## Step 5 — Send it to your friends

Just send them the link. Each of them goes through the same two setup screens
and enters their own key. Their conversations and words stay on their own
phone — you cannot see them and neither can anyone else.

---

## Changing the name

The name appears in four places:

- `components/Brand.tsx` — the wordmark in the top left
- `app/layout.tsx` — the browser tab and the home-screen name
- `public/manifest.webmanifest` — the installed app's name
- `lib/i18n.ts` — the lines the app says about itself, in all five languages

The tutor also introduces itself by name to the model in `lib/teaching.ts`.

Edit those, commit, and Vercel redeploys automatically within a minute. To
change the web address, open your project on Vercel, go to **Settings →
Domains**, and rename it or add a domain you own.

---

## Sparing your friends the setup

If you would rather nobody had to get their own key:

1. On Vercel, open your project and go to **Settings → Environment Variables**.
2. Add a variable named for the provider you want everyone to use —
   `GOOGLE_API_KEY`, `GROQ_API_KEY`, or `ANTHROPIC_API_KEY` — with your key as
   the value.
3. Go to the **Deployments** tab and redeploy the latest one so it picks the
   variable up.

Anyone who opens the link can now talk without entering anything, and every
conversation runs against your allowance.

**Be careful with this.** There is no sign-in, so anyone who has the link — or
finds it — can use it up. With a free provider the worst case is that your
daily cap is spent by strangers; with Claude it costs you real money, so set a
spending limit in the console first.

---

## If something goes wrong

**"Add a key in Settings to start talking."**
The key is missing or was not saved. Open Settings, check the right service is
selected, and paste it again.

**"That … key was not accepted."**
The key is wrong, was revoked, or belongs to a different service than the one
selected. Each provider has its own key slot — a Google key in the Claude slot
will not work. Pancho also warns you as you paste if a key does not look like
it belongs to the selected service.

**"… free allowance is used up for now."**
You hit the daily or per-minute cap. Wait, or switch to the other free provider
in Settings.

**"… does not know that model name."**
A provider retired that model. Open Settings, clear the **Model name** box to
go back to the default, or type the current name from the provider's docs.

**"Pancho needs microphone access to hear you."**
Safari asks once. If you said no, go to **Settings → Safari → Microphone** on
the phone, or tap the "aA" button in the address bar and choose **Website
Settings**.

**"This browser can't listen yet."**
You are probably in Firefox, which cannot do speech recognition. Use Safari or
Chrome. You can still type in any browser.

**It hears you but never replies.**
Almost always the API key. Check the Anthropic console for a spending limit or
an empty balance.

**Nothing is spoken aloud.**
Check the phone's silent switch and volume, and that your device has a voice
installed for the language — on iPhone, **Settings → Accessibility → Spoken
Content → Voices**.
