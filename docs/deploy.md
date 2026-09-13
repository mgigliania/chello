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

**The AI: whoever uses it pays.** By default each person enters their own
Anthropic API key the first time they open the app, and it is billed to them,
not to you. You pay nothing, no matter how many people you share the link with.

If you would rather cover it for a few close friends, see
[Paying for your friends](#paying-for-your-friends) at the bottom.

---

## Step 1 — Get a Vercel account

1. Go to [vercel.com/signup](https://vercel.com/signup).
2. Choose **Continue with GitHub** and sign in with the same GitHub account
   that owns this repository.
3. When it asks what kind of account, pick **Hobby** — that is the free one.

## Step 2 — Import the repository

The quickest way is the button in the [README](../README.md) — it opens Vercel
with the repository already selected. Otherwise, by hand:

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

## Step 3 — Open it and add your key

1. Click the link. You should see the Pancho welcome screen.
2. Go through the two setup screens — pick a language, pick a subtitle language.
3. On the last screen, paste an Anthropic API key.

To get a key: go to [console.anthropic.com](https://console.anthropic.com),
sign in, open **API keys**, and click **Create key**. You will need to add a
small amount of credit to the account — five dollars goes a very long way,
because Pancho only pays for text, never for audio.

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

## Paying for your friends

If you would rather nobody had to get their own key:

1. On Vercel, open your project and go to **Settings → Environment Variables**.
2. Add a variable named `ANTHROPIC_API_KEY` with your key as the value.
3. Go to the **Deployments** tab and redeploy the latest one so it picks the
   variable up.

Anyone who opens the link can now talk without entering anything, and every
conversation is billed to you.

**Be careful with this.** There is no sign-in, so anyone who has the link — or
finds it — can spend your credit. Only do it if you are sharing the link
privately, and set a monthly spending limit in the Anthropic console first.

---

## If something goes wrong

**"Add your Anthropic API key in Settings to start talking."**
The key is missing or was not saved. Open Settings, paste it again, and check
it begins with `sk-ant-`.

**"That API key was not accepted."**
The key is wrong, was revoked, or has no credit. Make a fresh one in the
Anthropic console and check the account's balance.

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
