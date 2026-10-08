# Veil ship-readiness pass: 2026-10-08

For Soufiane. I ran this unattended, as asked, so I made the calls myself and list my assumptions at the end.

**Bottom line:** the extension is ready to submit once the placeholders are filled in and you've tested it on the three real sites. All tests pass:
- unit: 7/7
- e2e: 19/19, 8 green runs in a row after the last change

The independent review found 5 real bugs. I fixed all 5 and added a test for each fix that broke the code. Nothing was published, deployed, posted or pushed.

---

## 1. What changed

### Extension (`extension/`)

| Change | Why |
|---|---|
| **Locked pages now stay locked when settings load before `<body>` exists.** `syncInert()` now also runs on every DOM change, not only on settings changes. | Before this, a page whose `<body>` arrived late (a slow script in `<head>`) showed the lock card, but the page underneath stayed clickable and focusable. That was a real lock bypass. |
| **Keys are swallowed while locked.** The handler now calls `preventDefault` as well as stopping propagation. Tab still works, so it can reach the PIN box. | Before, typing, Enter on a link and Cmd/Ctrl+P still reached the page behind the lock. |
| **Printing a locked page comes out blank** (an `@media print` rule). | Before, printing a locked page printed the chats. |
| **The tab title is masked** to "ChatGPT", "Claude" or "Gemini" while locked or in Present mode, and restored afterwards. | The open chat's title showed in the tab strip and in screen shares. |
| **A tab still running the old copy covers itself after an update or removal.** It shows the blur cover plus "Veil was updated. Reload this tab to keep it protected." | Chrome doesn't inject the new version into tabs that are already open, and the old copy goes deaf: it can't hear Lockdown or setting changes. This makes it fail closed. |
| **Panic can no longer switch Veil off.** Changing the mode by hand (popup, area toggles, Alt+Shift+M) clears `panicPrev`. | Repro: panic from Off, undo, pick Present in the popup, panic again. Veil went to Off. |
| **Lockdown and auto-lock also put hidden chats away** (`showHidden: false`). | Before, hidden chats you'd shown stayed visible after Lockdown and unlock. |
| **The CSP is tighter:** `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; object-src 'none'; connect-src 'none'; base-uri 'none'`. It covers the popup, settings page and service worker. | Defence in depth for the "no network" claim. |
| Welcome page: "Already have one of them open? Reload that tab". Popup "Check layout" tooltip now starts with "If the sidebar is open and has chats…". | Fewer false alarms and less confusion on first run. |
| `data-veil-cover` and `data-veil-locked` attributes on `<html>` | These make the cover and lock state observable to tests and to the print rule. |

### Tests (`test/`)
- **New unit check:** Present picked by hand plus panic goes to Private, not Off.
- **New e2e checks:**
  - **No network requests:** records every request from the chat page, popup, settings and service worker, and fails on anything that isn't Veil's own files or the stand-in page.
  - **Late `<body>`:** a page with a slow script in `<head>` ends up inert, its title is masked, and print media hides the body.
  - **Tab title:** in Present mode the tab title is masked, and it's restored afterwards.
  - **Step-away blur:** the blur appears and then goes away when the mouse moves. That test used to have no assertion.
  - **Lockdown:** it locks the page and clears "Show hidden".
  - **Update:** reloading the extension makes the open tab cover itself.
- **Flake fixes:**
  - The PIN boxes are typed with `locator.pressSequentially`, which focuses the box first, instead of racing its `setTimeout` focus.
  - The Private-mode check waits for the computed blur instead of a fixed `sleep(300)`.

### Docs, site and posts
- **`PUBLISHING.md`:**
  - The Privacy tab answers are rewritten (see section 3).
  - The listing now states the honest limits and the "reload open tabs" note.
- **`site/privacy.html`:**
  - The short version is rewritten.
  - New paragraphs on the mouse/key/idle check and on the sites' own pages seeing Veil's changes.
  - The security note now says anyone with the computer can turn Veil off.
  - The "Changes" section now promises the policy is updated before Veil ever starts sending data.
- **`site/index.html`:**
  - The screenshot alt text is neutral.
  - "needs your PIN, if you've set one".
  - The FAQ matches the settings page wording.
  - "A privacy tool that ships your data to a server would be a bad joke."
- **`extension/options/options.html`:** the PIN card states the limits.
- **`launch/posts.md` (new):** drafts for X, LinkedIn, r/chrome_extensions, r/SideProject and Show HN. They are drafts only.
  - Claims are reworded to match the code: "test suite", not "build", since there's no CI, and the CSP's scope is stated precisely.
  - The invented anecdotes are gone.
- **`docs/market-research.md`:** research on the next project ("Redact & Restore"), sourced.
- **Repo:**
  - `git init` with one local commit. No remote, no push.
  - `.gitignore` excludes `node_modules/`, `.shots/`, `veil.zip`, `.vercel/`, `.env*` and `.DS_Store`.
  - The commit uses this machine's global git identity, which is yours.
- **`veil.zip`:** rebuilt with 28 files and the manifest at the root. I checked that its `manifest.json` and `content/main.js` are byte-identical to the source.

---

## 2. Test results

| Suite | Result |
|---|---|
| `npm test` (unit, `node:test`) | **7/7 pass** |
| `npm run test:e2e` (Playwright 1.64, Chromium, real extension loaded) | **19/19 pass** (18 subtests plus the wrapper), 8 runs in a row after the final change, ~7 s each |

**Negative checks.** These prove the new tests can actually fail. Each injection was reverted, and the files were confirmed identical afterwards.

| Injected fault | Result |
|---|---|
| `fetch('https://example.com/leak')` in the content script | the no-network test failed ✔ |
| `fetch` at the top of the service worker, without the CSP | the no-network test failed ✔ (Playwright does see service-worker requests) |
| the same fetch with the CSP | blocked by Chrome ("Failed to fetch") ✔ |
| the old inert logic | the late-`<body>` test failed ✔ |
| the orphan check disabled | the update test failed ✔ |

**Earlier flakiness, for honesty:**
- Before the fixes I saw one e2e failure I couldn't attribute to a specific subtest.
- I also saw one Private-mode timing flake.
- Both were in the test harness (the PIN-focus race and the fixed sleep), and both are fixed.
- I haven't seen a failure since, in about 35 runs in total.

---

## 3. Policy and privacy findings

### Zero network requests
- **Grep:** `fetch`, `XMLHttpRequest`, `WebSocket`, `sendBeacon`, `EventSource`, `importScripts`, `eval`, `new Function`, and remote `<script>`, `<img>` and `<link>` all come back clean. The only URLs in `extension/` are the three site match patterns, an SVG `xmlns` and the font licence texts. `importScripts('lib/core.js')` is a local file.
- **Runtime:** the e2e test above checks it on every run.
- **Scope of the CSP:**
  - It covers the extension's own pages and the service worker.
  - Content scripts run under the chat site's CSP, not Veil's, so for them the test is the guarantee.
  - The posts now say exactly this.

### MV3 review
- **Permissions:** `storage`, `idle` and `contextMenus` only. There are no `host_permissions`, `tabs`, `scripting` or `activeTab`.
- **Host access:** only through content-script matches for `https://chatgpt.com/*`, `https://claude.ai/*` and `https://gemini.google.com/*`.
- **No remote code:** all JS ships in the package and there is no `eval`.
- **CSP:** see above.
- **`web_accessible_resources`:** only the two `.woff2` fonts, scoped to the three sites. A site could detect that Veil is installed by probing them. It can already tell from the `data-veil` attributes, so I accept this.
- **Commands:** panic `Alt+Shift+B`, lock `Alt+Shift+L` and cycle `Alt+Shift+M` are present and handled in `background.js`.

### PIN security
- **Storage:**
  - PBKDF2-SHA256, 200,000 iterations, a random 16-byte salt per PIN, kept in `chrome.storage.local`.
  - The PIN itself is never stored.
  - Unlock state lives in `chrome.storage.session`, which Chrome wipes on restart. That wipe is what re-locks it.
- **Lockout:**
  - After 5 wrong tries, each further try must wait 30 s.
  - The counter resets only on the correct PIN.
- **Honest limits** (these are now stated on the settings page, the site FAQ, the privacy policy and the store listing):
  - It's a privacy screen against people near the computer, not encryption.
  - Anyone who can use the computer can turn Veil off at `chrome://extensions`.
  - A 4–8 digit PIN hash can be brute-forced offline in minutes by anyone who can read the browser profile. The slow hash only slows down guessing at the lock screen.
  - The lockout can be skipped by changing the system clock.
  - Two tabs guessing at the same time can each count a wrong try once.
  - The stored PIN length tells an attacker how many digits to try.
  - None of these matter against the stated threat (a coworker glancing at your screen), and the store text makes no stronger claim.

### Chrome Web Store policy (fixes to `PUBLISHING.md`)
- **Single purpose:** "hide what's on your screen in AI chat sites". Every feature serves it.
- **Permission justifications:** each of `storage`, `idle`, `contextMenus` and the host access has its own justification in the permissions table.
- **Data disclosure (the important fix):**
  - The old text said to tick no data boxes. That contradicts the store's User Data FAQ, which requires disclosure "even when data is processed or stored locally", and a mismatch counts as a policy violation.
  - The new text ticks three boxes:
    - **Authentication information** (the PIN hash)
    - **Website content** (the hidden chat titles)
    - **User activity** (the mouse/key/idle check that lifts the step-away blur)
  - It also ticks all three certifications.
  - `privacy.html` matches it.
- **Brand names:** used nominatively ("for ChatGPT, Claude and Gemini"), with a non-affiliation line in the listing. There are no logos of those products.
- **Keyword stuffing:** none. The name has 49 characters and names the three supported sites once. The description doesn't repeat keywords or list unrelated terms.

---

## 4. Independent review

I gave one reviewer subagent only the brief and the file paths. It wrote and ran its own probes.

| Finding | Verdict | Action |
|---|---|---|
| B1 Panic can switch Veil off | Real | Fixed, with a unit test |
| B2 `inert` missing when settings load before `<body>` | Real | Fixed, with an e2e test (fails on the old code) |
| B3 Open tabs unprotected after an update; no injection at install | Real | Fail-closed cover, welcome text, listing note and an e2e test |
| B4 "The no-network test can't see service-worker traffic" | **Rejected.** The probe ran with the CSP on, so Chrome blocked the fetch before it was sent. Without the CSP, Playwright records it (verified). | Posts reworded to state the CSP's scope precisely |
| B5 "Show hidden" survives Lockdown | Real | Fixed, with an e2e test |
| Print bypass while locked | Real | Fixed, with an e2e test |
| Tab title leaks the chat name | Real | Fixed, with an e2e test |
| Step-away test asserted nothing | Real | Assertions added |
| User activity should be disclosed | Reasonable | Ticked |
| Overclaims in posts ("fails the build", "blocks every connection") | Real | Reworded |

**Deferred** (logged, not fixed; none blocks submission):
- moving the PIN check into the service worker
- not storing the PIN length
- clock-proof lockout
- a cross-tab lock on the fail counter
- Chrome's Reading mode and site modals or fullscreen layering over the cover
- Gemini "hide the open chat" for Gem URLs
- the "Check layout" false alarm when the sidebar is collapsed

---

## 5. What Soufiane must do to publish, in order

1. **Fill in the placeholders.** `YOUR-EMAIL@example.com` appears 2× in `site/index.html` and 2× in `site/privacy.html`. Use an address you're happy to make public.
2. **Redeploy the site.** The live privacy policy is now out of date and must match the new store answers before you submit. Run `cd site && vercel deploy --prod`, then open `https://veil-privacy-three.vercel.app/privacy.html` and check it shows the new "What Veil reads" paragraphs.
3. **Test on the real sites.** Load `extension/` unpacked in a fresh Chrome profile and open real chatgpt.com, claude.ai and gemini.google.com with the sidebar open. On each one:
   - the popup says **Armed**
   - blur, hide, panic and lock all work
   - a tab that was already open shows the reload message after you click reload on `chrome://extensions`
4. **Retake the store screenshots** on a demo account with fake chats. The current ones in `store/` come from the test's stand-in page (`npm run assets`).
5. **Register as a Chrome Web Store developer.** This costs a one-time $5 and needs 2-Step Verification on the Google account, a verified contact email, and the trader or non-trader declaration. Only you can do this.
6. **Upload `veil.zip`** and fill in the listing from `PUBLISHING.md`:
   - description
   - category
   - permission justifications
   - **the new Privacy tab answers (three boxes)**
   - privacy policy URL
7. **Submit for review.** After approval, do `PUBLISHING.md` section 7b.
8. **Decide three things before launch posts:**
   - open-source or not (Show HN needs a public repo)
   - keep the name "Veil"
   - the donation platform (`docs/market-research.md` recommends GitHub Sponsors)
9. **Then post** from `launch/posts.md`, replacing `STORE-LINK` and `REPO-LINK`.

---

## 6. What I couldn't verify

- **Real sites.** All e2e tests run against a stand-in chatgpt.com page. Claude and Gemini selectors were never run against the live sites in this pass.
- **The live store dashboard.** The exact Privacy tab wording and tooltips may differ from the FAQ I worked from.
- **Review outcome or timing.** Only Google decides these.
- **Subreddit rules** for self-promotion at posting time.
- **The single early e2e failure** I couldn't pin to a subtest (see section 2).
- **The deployed site.** It's stale until you redeploy, and I didn't touch it.

## 7. Assumptions

- The request came through a peer session on your behalf. I followed its constraints: no publish, upload, deploy, post or push.
- "One local commit" means the final state, so this report is in that commit.
- When unsure about disclosure, I chose to over-disclose (User activity).
- I fixed every bug the review confirmed. I didn't add features.
