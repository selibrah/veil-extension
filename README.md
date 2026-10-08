# Veil

Blur, hide and PIN-lock your ChatGPT, Claude and Gemini chats. One key blurs everything before a screen share, and nothing leaves your device.

Get it from the Chrome Web Store: STORE-LINK?utm_source=github&utm_medium=referral&utm_campaign=launch

## What it does

- **Private mode** (the default) blurs the chat list and images. Hover to peek.
- **Present mode** blurs the whole page, for screen sharing. `Alt+Shift+B` toggles it.
- **Hide chats** from the sidebar list: right-click a chat and choose "Hide this chat (Veil)", or hide every chat whose title matches a keyword.
- **PIN lock** with `Alt+Shift+L`. It also locks when the computer goes idle and every time Chrome restarts.

It runs only on chatgpt.com, claude.ai and gemini.google.com. Its permissions are `storage`, `idle` and `contextMenus`.

## Verify it yourself

Needs Node 20+.

```bash
npm install
npx playwright install chromium
npm test           # unit tests
npm run test:e2e   # loads the real extension in Chromium against a stand-in chatgpt.com page
```

The e2e test records every request from the chat page, the popup, the settings page and the service worker during the run. It fails on any request that isn't Veil's own files or the stand-in page. The popup, settings page and service worker also run under a CSP with `connect-src 'none'`.

To try it by hand: open `chrome://extensions`, turn on Developer mode, click **Load unpacked** and choose the `extension` folder.

## Limits

- Veil changes only what is shown on your screen. Your chats stay in your ChatGPT, Claude or Gemini account as usual.
- Hidden chats leave the sidebar list only. The site's own chat search, a direct link and Chrome's history can still show them.
- The PIN lock is a privacy screen for people near your computer, not encryption. Anyone who can use your computer can turn Veil off in Chrome's extension settings. Anyone who can read your Chrome profile can brute-force a 4 to 8 digit PIN offline, and the lockout trusts the system clock.
- The tests use a stand-in page, not the live sites, so they can't catch a site redesign. When the popup says "Check layout", update the selectors in `extension/content/sites.js`.

## Layout

```
extension/   the extension (this folder is what gets zipped and uploaded)
site/        landing page and privacy policy
store/       store images and the script that builds them
test/        unit tests, e2e test, stand-in chat page
docs/spec.md what Veil does and how it is built
```

Veil is an independent project and is not affiliated with or endorsed by OpenAI, Anthropic or Google.
