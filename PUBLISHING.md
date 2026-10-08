# Veil: test, package and publish

Everything you need to go from this folder to a live Chrome Web Store listing. Steps marked **(you)** need your own Google account or payment, so only you can do them.

```
extension/        the extension itself (this folder is what gets zipped and uploaded)
store/            store images and the script that builds them
site/             landing page + privacy policy (static, deploy as-is)
test/             unit tests, end-to-end test, stand-in chat page
docs/spec.md      what Veil does and how it is built
GROWTH.md         how to get the first users after launch
```

---

## 1. Try it in your own Chrome (2 minutes)

1. Open `chrome://extensions`.
2. Turn on **Developer mode** (top right).
3. Click **Load unpacked** and choose the `extension` folder.
4. Pin Veil: puzzle-piece icon in the toolbar, then the pin next to Veil.
5. A welcome page opens. Set a PIN there if you want Lockdown and auto-lock.

**Check each site you use.** Open chatgpt.com, claude.ai and gemini.google.com while logged in, then click the Veil icon:

| Status pill | Meaning |
|---|---|
| `ChatGPT · Armed` (green) | Veil found the chat list and input box. All good. |
| `Check layout` (yellow) | The site changed its page structure. Hover the pill to see what is missing. |
| `Not on this site` | You're not on one of the three sites. |

If you see **Check layout**, open the site, right-click the part that isn't being found, choose **Inspect**, and update that site's selectors in `extension/content/sites.js`. Every site-specific selector lives in that one file. Then click the reload icon on Veil's card in `chrome://extensions`.

Also try: right-click a chat in the sidebar and choose **Hide this chat (Veil)**, press `Alt+Shift+B` (panic blur) and `Alt+Shift+L` (lock). On a Mac, `Alt` is `Option`.

After editing any file, click reload on Veil's card in `chrome://extensions`, then refresh the chat tab.

## 2. Run the tests (optional, needs Node 20+)

```bash
npm install
npx playwright install chromium
npm test              # unit tests: modes, chat IDs, keyword hiding, PIN lockout
npm run test:e2e      # loads the real extension in Chromium and drives every feature
npm run assets        # re-runs e2e, rebuilds store/*.jpg, site/og.jpg and site/img/*.png
```

The e2e test uses a stand-in chat page (`test/fixtures/chat.html`), not the real sites, so it can't catch a real site's layout change. Section 1 covers that.

## 3. Build the upload file

```bash
npm run zip
```

This creates `veil.zip` with `manifest.json` at its root, which is what the store expects. Without npm: `cd extension && zip -r ../veil.zip . -x '*.DS_Store'`.

## 4. Put the website online (you)

The store requires a public privacy policy URL. `site/` holds the landing page and the policy (`site/privacy.html`), so one deploy covers both. Every path in it is relative, so it works on a subpath like `github.io/veil/`.

1. Replace `YOUR-EMAIL@example.com` with a support address in `site/index.html` (2×) and `site/privacy.html` (2×). Use one you'll actually read: store reviewers and users write to it.
2. Deploy the `site` folder. **Already done on Vercel:** project `veil-privacy`, live at https://veil-privacy-three.vercel.app. After editing anything in `site/`, redeploy with `cd site && vercel deploy --prod`. Other hosts if you ever move:
   - **GitHub Pages:** create a public repo, put the *contents* of `site/` at its root, then **Settings → Pages → Deploy from a branch**, `main`, `/ (root)`. Live at `https://YOUR-USERNAME.github.io/REPO/`.
   - **Netlify Drop / Cloudflare Pages / Vercel:** drag the `site` folder onto their deploy page. Free, and adding your own domain later is one setting.
3. Your privacy policy URL is `https://veil-privacy-three.vercel.app/privacy.html`. Open it in a private window to check it loads without signing in.

With the GitHub CLI instead (run from this folder):
```bash
gh repo create veil-site --public --clone
```
```bash
cp -R site/. veil-site/ && cd veil-site && git add . && git commit -m "Veil site" && git branch -M main && git push -u origin main
```
```bash
gh api -X POST "repos/{owner}/veil-site/pages" -f "source[branch]=main" -f "source[path]=/"
```

The **Add to Chrome** buttons point at `YOUR-ITEM-ID` until the store gives you an ID in step 6. That's fine: reviewers only need the privacy page. Section 7b fixes the links.

## 5. Register as a Chrome Web Store developer (you)

1. Go to the developer dashboard: https://chrome.google.com/webstore/devconsole
2. Sign in with the Google account that should own the listing. Moving a listing to another account later is hard, so pick carefully.
3. Accept the developer agreement and pay the **one-time US$5 registration fee**.
4. Turn on **2-Step Verification** for that Google account. Publishing requires it.
5. In **Account**, set and **verify your contact email**. You can't publish until it's verified.
6. Answer the **trader / non-trader** question (an EU requirement). A free personal project with no business behind it is usually "non-trader". If you're a business, choose trader and fill in the contact details it asks for.

New developer accounts can only have a small number of published items at first (see the policy update in the sources), so Veil should be fine as your first one.

## 6. Upload and fill in the listing (you)

In the dashboard, click **New item**, upload `veil.zip`, then work through the tabs on the left.

### Store listing tab

| Field | What to enter |
|---|---|
| Description | Paste the block below |
| Category | **Privacy & Security** |
| Language | English |
| Store icon | `extension/icons/icon128.png` |
| Screenshots | `store/screenshot-1-private.jpg` … `screenshot-4-present.jpg`, in that order |
| Small promo tile | `store/promo-small-440x280.jpg` (required) |
| Marquee promo tile | `store/promo-marquee-1400x560.jpg` (optional, used if Google features Veil) |
| Homepage URL | Your site from step 4 |
| Support URL | Your site, or `mailto:` your support address |

The name and short summary come from `manifest.json` automatically.

**Description** (copy everything inside the box):

```
Use ChatGPT, Claude and Gemini in public without showing your private chats.

Veil blurs the parts of the page you choose, hides chats you don't want seen, and locks the whole page behind a PIN when you step away. No account, no tracking, and nothing ever leaves your device.

ONE-CLICK MODES
• Private: blurs your chat list and images. The default.
• Present: blurs everything at once, for screen sharing or when someone walks up.
• Custom: pick exactly which areas.
• Off: pause Veil on all sites.

BLUR EACH AREA SEPARATELY
Chat list, conversation, input box and images each have their own switch. Adjust the strength, and hover over anything to peek at it.

HIDE SPECIFIC CHATS
Right-click any chat in the sidebar and choose "Hide this chat (Veil)", or hide the chat you have open from the Veil button. Add keywords to hide every chat whose title matches. Hidden chats disappear from the sidebar list, and with a PIN set, showing them there again needs it. The site's own chat search, a direct link to the chat and Chrome's history can still show them.

PIN LOCK AND AUTO-LOCK
Press the Lockdown button or Alt+Shift+L. Veil locks again when your computer goes idle and every time Chrome restarts. Wrong guesses are slowed down.

BLURS WHEN YOU STEP AWAY
Switch tabs or leave your computer and Veil covers the page until you come back.

KEYBOARD SHORTCUTS
• Alt+Shift+B: panic blur (press again to undo)
• Alt+Shift+L: lock now
• Alt+Shift+M: switch to the next mode
Change them at chrome://extensions/shortcuts.

PRIVATE BY DESIGN
• Runs only on chatgpt.com, claude.ai and gemini.google.com.
• Makes no network requests. Fonts and icons are built in.
• Settings stay in your browser and are deleted when you remove Veil.
• Free, with no account and no analytics.

Veil changes only what is shown on your screen. Your chats stay in your ChatGPT, Claude or Gemini account as usual. The PIN lock is a privacy screen for people near your computer, not encryption: anyone who can use your computer can still turn Veil off in Chrome's extension settings.

Already have one of the sites open when you install or update Veil? Reload that tab.

Veil is an independent project and is not affiliated with or endorsed by OpenAI, Anthropic or Google.
```

### Privacy tab

**Single purpose:**
```
Veil hides private content on ChatGPT, Claude and Gemini from people who can see your screen: it blurs chosen parts of the page, hides chats you select, and locks the page with a PIN.
```

**Permission justifications:**

| Permission | Justification to paste |
|---|---|
| `storage` | `Saves the user's Veil settings, the list of chats they chose to hide, their hide keywords, and a salted hash of their PIN, locally on the device. Session storage remembers whether the user has unlocked Veil until Chrome closes.` |
| `idle` | `Detects when the computer has been idle for the time the user chose, so Veil can lock the chat page (if a PIN is set) or blur it.` |
| `contextMenus` | `Adds a "Hide this chat (Veil)" item to the right-click menu on chatgpt.com, claude.ai and gemini.google.com so the user can hide a chat from the sidebar.` |
| Host permission (content scripts on chatgpt.com, claude.ai, gemini.google.com) | `Veil must run on these three AI chat sites to blur the chat list, conversation, input box and images, hide chats the user selected, and show the PIN lock screen. It runs on no other site and sends no data anywhere.` |

**Remote code:** choose **No, I am not using remote code.** All JavaScript ships inside the package.

**Data usage:** the store counts data that is only stored on the device as data you handle: its FAQ says extensions must disclose "even when data is processed or stored locally", and a disclosure that doesn't match the extension's behaviour is a policy violation. Tick exactly these three boxes:

| Box | Why |
|---|---|
| **Authentication information** | Veil stores a salted hash of the user's PIN, on the device only. |
| **Website content** | Veil reads chat titles on the three sites to hide matching chats, and stores the titles of chats the user chose to hide, on the device only. |
| **User activity** | Veil checks whether the computer is idle and listens for a mouse move or key press to remove the "you stepped away" blur. It records no keys or positions. Ticked to be safe: the store's examples for this box include clicks, mouse position and keystrokes, and over-disclosing costs nothing while under-disclosing is a violation. |

Leave the rest unticked. Then tick all three certifications (no selling or transferring data, no unrelated use, no creditworthiness or lending use). The listing will show those three categories next to "not sold to third parties", and the privacy policy explains that all of it stays on the device.

**Privacy policy URL:** `https://veil-privacy-three.vercel.app/privacy.html`

If the dashboard shows a **Test instructions** field, paste:
```
No Veil account is needed. Open chatgpt.com, claude.ai or gemini.google.com with any free account. The chat list and images are blurred by default (Private mode). Click the Veil toolbar button to change modes. To test the lock: open Veil's settings (gear icon), set a PIN, then press Alt+Shift+L on the chat page and type the PIN to unlock. Right-click a sidebar chat and choose "Hide this chat (Veil)" to hide it.
```

### Distribution tab

- Payments: **Free**.
- Visibility: **Public**. Choose **Unlisted** first if you want to share it with a few people via link before going public.
- Regions: **All regions**.

### Submit

Click **Submit for review**. You can tick **publish automatically after review**, or untick it to publish by hand once it's approved.

## 7. Review

- Most reviews finish within a few days. A brand-new developer account, or an extension that runs on sites (Veil does), can take longer.
- You'll get an email when it's approved or rejected. Rejections name the policy and you can fix and resubmit.
- What this package already does to avoid the usual rejections: requests only the permissions it uses, has no remote code, gives each permission a justification, makes no data claims it can't back up, includes a privacy policy, uses an original icon (no OpenAI, Anthropic or Google logos), and states that it isn't affiliated with them.

## 7b. After approval: finish the site

1. Copy Veil's item ID from the dashboard URL or the store page (the 32 letters after `/detail/`).
2. In `site/index.html` replace `YOUR-ITEM-ID` (4×) with it. If you add a custom domain later, also replace `veil-privacy-three.vercel.app` (4×).
3. Redeploy: `cd site && vercel deploy --prod`. Then paste your homepage URL into an X or LinkedIn post draft to check the preview card shows `og.jpg`.

## Production checklist

- [ ] Tested on the real **chatgpt.com, claude.ai and gemini.google.com** while logged in: status pill says Armed on each, hide-this-chat works, lock works.
- [ ] Tested once on a fresh Chrome profile (no old settings) so you see what a new user sees.
- [ ] `npm test` and `npm run test:e2e` pass; `npm run zip` done.
- [ ] Support email replaced everywhere and it receives mail.
- [ ] `site/` deployed; `privacy.html` opens in a private window.
- [ ] `version` in `extension/manifest.json` is what you want to ship (`1.0.0`).
- [ ] After approval: section 7b, then start week 1 of `GROWTH.md`.

## 8. Shipping an update later

1. Make your changes and test them with **Load unpacked** (section 1).
2. Raise `"version"` in `extension/manifest.json`, for example `1.0.0` → `1.0.1`. The store rejects an upload with the same version.
3. `npm run zip`
4. In the dashboard open Veil, go to **Package → Upload new package**, choose the new `veil.zip`, then **Submit for review**.

Users get the update automatically within a few hours of approval. Their settings, hidden chats and PIN are kept.

## Sources

- Publish in the Chrome Web Store: https://developer.chrome.com/docs/webstore/publish
- Supplying images (icon, screenshots, promo tiles): https://developer.chrome.com/docs/webstore/images
- Chrome Web Store review updates (2026): https://developer.chrome.com/blog/cws-review-updates-2026
- Chrome Web Store policy updates (2026): https://developer.chrome.com/blog/cws-policy-updates-2026
- Limited Use policy: https://developer.chrome.com/docs/webstore/program-policies/limited-use
- User Data FAQ (local-only data must still be disclosed, FAQ 3): https://developer.chrome.com/docs/webstore/program-policies/user-data-faq
- The US$5 registration fee: https://9to5google.com/2020/03/12/chrome-web-store-fee/
