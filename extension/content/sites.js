// Where each blurrable area lives on each site. When a site redesigns, this is the only file to fix.
// Each value is a CSS selector list; several alternatives are listed so one rename doesn't break everything.
// `side` doubles as "one chat in the sidebar" for hiding chats.
// Present mode and the lock screen don't use these at all, so they keep working even when this goes stale.
globalThis.VeilSites = {
  'chatgpt.com': {
    name: 'ChatGPT',
    side: 'nav a[href*="/c/"]',
    conv: '[data-message-author-role]',
    input: '#prompt-textarea, form [contenteditable="true"], form textarea',
    img: 'main img',
  },
  'claude.ai': {
    name: 'Claude',
    side: 'nav a[href*="/chat/"]',
    conv: '[data-testid="user-message"], .font-claude-response, .font-claude-message, [data-is-streaming]',
    input: '.ProseMirror[contenteditable="true"], fieldset [contenteditable="true"], fieldset textarea',
    img: 'main img',
  },
  'gemini.google.com': {
    name: 'Gemini',
    side: '[data-test-id="conversation"], a[href*="/app/"]',
    conv: 'user-query, model-response',
    input: 'rich-textarea, .ql-editor',
    img: 'chat-window img, main img',
  },
};
