# Veil: design spec

A free Chrome extension (Manifest V3) that hides private content on ChatGPT, Claude and Gemini from people who can see your screen. No account, no server, no network requests.

## Features (v1)

| Feature | Behaviour |
|---|---|
| Modes | Off, Private (chat list + images), Present (everything, full-page blur, no hover reveal), Custom (any mix of the 4 areas). |
| Areas | Chat list, conversation, input box, images. Each can be blurred on its own. Strength 2–18px. |
| Hover reveal | Hovering a blurred element un-blurs it after 150ms. Off in Present mode. |
| Hide chats | Right-click menu "Hide this chat (Veil)", or "Hide the open chat" in the popup. Plus keyword rules (case-insensitive title match). "Show" reveals them until Chrome restarts and needs the PIN when one is set. |
| PIN lock | 4–8 digits, PBKDF2-SHA256 with 200k iterations and a random salt. Full-page lock screen; the page underneath is made `inert`. 5 wrong tries cause a 30s wait. Re-locks when Chrome restarts. |
| Auto-lock / blur | After N idle minutes (`chrome.idle`): lock if a PIN is set, otherwise blur. Switching tabs blurs until the mouse moves or a key is pressed. |
| Shortcuts | Alt+Shift+B panic (Present, press again to restore), Alt+Shift+L lock, Alt+Shift+M next mode. |

Copy tone: fun words only where the meaning stays obvious (logo "Veil", badge "Armed", button "Lockdown", lock screen "Veil locked!"). Plain labels everywhere else.

## Architecture

```
lib/core.js        shared state + pure logic (modes, panic, chat IDs, hiding rules, PIN hashing, lockout). Unit-tested in Node.
content/sites.js   per-site CSS selectors. The only file to touch when a site changes its layout.
content/main.js    runs on the 3 sites: blur CSS, closed shadow-root overlay (full-page blur, lock screen, toast), hiding, PIN entry.
background.js      service worker: context menu, shortcuts, idle detection, first-run welcome page.
popup/, options/   toolbar popup and settings page, sharing ui/theme.css (comic style) and ui/pin.js.
```

- **State:** settings live in `chrome.storage.local`, so every page and tab reacts through `storage.onChanged`. The unlock state lives in `chrome.storage.session`, which Chrome wipes on restart; that wipe is what makes Veil re-lock.
- **Blur:** CSS rules of the form `html[data-veil~="side"] :is(<selectors>) { filter: blur(var(--veil-blur)) }`. `:is()` ignores a bad selector instead of dropping the whole rule. Present mode and the away blur use one fixed `backdrop-filter` layer, so they work even when the site selectors are out of date.
- **No flash:** the page is hidden until settings load (1.5s fallback), because the content script runs at `document_start`.
- **Resilience:** a MutationObserver (throttled to 150ms) re-mounts Veil's nodes and re-applies hiding as the single-page app re-renders. The popup shows "Check layout" when a site's chat list or input box can't be found.

## Limits

- The PIN is a privacy screen, not encryption. Anyone with access to `chrome://extensions` can remove Veil.
- The site selectors will break when a site redesigns its page; sites.js plus the status pill keep that a one-file fix.

## Testing

- `npm test`: core logic in Node.
- `npm run test:e2e`: the real extension in Playwright Chromium against `test/fixtures/chat.html` (served as chatgpt.com). Covers every feature above plus the popup, settings page and console errors.
