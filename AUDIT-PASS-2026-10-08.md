# Veil audit fix pass: 2026-10-08

For Soufiane. This pass fixed the findings that survived the independent audit and refutation pass, run after the ship-readiness commit `c3c956d`. I ran it unattended and made the calls myself. My assumptions are in section 5.

## 1. Summary

- **Both high-severity lock bypasses are fixed and tested:**
  - An open Settings tab no longer survives Lockdown or auto-lock.
  - Keys typed into the lock screen's PIN box no longer reach the chat site's scripts.
- **The high-severity name collision is only partly handled.**
  - A same-niche extension on the same three sites is already called "Veil".
  - I dropped the "Veil: Privacy Blur for X" title pattern and documented the clash.
  - Renaming is your decision (section 4).
- **Fixed with tests:** two code mediums.
  - A page with slow-loading settings now fails closed.
  - The "hidden" toast no longer shows the chat title over the Present blur.
- **Fixed in the copy:** four mediums.
  - The hidden-chat scope claim
  - The Limited Use statement
  - The HN generated-text rule
  - A README for a public repo
- **Tests:**
  - unit: 7/7
  - e2e: 23/23 (22 subtests plus the wrapper, up from 19) on 4 runs in a row
  - Each new test failed on the old code before I applied its fix.
- **Package:** `veil.zip` is rebuilt with 28 files and is byte-identical to `extension/` (`diff -r` is clean).
- **Commits:** 9 local fix commits on `main`, plus one for this report. Nothing was published, uploaded, deployed, posted or pushed, and there is still no remote.

| Commit | What |
|---|---|
| `1a0068c` | Re-gate an open settings page on Lockdown and auto-lock |
| `00fdd25` | Keep keys typed in the lock screen's PIN box away from the page |
| `4609edd` | Fail closed when settings take longer than 1.5 s to load |
| `7bdf87b` | Stop the "hidden" toast from showing the chat title |
| `6f77313` | Say hidden chats leave the sidebar list, not the whole site |
| `6992844` | Add the Limited Use compliance statement to the privacy policy |
| `0f99a88` | Turn the Show HN comment into facts and flag the drafts as AI-written |
| `e62bf50` | Add a README for the public repo |
| `a109bba` | Drop the "Veil: Privacy Blur for X" title and record the name clash |

## 2. Findings

Scope rule for this pass: apply every critical or high finding and every S-effort medium, and defer the rest. I made two exceptions for lows:
- a low that the same change already fixes
- a low whose fix sits in the exact text I was already rewriting, so that I didn't knowingly carry a false line into the new text

The deferred lows are cheap, and several come with a fix the auditor already tested. They make a good next pass.

| ID | Sev | Issue | Status | File(s) and evidence |
|---|---|---|---|---|
| veil-bypass-settings-tab-survives-lock | high | A Settings tab unlocked earlier stayed usable after a lock. It showed hidden titles, and Change PIN or Remove PIN unlocked every chat tab. | **Applied** `1a0068c` | `extension/options/options.js:67` reloads to the PIN gate when the session goes from unlocked to locked. `:88` passing the gate now writes `unlocked: true`, so a later lock always fires that change (see section 5). Test: `test/e2e.test.js:297`. Each half alone fails the test. |
| veil-bypass-pin-box-keys-reach-page | high | Keys typed into the PIN box crossed the shadow root to the site's scripts (every PIN digit, site shortcuts, keyup, Cmd/Ctrl+S). | **Applied** `00fdd25` | `extension/content/main.js:201-224`: one window capture listener for keydown, keyup, keypress, beforeinput and input stops them all while locked, drives the PIN box itself, and blocks Ctrl/Cmd combos typed in it. Test: `test/e2e.test.js:200`. On the old code the stand-in site saw `keydown:2`, `beforeinput:2`, `keyup:2` and so on, and Cmd/Ctrl+A selected the PIN. |
| veil-launch-01-name-collision | high | "Veil - AI Chat History Blur for ChatGPT, Claude, Gemini & Grok" (MidnightCoke, 47 users, 4.8 stars from 5 ratings, v2.2.0, updated September 10, 2026; https://chromewebstore.google.com/detail/gldlgjaiemldondiieoahlblpmfalljo, read 2026-10-08) is a direct competitor. | **Partly applied** `a109bba`. The rename is deferred to you. | `extension/manifest.json:3` is now "Veil: Blur and Lock ChatGPT, Claude and Gemini" (46 characters), which drops the "Veil: Privacy Blur for X" pattern. `GROWTH.md:104` now names the competitor and lists every place a rename touches. Choosing a brand needs store, domain and trademark checks that I can't make for you. |
| veil-bypass-hidden-chats-outside-sidebar | med | Hidden chats are removed from the sidebar only. Site search, a direct link and Chrome history still show them, but the listing said they come back only with the PIN. | **Applied (copy)** `6f77313`. The code option is deferred. | `PUBLISHING.md:129`, `extension/options/options.html:58` and `site/index.html:252` now say "sidebar list only" and name what still shows them. The optional code change (mask the title and blur the conversation when the open chat is a hidden one) changes product behavior, so it's your call. |
| veil-code-loading-timeout-fail-open | med | After 1.5 s the page was revealed even if settings hadn't loaded, so a tab that should be locked was readable. | **Applied** `4609edd` | `extension/content/main.js:29-33` shows the blur cover if settings aren't there yet. Test: `test/e2e.test.js:236` resets the session access level, keeps the worker busy for 4 s and asserts `{settingsLoaded:false, covered:true}`. The old code gave `covered:false`. |
| veil-code-hide-toast-leaks-title-in-present | med | The "Hidden: <title>" toast sits above the Present blur. | **Applied** `7bdf87b` | `extension/content/main.js:241` now shows `toast('Chat hidden')`. Test: `test/e2e.test.js:152`, which reads the closed shadow root over the DevTools protocol (helper at `:48`). The old code showed `'Hidden: Doctor results explained'`. |
| veil-code-settings-page-not-regated-on-lock | med | Same defect as the settings-tab bypass, seen passively: titles stay on screen after idle auto-lock. | **Applied** `1a0068c` | Same fix and test as veil-bypass-settings-tab-survives-lock. |
| veil-store-03 | med | No Limited Use compliance statement on the site. | **Applied** `6992844`. **The site needs redeploying.** | `site/privacy.html:50`. Policy: https://developer.chrome.com/docs/webstore/program-policies/limited-use says an affirmative statement "must be disclosed … on a website belonging to your extension". https://developer.chrome.com/docs/webstore/program-policies/user-data-faq says the disclosure goes on the homepage or "on a page one click away … for example, in your privacy policy". Both read 2026-10-08. |
| veil-claims-01 | med | The Show HN section was an AI-written comment to paste, and HN bans generated text. | **Applied** `0f99a88` | `launch/posts.md:6` has a new "Write the final text yourself" rule. `:157-173` turns Show HN into "Facts to draw on". The Reddit sections are marked as notes. Policy: https://news.ycombinator.com/newsguidelines.html, read 2026-10-08: "Don't post generated text or AI-edited text." |
| veil-launch-09-repo-readme-license | med | A public repo is planned but there's no README or LICENSE, and this repo's history holds internal docs. | **Partly applied** `e62bf50` and `0f99a88`. The LICENSE is deferred to you. | New `README.md` with the pitch, test steps and honest limits. `launch/posts.md:9` says to publish a fresh repo with only the public paths and to check the commit email. I didn't pick a licence: whether to open-source, and under which licence, is your decision. |
| veil-code-pin-keystrokes-visible-to-site-scripts | low | Site scripts could read the PIN as it was typed. | **Applied** by `00fdd25` | Same fix and test as veil-bypass-pin-box-keys-reach-page. |
| veil-claims-13 | low | Show HN facts were wrong: it doesn't need public code, and `:is()` forgives invalid selectors, not stale ones. | **Applied** in `0f99a88`, because these were the lines I was rewriting | `launch/posts.md:9`, `:159` and `:166`. Not touched: `GROWTH.md:55` and `SPRINT-REPORT-2026-10-08.md:192`, which still say Show HN needs open source. |
| veil-claims-05 | low | The PIN limits weren't user-facing, and SPRINT-REPORT:121 claims they are. | **Partly applied** | The limits are now in the Show HN facts (`launch/posts.md:171`) and the README. Deferred: the site FAQ sentence (`site/index.html:254`). `SPRINT-REPORT:121` is still inaccurate; treat this report as the correction. |
| veil-claims-04 | low | The no-network wording overstates the test. | **Partly applied** | The Show HN facts (`launch/posts.md:172`) use the precise wording. Deferred: the X, LinkedIn and Reddit lines (`:39`, `:63`, `:85`, `:147`), now flagged at `launch/posts.md:11`. |
| veil-launch-02 | low | The title, summary and first line don't lead with lock or screen sharing. | **Partly applied** (title only, through launch-01) | Summary and description first line deferred: listing copy, low. |
| veil-code-tests-weak-coverage | low (M) | Thin coverage in several areas. | **Partly applied** | 4 new regression subtests (above). Deferred: Claude and Gemini stand-ins, a real tab switch, a worker console watcher, profile dir cleanup and the remaining fixed sleeps. |
| veil-bypass-top-layer-over-lock-and-cover | low | A site's `<dialog>`, popover or fullscreen element draws above the lock and cover. | Deferred: low, outside this pass's scope | The auditor's 2-rule CSS fix is tested on a copy. No evidence the real sites use top-layer UI. |
| veil-bypass-150ms-resync-gap | low | ~150 ms gaps after the site replaces `<body>`, removes the overlay or changes the title. | Deferred: low, outside this pass's scope | Fix: call `mount(); syncInert(); syncTitle();` directly in the MutationObserver. |
| veil-code-orphan-unlocked-tab-stays-interactive | low | An orphaned, unlocked tab stays clickable and keeps its title. | Deferred: low, outside this pass's scope | 2-line fix in the orphan branch (now `main.js:268-278`). |
| veil-code-lockout-unbounded-when-clock-goes-back | low | A backward clock jump can lock the right PIN out for hours. | Deferred: low, outside this pass's scope | One `Math.min` in `core.js:44`, plus a unit case. |
| veil-code-gemini-side-selector-overmatches | low | Unscoped `a[href*="/app/"]` blurs Gemini's top-bar link and answer links. | Deferred: low, outside this pass's scope | Scope it to `bard-sidenav` (seen live, signed out, on 2026-10-08 by the auditor; the signed-in sidebar is unverified). |
| veil-code-title-mask-flash-and-stale-restore | low | ~150 ms title flash and a stale title restore. | Deferred: low, outside this pass's scope | Same observer change as the 150 ms gap, plus an href check. |
| veil-code-onchanged-dropped-before-first-load | low | A lock that lands 1-2 ms after page commit can be dropped. | Deferred: low, outside this pass's scope | Re-read once if a change arrived before the first load. |
| veil-store-04 | low | No Gemini™ symbol or Google attribution line. | Deferred: low, outside this pass's scope | Branding guideline, not a policy requirement. Add it with any listing edit. |
| veil-store-09 | low | The privacy policy omits the stored PIN length and last-fail time. | Deferred: low, outside this pass's scope | One-line copy fix at `site/privacy.html:35`, `PUBLISHING.md:167` and `:178`. Worth doing before you redeploy. |
| veil-claims-03 | low | First-person anecdotes in the drafts come from the agent session. | Deferred, but flagged in `launch/posts.md:6` and `:11` | You rewrite the drafts anyway. |
| veil-claims-08 | low | "Check layout" covers only the chat list and input box. | Deferred: low, outside this pass's scope | Copy at `launch/posts.md:115`, `:146` and `site/index.html:256`. |
| veil-claims-09 | low | "Starts working the moment you install it" isn't true for tabs already open. | Deferred: low, outside this pass's scope | `site/index.html:174`. |
| veil-claims-10 | low | "Off: pause Veil on all sites" isn't accurate: hiding, the lock and the step-away blur still run. | Deferred: needs your call (copy or code) | `PUBLISHING.md:123`, `extension/popup/popup.html:39`. |
| veil-claims-11 | low | The privacy policy's storage list is incomplete. | Deferred: low, outside this pass's scope | Overlaps with veil-store-09. Whether to tick "Web history" is your call. |
| veil-claims-14 | low | The FAQ "Can Veil read my chats?" dodges the question. | Deferred: low, outside this pass's scope | `site/index.html:251`. |
| veil-launch-03 | low (M) | The screenshot order, the small tile text and the missing video. | Deferred: needs the demo-account retake | Already step 4 of your publish list. |
| veil-launch-04 | low | GROWTH.md:16 says "the only one that PIN-locks", which is false. | Deferred: internal doc only | The README already uses the auditor's checkable line instead. |
| veil-launch-06 | low | No feedback or rating link inside the extension. | Deferred: needs the support email and item ID | |
| veil-launch-07 | low | The site's store links have no UTM tag. | Deferred: needs the item ID | |

## 3. Commands run

| Command | Result |
|---|---|
| `git -C … status`, `git log`, `git remote -v` (start) | clean tree, one commit `c3c956d`, no remote |
| `npm test` (baseline) | 7/7 pass |
| `npm run test:e2e` (baseline, `TMPDIR` set to my scratch dir) | 19/19 pass, 8.7 s |
| Settings re-gate: new test with no fix | fails (TimeoutError waiting for the gate) |
| … with only the reload half | fails |
| … with only the gate-unlock half | fails |
| … with both halves | 20/20 pass |
| PIN keys: new test on old `main.js` | fails. The page saw `keydown:2`, `beforeinput:2`, `keyup:2`, `keydown:4`, … |
| … with the fix | 21/21 pass |
| Slow settings: new test on old `main.js` | fails with `{settingsLoaded:false, covered:false}` |
| … with the fix | 22/22 pass |
| Toast: new test on old `main.js` | fails with `'Hidden: Doctor results explained'` |
| … with the fix | 23/23 pass |
| `npm test` (final) | 7/7 pass |
| `npm run test:e2e` (final), 4 runs in a row | 23/23, 23/23, 23/23, 23/23 (11.4–11.6 s each) |
| `npm run zip`, then `unzip` and `diff -r` against `extension/` | 28 files, identical. The manifest name in the zip is "Veil: Blur and Lock ChatGPT, Claude and Gemini". |

Pages I read on 2026-10-08:
- Chrome Web Store: limited-use and user-data-faq
- Hacker News: newsguidelines.html and showhn.html
- the competitor's store page

I didn't open chatgpt.com, claude.ai or gemini.google.com. All tests use the repo's stand-in page.

## 4. What you need to decide

1. **The name, before the first upload.** A direct competitor is already called "Veil" (see the table). Your options:
   - Rename now. `GROWTH.md:104` lists every string to change.
   - Keep "Veil". The title no longer copies the "Veil: Privacy Blur for X" pattern.

   Renaming after launch costs a new version, a review and any ratings you've built up.
2. **Redeploy the site before you submit.** I didn't deploy. The live privacy policy lacks the Limited Use line, and the FAQ change isn't live. Consider also fixing veil-store-09 (PIN length and last-fail time in the policy) in the same deploy.
3. **Open source and licence.** If you go public:
   - Publish a fresh repo with only the paths listed in `launch/posts.md:9`. This repo's only earlier commit holds `GROWTH.md`, `launch/`, `docs/market-research.md` and the sprint report.
   - Add a `LICENSE` you choose.
   - Check the commit email.
4. **Behavior changes I made. Keep them or revert them:**
   - Passing the Settings PIN gate now also unlocks the chat tabs. It counts as an unlock, the same as the popup's.
   - Ctrl and Cmd combinations typed in the lock screen's PIN box are blocked. This stops Cmd/Ctrl+S, P and C on a locked page, but you can't paste a PIN.
   - The hide toast says "Chat hidden" in every mode. Before, it named the chat.
5. **Hidden chats opened directly** (from search, a link or history) still show the conversation and the tab title. Should Veil blur them (code) or is the new "sidebar list only" wording enough?
6. **Off mode** (veil-claims-10). Should Off really turn everything off (code), or should the copy say that hiding, the lock and the step-away blur keep running?
7. **Corrections to the sprint report.** I didn't edit `SPRINT-REPORT-2026-10-08.md`; this report supersedes it on these points:
   - §1 "Keys are swallowed while locked" wasn't true for the PIN box until `00fdd25`.
   - §1 "The invented anecdotes are gone": some remain (veil-claims-03).
   - §3 says the PIN limits are stated on the settings page, FAQ, policy and listing. Only "not encryption" and "anyone can turn Veil off" are.
   - §5 step 8 says "Show HN needs a public repo". It doesn't.

## 5. Assumptions

- **Local commits.** The fix plan asked for one local commit per fix. I made them on `main` with this machine's global git identity. There's no remote and I added none.
- **Settings gate.** To make "any lock re-gates Settings" hold, passing the Settings gate has to change the session's `unlocked` flag. Chrome only fires a change event when a value actually changes, so a lock written while the session is already locked fires nothing. Without this, a Settings page opened while the chat tabs were locked would miss the next lock, and the test shows that.
- **Name.** I treated the rename as a brand decision, not a fix, and applied only the fallback the finding itself suggests.
- **Lows.** I deferred lows as the scope rule says, except the ones noted in section 2.
- **Probe scripts.** The auditor's probes under `/private/tmp/claude-504/veil-probes/` weren't needed. Every fix has its own regression test in `test/e2e.test.js`.
