# Veil launch posts (drafts)

Drafts only. Nothing here has been posted. Based on `GROWTH.md` (timeline, hooks, what not to do) and `docs/market-research.md` (what works on LinkedIn, HN and Reddit).

**Before posting anything**
- **Write the final text yourself.** These drafts were written by an AI agent, and Hacker News bans AI-written posts and comments outright: "Don't post generated text or AI-edited text" (https://news.ycombinator.com/newsguidelines.html, read 2026-10-08), so the Show HN section below is a list of facts, not a comment to paste. For X, LinkedIn and Reddit, use the drafts as notes and rewrite them in your own words.
- Wait until the listing is live. Replace `STORE-LINK` with `https://chromewebstore.google.com/detail/YOUR-ITEM-ID` plus the channel's tag, e.g. `?utm_source=reddit&utm_medium=social&utm_campaign=launch`. Sources: `x`, `linkedin`, `reddit`, `hn`.
- Site: `https://veil-privacy-three.vercel.app` (add `?utm_source=...` the same way).
- `REPO-LINK` only exists if you open-source the code (recommended in `GROWTH.md` so people can check the no-network claim; HN doesn't require it). Publish a fresh repo, not this one: this repo's history holds `GROWTH.md`, `launch/`, `docs/market-research.md` and the agent reports. Copy in only `extension/`, `test/`, `store/`, `site/`, `docs/spec.md`, `package.json`, `package-lock.json`, `README.md` and a `LICENSE` you choose, and check the commit author email before the first push. Without a repo, drop the repo lines and link the store listing on Show HN.
- Record the panic-key clip and GIF with a demo account and fake chats. Never show real chats.
- No "encrypted", "unhackable" or "100% secure". A few lines in the X, LinkedIn and Reddit drafts still overstate what the test proves or describe effort as yours; `AUDIT-PASS-2026-10-08.md` (veil-claims-03, -04) lists them. Fix them when you rewrite.
- The openers are generic on purpose. If a real moment made you build Veil, open with that instead: a true story beats a generic hook, and an invented one gets caught.

---

## X (thread of 3, ~day 1)

**1/3** (attach the 10–20 s panic-key clip)
```
Your coworkers can read your ChatGPT sidebar.

I built Veil: a free Chrome extension that blurs, hides and PIN-locks ChatGPT, Claude and Gemini.

Someone walks up? Alt+Shift+B and the whole page is blurred. Press it again to bring it back.
```

**2/3** (attach the lock-screen screenshot)
```
What it does:
• blurs your chat list and images by default, hover to peek
• right-click any chat → hide it
• hide every chat matching a keyword
• PIN lock that kicks in when you step away and after Chrome restarts
• Present mode for screen sharing
```

**3/3**
```
No account, no analytics, and it makes zero network requests. Its test suite fails if it ever makes one.

It's a privacy screen, not encryption: it hides what's on your screen, your chats stay in your account.

STORE-LINK
```

---

## LinkedIn (document post, ~day 1, weekday 3–8 pm your time)

Documents (PDF carousels) get the most reach on personal profiles. Make the carousel from the slides below with the store screenshots in `store/`, export as PDF, and upload it as a document. The link goes in the post itself: personal profiles barely lose reach for links.

**Post text** (~1,200 characters)
```
Ever shared your screen and realised your ChatGPT sidebar was on display for the whole meeting? Chat titles say a lot.

So I built Veil, a free Chrome extension for ChatGPT, Claude and Gemini:

→ Blurs your chat list and images by default. Hover to peek.
→ Right-click a chat to hide it, or hide everything matching a keyword.
→ PIN lock that turns on when you step away and every time Chrome restarts.
→ One key (Alt+Shift+B) blurs the whole page for screen sharing.

The part I spent the most time on was making "nothing leaves your device" provable, not just a line in the description:

1. The popup, settings page and background script run under a security policy that blocks network connections.
2. The test suite records every request Veil makes and fails if any goes anywhere except its own files.
3. The PIN is stored as a salted PBKDF2 hash, and the settings page says plainly that it's a privacy screen, not encryption.

One thing that surprised me: the Chrome Web Store counts data you only store locally as data you "handle", so the privacy form still has to list it. Being honest there matters more than looking clean.

It's free, no account, no tracking.
STORE-LINK

This is the first of a few small privacy tools I'm building that run entirely on your device. Next up: a checker that catches AI leftovers ("Certainly! Here's…") before you hit send.
```

Keep the last line only if you're really building the next tool (the AI-leftover checker ranked second in `docs/market-research.md`). Otherwise end on the store link.

**Carousel slides** (7)
1. "Your coworkers can read your ChatGPT sidebar." + Veil logo
2. The problem: screen shares, open offices, shared laptops (one line each)
3. Private mode screenshot: "Chat list and images blurred by default"
4. Lock screen screenshot: "PIN lock when you step away"
5. Hide screenshot: "Right-click to hide a chat. Keywords hide the rest."
6. "How I proved nothing leaves your device": a security policy that blocks connections from the extension's own pages + a test that fails on any request
7. "Free on the Chrome Web Store · Veil" + site URL

Follow-ups (2–3 a week, same topic so the feed learns who to show you to): what broke on launch week, the first user numbers, the store review story, the next tool.

---

## r/chrome_extensions (~day 2)

Notes for your own post, not text to paste (see "Before posting anything"). Read the sidebar rules first. If self-promotion goes in a weekly thread, post there instead.

**Title**
```
I made Veil: blur, hide and PIN-lock ChatGPT, Claude and Gemini (free, no network requests)
```

**Body** (attach the panic-key GIF)
```
Built this because the ChatGPT sidebar shows up in every screen share, and chat titles say a lot.

What it does:
- Private mode (default): blurs the chat list and images, hover to peek
- Present mode: blurs the whole page, for screen sharing. Alt+Shift+B toggles it
- Right-click a chat → "Hide this chat", or hide every chat matching a keyword
- PIN lock: Alt+Shift+L, plus auto-lock when you're idle and after Chrome restarts

Some details extension folks may care about:
- MV3, permissions are only storage, idle and contextMenus, and it runs only on the three chat sites
- No network requests: extension pages have connect-src 'none' in their CSP, and the e2e test (Playwright) fails if any request leaves
- PIN is PBKDF2-hashed with a random salt; lock state lives in storage.session so it re-locks when Chrome restarts
- Site selectors live in one file; the popup shows "Check layout" when a site redesign breaks them

Limits: it's a privacy screen, not encryption. Anyone with access to chrome://extensions can turn it off.

STORE-LINK

Feedback welcome, especially if a site's layout breaks it.
```

---

## r/SideProject (~day 2)

Notes for your own post, not text to paste (see "Before posting anything").

**Title**
```
Your ChatGPT sidebar shows up in every screen share, so I built a free extension that blurs and PIN-locks it
```

**Body** (attach the GIF)
```
The problem: every time you share your screen, your ChatGPT sidebar is right there. Chat titles say a lot.

Veil is a free Chrome extension for ChatGPT, Claude and Gemini:
- blurs the chat list and images by default (hover to peek)
- one key blurs everything when someone walks up
- right-click to hide specific chats, or hide by keyword
- PIN lock when you step away

What I learned building it:
- These sites redesign often, so every site-specific selector lives in one file, and the popup tells you when one stops matching
- "Nothing leaves your device" is easy to say. I made it a test: the suite fails if Veil makes any network request
- The Chrome Web Store treats data stored only on your device as data you handle, so the privacy form still lists it

No account, no analytics, free. STORE-LINK

Happy to answer anything about building and publishing an MV3 extension.
```

---

## Show HN (~day 5)

Link the **repo** (REPO-LINK) if the code is public, otherwise the store listing. Not the landing page: Show HN is for "something you've made that other people can play with" and says "Don't post landing pages" (https://news.ycombinator.com/showhn.html, read 2026-10-08). HN bans generated text, so write the title and the first comment yourself, in your own words, and post the comment right after submitting.

**Title** (limit 80 characters; reword it yourself). Current idea: `Show HN: Veil – Blur and PIN-lock ChatGPT, Claude and Gemini, fully local`

**Facts to draw on** (true of the code today; write the comment yourself, HN bans generated text)
- Why you built it: only you can say. Leave it out rather than borrow a reason.
- Manifest V3. Runs only on chatgpt.com, claude.ai and gemini.google.com. Permissions: `storage`, `idle`, `contextMenus`.
- Blur is plain CSS: `html[data-veil~="side"] :is(<site selectors>) { filter: blur() }`. `:is()` takes a forgiving selector list, so one invalid selector doesn't drop the whole rule.
- Present mode and the lock screen use a fixed `backdrop-filter` layer, not the site selectors, so they keep working when a redesign breaks the selectors.
- The overlay lives in a closed shadow root. While locked: the page is `inert`, keys are stopped before the page's scripts see them (including the PIN typed into the lock box), the tab title is masked and printing comes out blank.
- After an update, tabs still running the old copy cover themselves until reloaded. If settings take more than 1.5 s to load, the page stays covered.
- PIN: PBKDF2-SHA256, 200k iterations, random salt; a 30 s wait after 5 wrong tries. Unlock state is in `chrome.storage.session`, which Chrome wipes on restart; that wipe is what re-locks it.
- PIN limits: the hash only slows guessing at the lock screen. Anyone who can read the Chrome profile can brute-force a 4–8 digit PIN offline (the stored PIN length tells them how many digits), and the lockout trusts the system clock.
- No network requests: the popup, settings page and service worker run under a CSP with `connect-src 'none'`. Content scripts run under the site's own CSP, so the Playwright e2e test covers them: it records every request from the page, popup, settings and service worker during a full run against a stand-in chatgpt.com page and fails on anything that isn't the extension's own files. There's no CI, so it runs when someone runs it.
- What it isn't: encryption. It's a privacy screen. Anyone with access to `chrome://extensions` can turn it off, and the chats stay in the account as usual.

---

## Not in these posts, on purpose

- **Donation links.** They go on the site, in the README and in one line of the store description, not in launch posts (HN and most subreddits frown on it).
- **Asking for upvotes, ratings or comments.** Banned on HN and Product Hunt, risky on the Chrome Web Store, and demoted on LinkedIn.
- **The same text in several subreddits.** Each post above is written for its audience. Write fresh ones for r/ChatGPT, r/ClaudeAI and r/GeminiAI after reading their rules (`GROWTH.md` days 3–4).
