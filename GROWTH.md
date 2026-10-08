# Veil: getting the first users (no ad budget)

The goal for the first 90 days: **1,000 weekly users and 20+ honest ratings**. At that point the store's own search starts doing most of the work.

## Where you stand

The niche is real and nobody owns it yet. The closest extensions are tiny:

| Extension | Users | What it lacks next to Veil |
|---|---|---|
| DontLook – Privacy Blur | ~59 | ChatGPT only, no lock |
| ChatGPT History Blur | ~53 | Blurs the sidebar only |
| Peekaboo | ~14 | Blur only |
| Blur History, BlurGPT, AI Chat Privacy Guard, chatgpt-shroud | small | No PIN lock, no per-chat hiding |

**Your pitch, in one line:** *the only one that PIN-locks your AI chats, hides specific conversations, and works on ChatGPT, Claude and Gemini, with zero network requests.* Lead with the lock and the panic key, because they're the easiest features to show in a 10-second clip.

## Who it's for (and the line that hooks each)

| Person | Hook |
|---|---|
| Office worker in an open-plan space | "Your coworkers can read your ChatGPT sidebar." |
| Anyone who screen-shares (sales, consultants, teachers, devs) | "Share your screen without sharing your chat history." |
| Streamers and tutorial makers | "Record AI tutorials without blurring in post." |
| Shared or family computer | "Lock ChatGPT with a PIN, like an app on your phone." |
| Train / café laptop users | "One key and everything's blurred." |

## 1. The store listing does most of the selling

Most installs will come from people typing into Chrome Web Store search. People search phrases like:

`hide chatgpt history` · `blur chatgpt` · `chatgpt privacy` · `lock chatgpt` · `password protect chatgpt` · `chatgpt screen share` · `hide chats` · `claude privacy` · `gemini privacy`

- The name and summary already contain the main ones. Keep them.
- Use each phrase naturally, once, in the description. Repeating a word over and over counts as keyword spam (see sources). The description in `PUBLISHING.md` already follows this.
- The first screenshot carries the listing. Swap screenshot order later if analytics show low page-view → install conversion.
- **Reply to every review** from the dashboard, especially bad ones. A fixed bug plus a polite reply often turns into an edited 5-star.

**Ratings, the safe way:** ask only real users, for example someone who thanks you on Reddit or emails you. Don't ask friends or family, don't rate it yourself, and never trade, pay for or reward reviews. The store treats ratings from people connected to you as manipulation and can take the listing down.

## 2. Launch timeline

### While it's in review
- Deploy `site/` and set up the support email (`PUBLISHING.md` step 4).
- Record **three screen clips**, 10–20 seconds each, in 16:9 and 9:16: the panic key (`Alt+Shift+B`), the PIN lock screen, and right-click → hide a chat. Make a GIF of the panic key for Reddit and X. Use a demo account with fake chats; never show real chats.
- Write one launch post ("I built X because Y, here's what it does, here's what it doesn't") and adapt it per channel.
- **Decide on open source.** Putting the code on GitHub lets anyone verify "nothing leaves your device", which is your strongest claim, and makes a Show HN possible. Recommended.

### Week 1: launch
| Day | Do |
|---|---|
| 1 | Listing goes public. Finish the site (`PUBLISHING.md` 7b). Post on your own X and LinkedIn with the panic-key clip. |
| 2 | r/chrome_extensions and r/SideProject. Answer every comment within the day. |
| 3–4 | r/ChatGPT, r/ChatGPTPro, r/ClaudeAI, r/GeminiAI, but **read each sub's rules first**. Several allow self-promotion only in a weekly thread or need mod approval. Post the GIF plus a short "built this, feedback welcome". |
| 5 | Show HN (only if open source): `Show HN: Veil – blur and PIN-lock ChatGPT, Claude and Gemini, no network requests`. Stay in the thread all day. |
| 6–7 | Submit to the directories below. |

### Weeks 2–4
- **Product Hunt:** launch on a Tuesday–Thursday at 12:01 am Pacific. Use the store images as the gallery, the panic-key clip as the video, and post a first comment on why you built it. Tell your own followers it's live, but don't ask anyone to upvote: PH penalizes that.
- **Short video:** 3–5 clips a week on TikTok, Reels and Shorts. Format: a relatable moment ("POV: you're screen-sharing and your ChatGPT sidebar says…"), then the panic key, then the name. The first second has to show the problem.
- **Answer existing questions.** Search Reddit, Quora and the OpenAI community forum for "hide chatgpt history", "password protect chatgpt" and "blur chatgpt screen share". Give a genuinely useful answer (mention the built-in options too, like archiving or temporary chats), then mention Veil and say you made it.
- **Ship 1.0.1 fast** with whatever first users report. A quick fix and a reply in the same thread builds more trust than any post.

### Months 2–3
- **Four articles on the site**, each answering one search question honestly and then showing Veil:
  - How to hide your ChatGPT history from people around you
  - How to blur ChatGPT when screen sharing in Zoom, Meet or Teams
  - Can you password-protect ChatGPT, Claude or Gemini?
  - Using AI chats safely on a shared computer
- **Microsoft Edge Add-ons:** the same `veil.zip` works. Registration is free, and it's a second store with less competition.
- **Localized listings:** the dashboard lets you add a description per language. Start with Spanish, Portuguese, German, French and Japanese. Translate the extension's own UI later, and only if those countries show up in analytics.
- **Small creators:** email 10–20 YouTubers and newsletter writers who cover AI tools or productivity, with 1k–50k followers. Small creators reply. Send the clip, a one-line pitch, and no ask beyond "free to try if it's useful".

## 3. Directories (one afternoon, free tiers)

AlternativeTo (list it as an alternative to the competitors above) · There's An AI For That · Futurepedia · Toolify · SaaSHub · BetaList · Uneed · Indie Hackers (post a launch story) · Product Hunt (above)

Use the same short description, the icon, the marquee image and the store link everywhere.

## 4. Measuring it

In the dashboard, **Analytics** shows installs and uninstalls, impressions and page views, weekly users and ratings.

- **Tag every link you post** so the dashboard shows which channel worked. It breaks page views down by UTM source:
  `https://chromewebstore.google.com/detail/YOUR-ITEM-ID?utm_source=reddit&utm_medium=social&utm_campaign=launch`
  Use one `utm_source` per channel: `reddit`, `hn`, `producthunt`, `x`, `linkedin`, `tiktok`, `site`, `directory`.
- **The numbers that matter:**
  - **Weekly users:** the real user count.
  - **Installs ÷ page views:** whether the listing convinces people. If it's low, change the first screenshot or the summary.
  - **Uninstalls in the first days:** usually a broken site or confusion. Recheck the status pill on all three sites.
- Once a week, write down weekly users, rating count, and the best channel. Do more of what worked and drop the rest.

## 5. What not to do

- Fake, paid, swapped or incentivized reviews and installs, and ratings from friends or family. This can get the listing removed.
- Keyword stuffing, or using OpenAI, Anthropic or Google logos, or anything that implies Veil is official.
- Copy-pasting the same post across subreddits, cold DMs, or posting where the rules say no.
- Paid "install" services or traffic exchanges.
- Claims you can't back up, like "encrypted" or "unhackable". Veil is a privacy screen and the copy says so.
- **Adding analytics, ads or a server later without updating the privacy policy and the listing first.** "Nothing leaves your device" is the product; breaking it breaks trust.

## 6. Decisions only you can make

1. **The name.** At least six extensions already use "Veil", including a WhatsApp privacy one and Veilpage. Search isn't the problem because the store name carries the keywords. The risk is being hard to find by name and harder to get a domain. Options:
   - Keep "Veil" and pick a domain like `getveil.app` or `veilchat.app`. Check availability first.
   - Rename before launch, while it costs only a find-and-replace.
2. **Domain or free subdomain.** `github.io` is fine to start. A custom domain (~$10–15/year) looks more trustworthy and keeps the article links if you change hosts.
3. **Open source:** recommended, as noted above.
4. **Building in public** under your own name on X or LinkedIn: weekly user numbers, what broke, what you shipped. This is the cheapest channel there is, and it compounds.

## Weekly routine after launch (about 3 hours)

| Task | Time |
|---|---|
| Reply to reviews, emails and comments | 30 min |
| 3 short clips | 1 h |
| 1 helpful answer per day in existing threads | 1 h |
| Check analytics, note the numbers, fix the top complaint | 30 min |

## Sources

- Competitors:
  - DontLook: https://chromeboard.com/extension/dontlook-privacy-blur-for-anjeoldebhpnkjcplddldlbbeilfhdoi
  - Peekaboo: https://chromeboard.com/extension/peekaboo-chatgpt-privacy-mloaapjbhaopofjpcihoacjanjdejmcg
  - ChatGPT History Blur: https://www.extscope.org/extension/loofpfbihldapeahnbepgaomfokcnlgb
  - https://chromewebstore.google.com/detail/ghgldeodfigdljjbaojiokknipihoeih
- Name collisions:
  - https://chromeboard.com/extension/veil-lljcneaeakpgdpmbhinpelghaljpceii
  - https://www.chromeboard.com/extension/veil-—-privacy-shield-for-kmipfhoojldakaabgkblkodipiikilhf
  - https://chromeboard.com/extension/veilpage-hmdakafcconlnacfkgdjpcjfigikiche
- Chrome Web Store spam policy (keyword spam, ratings, incentives): https://developer.chrome.com/docs/webstore/program-policies/spam-faq
- Dashboard analytics and UTM breakdown: https://developer.chrome.com/blog/cws-analytics-revamp
