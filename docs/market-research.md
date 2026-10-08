# Market research: Redact & Restore

*8 October 2026. Compiled from four research passes: competitors, demand, technical feasibility, and LinkedIn launch and donations. Every figure links to its source. "Unverified" means the source couldn't be opened or only a secondary source was found.*

**The idea.** A local-only browser extension that swaps names, emails, companies, numbers and secrets for placeholders (`PERSON_1`) before a prompt reaches ChatGPT, Claude or Gemini, then puts the real values back in the reply on your screen.

**The goal it's judged against.** A personal project that gets eyes on a LinkedIn profile, funded by donations only. No subscriptions or paid tiers.

---

## Verdict: go, but as an open-source showcase, not a compliance product

| Question | Answer |
|---|---|
| Is the problem real? | Yes. 48% of workers have uploaded company data to public AI, 67% where AI is banned ([KPMG](https://assets.kpmg.com/content/dam/kpmgsites/xx/pdf/2025/05/trust-attitudes-and-use-of-ai-global-report.pdf)). Professionals describe doing find-and-replace by hand ([Reddit](https://www.reddit.com/r/ChatGPTPromptGenius/comments/1k25nfb/)). |
| Is the niche open? | No. At least 15 indie extensions already do placeholder-plus-restore. The largest verified one has 521 users ([PiiBlocker](https://chromewebstore.google.com/detail/nklghhkmhkmckonncilnaohlihfacoee)). DFKI's free Apache-2.0 [Privacy Guardrail](https://github.com/dfki-dsa/pii-guardrail-browser-extension/) exists. |
| Can one person build it? | Yes. The detection and restore building blocks are open source. The hard part is not leaking when a site changes its page. |
| Will it earn money from donations? | Close to none. Page Assist has ~200k users and 1 current sponsor ([GitHub](https://github.com/sponsors/n4ze3m)). Expect roughly 0–4 donors per 10k users. |
| Does it serve the LinkedIn goal? | Yes, if it does what competitors don't: open source, fully in the browser, and a **published test suite for restore**. No competitor publishes one, and showing that work makes good LinkedIn material. |

**Call:** build it as the flagship of a "privacy tools that run on your device" series, after Veil. Pitch it as *assistive* ("catches what you'd miss"), the same way [OpenAI](https://github.com/openai/privacy-filter) and DFKI describe their tools. Never pitch it as "makes you compliant". Redaction lowers exposure but doesn't make a lawyer or therapist compliant on its own (details below). Don't target regulated professionals as paying customers: the liability is real and they won't pay a donation-funded project anyway.

---

## 1. Competitors

### Consumer extensions (store user counts checked 8 Oct 2026)

| Tool | Users | Restores values? | Note |
|---|---|---|---|
| [PiiBlocker](https://chromewebstore.google.com/detail/nklghhkmhkmckonncilnaohlihfacoee) | 521 | Yes | Largest verified. Local, zero network calls in free mode |
| [Caviard](https://caviard.ai) | ~340 ([extscope](https://www.extscope.org/extension/ncdaondhpapnhbeadnbcgpfmknhcoafh)); its own site claims "50K+" | Toggle only | $9 lifetime; licence-check calls to its server |
| [ChatWall](https://chromewebstore.google.com/detail/fgkiepldibfgepiohbjcelgklobakped) | 94 | Yes | Source-available, uses OpenAI's Privacy Filter |
| [Sequirly](https://chromewebstore.google.com/detail/lmmiklkfmckjcicchahagdejejjmgnoh) | 84 | Not stated | |
| [Privacy Mask](https://chromewebstore.google.com/detail/gpjmkpijmdpakmcbmjdnlopplklammha) | 78 | Paste reply back in | $9/month Pro |
| [Privacy Protector for ChatGPT](https://chromewebstore.google.com/detail/ajoplockplhgenpmncdanppmdndpaeei) | 67 | Button | ChatGPT only |
| [Blankit](https://chromewebstore.google.com/detail/blankit/oihdkggpbopimdndhephiechoegagoeb), [SOWA](https://chromewebstore.google.com/detail/lhpcfjnknpejmolmdfmggmkbajanokfh), [Cloak](https://chromewebstore.google.com/detail/cnemamhbfgaapjiafemkciccgkgibfgf), [Rescriber](https://chromewebstore.google.com/detail/oglddlncokahjddccgjnnpdlgdbijcbl), [PasteGuard](https://chromewebstore.google.com/detail/gocdmeaeahmlblepijahaokianceckjg), [ChatDataMask](https://chromewebstore.google.com/detail/lnjfmiiepenimkkfakanmjmegbjkcbad), [Grepture](https://chromewebstore.google.com/detail/mlminjjehbfemobcdkmaddceohojanha) | 3–24 each | Mostly yes | Rescriber is a Northeastern University research project |
| Firefox: [Privatiser](https://addons.mozilla.org/firefox/addon/privatiser/), [Offsend](https://addons.mozilla.org/firefox/addon/offsend/), [Velum Lite](https://addons.mozilla.org/addon/velumprivacy/) | Small | Velum restores in the reply | |
| Show HN: [Privacy Firewall](https://news.ycombinator.com/item?id=46206591) | 111 points, 243 stars | Blocks only | MIT; got attention on HN |

### Enterprise (one-way masking, sold to security teams)

- [Nightfall](https://chromewebstore.google.com/detail/jgmgecncmjklkabkejnjfgfkglapfgek) (~90k users) and [Strac](https://chromewebstore.google.com/detail/gclaopgdekbeakgcjpbdondnpgopmifg) (3k) redact or block. They don't restore values.
- Restore exists only in API and gateway products: [Limina](https://docs.private-ai.com/configuration-and-operations/advanced-features/llms), [Skyflow](https://www.skyflow.com/post/generative-ai-data-privacy-skyflow-llm-privacy-vault), [Protecto](https://docs.protecto.ai/use-cases/genai-llm-prompts), [Kong](https://developer.konghq.com/plugins/ai-sanitizer/reference/). None of them sells to individuals.
- **Consolidation:**
  - Akamai bought LayerX ([Jul 2026](https://www.ir.akamai.com/node/33626)).
  - SentinelOne bought Prompt Security ([Aug 2025](https://www.businesswire.com/news/home/20250805913926/en/)).
  - Check Point bought Lakera ([Oct 2025](https://www.checkpoint.com/press-releases/check-point-software-reports-2025-third-quarter-financial-results/)).
  - [LLM Guard](https://github.com/protectai/llm-guard) was archived in Jul 2026.
- **Native features:** Chrome Enterprise Premium masks data one way ("REDACTED") on AI sites for admins ([Google](https://knowledge.workspace.google.com/admin/security/use-data-masking-to-strengthen-dlp-in-chrome)). Consumer ChatGPT, Claude and Gemini have no masking feature (as of 8 Oct 2026, unverified).

### Gaps nobody fills well

1. **Restore that's tested.** No tool publishes what happens when the model rewrites a placeholder, streams the reply, regenerates, or when you copy the answer.
2. **Companies and people in free text.** OpenAI's [Privacy Filter](https://huggingface.co/openai/privacy-filter) has no organization label, and most tools rely on regex.
3. **Mappings per client that persist.** Most mappings are per session, so `PERSON_1` changes meaning between chats.
4. **Trust.** No tool has an independent audit, and "100% local" claims go unchecked.
5. **Files.** Only 4.37% of prompts but 22–26% of uploaded files were sensitive ([Harmonic](https://www.harmonic.security/blog-posts/genai-data-exposure-report)). A paste-only tool misses the bigger leak.

## 2. Demand

| Signal | Source |
|---|---|
| 48% of workers uploaded company info to public AI; 67% where genAI is banned; 57% hide their AI use | [KPMG / Univ. of Melbourne](https://assets.kpmg.com/content/dam/kpmgsites/xx/pdf/2025/05/trust-attitudes-and-use-of-ai-global-report.pdf), 48,340 people, 2025 |
| 43% shared sensitive work data with AI without their employer knowing; 44% of those shared client data | [NCA / CybSafe](https://www.staysafeonline.org/press/study-65-now-use-ai-but-majority-remain-untrained-on-risks), Sep 2025 |
| 39.7% of AI interactions involve sensitive data | [Cyberhaven](https://info.cyberhaven.com/hubfs/Webflow_Resources/Cyberhaven-AI-Risk-Report-2026.pdf), Feb 2026 (vendor telemetry) |

**Incidents.**
- A UK solicitor put client documents into ChatGPT. The tribunal said this places them "in the public domain" ([2026] UKUT 81, [Legal Futures](https://www.legalfutures.co.uk/latest-news/solicitor-faces-probe-after-putting-client-documents-into-chatgpt)).
- In US v. Heppner, documents a defendant made with Claude were held not privileged ([Orrick](https://www.orrick.com/Insights/2026/03/Court-Rules-AI-Conversations-Are-Not-Privileged-What-United-States-v-Heppner-Means-for-You)).
- A contractor uploaded a spreadsheet about NSW flood victims to ChatGPT ([iTnews](https://www.itnews.com.au/news/nsw-gov-contractor-uploaded-excel-spreadsheet-of-flood-victims-data-to-chatgpt-620815)).
- The acting director of CISA uploaded "for official use only" documents ([TechCrunch](https://techcrunch.com/2026/01/28/trumps-acting-cybersecurity-chief-uploaded-sensitive-government-docs-to-chatgpt/)).

**Rules pushing professionals to care.**
- Lawyers: [ABA Op. 512](https://www.americanbar.org/content/dam/aba/administrative/professional_responsibility/ethics-opinions/aba-formal-opinion-512.pdf), [CalBar 2026](https://www.calbar.ca.gov/Portals/0/documents/ethics/Generative-AI-Practical-Guidance.pdf), [SRA](https://beta.sra.org.uk/solicitors/guidance/misuse-ai/).
- Accountants: [ICAEW](https://www.icaew.com/technical/technology/artificial-intelligence/generative-ai-guide/ethics).
- Therapists and psychologists: [APA](https://www.apa.org/topics/artificial-intelligence-machine-learning/ethical-guidance-professional-practice.pdf), [BACP 2026](https://www.bacp.co.uk/media/26718/bacp-ethical-framework-for-the-counselling-professions-2026.pdf).
- Australian organisations: [OAIC](https://www.oaic.gov.au/privacy/privacy-guidance-for-organisations-and-government-agencies/guidance-on-privacy-and-the-use-of-commercially-available-ai-products).

**Caution: redaction is not compliance.**
- CalBar's 2026 guidance replaced "anonymize" with informed consent.
- HIPAA Safe Harbor also requires removing dates and small-area geography ([HHS](https://www.hhs.gov/hipaa/for-professionals/special-topics/de-identification/index.html)).
- GDPR treats pseudonymised data as personal data.
- An HN commenter on legal AI: "Even with redaction, patterns still emerge" ([HN](https://news.ycombinator.com/item?id=48142580)).

**What people do today.** They find-and-replace by hand ([r/Entrepreneurs](https://www.reddit.com/r/Entrepreneurs/comments/1t848kv/)), write their own scripts ([HN](https://news.ycombinator.com/item?id=45675495), [r/consulting](https://www.reddit.com/r/consulting/comments/1t4pcxb/)), run local LLMs, or don't use AI at all ([r/Accounting](https://www.reddit.com/r/Accounting/comments/1u9pidg/)).

## 3. Technical feasibility

**Detection: what to use**

| Layer | Catches | Cost |
|---|---|---|
| Regex and checksums (port [Presidio](https://presidio.dataprivacystack.org/supported_entities/) patterns plus MIT [gitleaks](https://github.com/gitleaks/gitleaks) rules) | Emails, phones, IBANs, cards, national IDs, ~220 API-key formats | Tiny, instant. Catches no names |
| A user's **"people and companies" dictionary** | The client and company names that matter to this user | Exact match, the most reliable option for names |
| Optional download: [OpenAI Privacy Filter](https://huggingface.co/openai/privacy-filter) via Transformers.js | People, addresses, accounts, secrets; span F1 0.926; person precision 0.78 | ~809 MB (q4f16). No organization label |
| Optional: [bert-base-NER](https://huggingface.co/dslim/bert-base-NER) | Organizations | ~100 MB |
| Gemini Nano (Chrome Prompt API) | Whatever you prompt it to find | **Avoid as the main detector.** [PII Shield](https://github.com/kaispriestersbach/pii-shield-extension) tried it and was archived; its README says it "does NOT work reliably" |

**Expected accuracy:** close to perfect on emails, cards, IBANs and keys. About 85–90% recall on plain-English names. Much lower on ambiguous names, legal text and non-English text. Company names probably stay under 70% without the dictionary (inference). That's why a **review screen before sending** is needed.

**Intercepting and restoring**
- Rewrite the text in the input box before sending. Chrome's declarativeNetRequest API can't change request bodies ([docs](https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest)).
- ProseMirror-style editors can ignore text written into them from outside ([bug report](https://claudeissues.com/issue/66930-bug-cowork-automated-browser-control-stops-syncing-input-to-react-prosemirror-re)). Test each site and block sending if the rewrite didn't stick.
- Don't wrap the page's `fetch`. It's the same technique [16 malicious "AI" extensions](https://cyberinsider.com/chrome-extensions-on-the-web-store-pose-as-ai-tools-to-steal-user-data/) used to steal sessions.
- Restore by editing text nodes in place and re-scan once streaming ends. Don't replace nodes React owns: translation tools that do that crash React ([note](https://cdn.jsdelivr.net/npm/translation-resilience@0.5.0/README.md)). Hook the copy button too.
- ChatGPT's and Claude's memory features will learn facts about `PERSON_1`, so keep placeholders stable for each real entity.

**Answer quality**
- Masking costs about 1 point out of 10 on writing tasks ([PrivateNLP 2025](https://aclanthology.org/2025.privatenlp-main.3/)).
- It hurts retrieval-style questions over documents badly: GPT-4o mini fell from 0.80 to 0.32 ([Deußer et al.](https://arxiv.org/abs/2609.11335)). That's the core use for lawyers and accountants.
- Consistent placeholders beat blank redaction.
- Placeholders don't stop re-identification from distinctive facts: an LLM agent re-identified pseudonymous users with 68% recall ([USENIX Security 2026](https://arxiv.org/abs/2602.16800)).

**Kill risks**

| Risk | Likelihood | Mitigation |
|---|---|---|
| A site redesign silently breaks interception and real values go out | High, recurring | Check every send and block on failure; run a daily automated test per site |
| Missed names | High | Review screen, people-and-companies dictionary, "assistive" wording |
| Store treats a downloaded model as remote code | Unknown | Ship detection rules in the package; ask in One Stop Support before launch |
| Store's new "circumvent AI safety measures" rule ([CWS 2026](https://developer.chrome.com/blog/cws-policy-updates-2026)) | Low | Present it as data minimization; never touch system prompts or safety features |
| OpenAI's Atlas browser blocks extensions on chatgpt.com ([forum](https://community.openai.com/t/two-critical-issues-and-suggestions-for-chatgpt-atlas-browser/1368161)) | Medium | Offer a manual copy/paste mode |

## 4. Ranking under the LinkedIn + donations lens

Scored earlier in this project out of 100 against 10 factors, re-weighted for visibility and shareability rather than revenue:

| Rank | Idea | Score | Change after this research |
|---|---|---|---|
| 1 | Redact & Restore | 78 | Crowded, but "open source + tested restore" is still a gap. Keep as flagship |
| 2 | AI-leftover catcher | 77 | [Slop Mop](https://www.theregister.com/a/5298679) (filters other people's AI slop) got press, which suggests interest. Smaller build, a good second post |
| 3 | Screen-share autopilot | 70 | Overlaps Veil's Present mode; ship it as a Veil feature, not a product |
| 4 | Prompt-injection shield | 70 | — |
| 5 | Citation checker | 66 | — |

**Series:** Veil (shipped) → AI-leftover catcher (small, quick) → Redact & Restore (flagship, open source). Redact & Restore can also ship as **Veil 2.0**, which reuses the existing listing, users and reviews.

## 5. Launch plan

Order, from the launch research ([Show HN rules](https://news.ycombinator.com/showhn.html), [Product Hunt guide](https://www.producthunt.com/launch/guide)):

1. **Listing, README and site first,** then 5–10 honest ratings from real users. Never from friends or family ([spam policy](https://developer.chrome.com/docs/webstore/program-policies/spam-faq)).
2. **Show HN,** only once the code is public. HN wants something people can try with no signup, and no landing pages. Expect trust questions; answer them with the code and the no-network test.
3. **LinkedIn document post** within 24 hours, citing the HN thread.
4. **Reddit,** following each subreddit's rules. The rule pages returned 403, so check every sidebar.
5. **Product Hunt** 1–2 weeks later. Launch 12:01 am PT from your own account, and never ask for upvotes.
6. Pull requests to [awesome-privacy](https://github.com/pluja/awesome-privacy) (Browser Addons), nominate for the store's Featured badge via One Stop Support ([docs](https://developer.chrome.com/docs/webstore/discovery)), and add a Firefox listing with its contributions button.

**LinkedIn specifics**
- **Format:** documents (PDF carousels) get 1.39x a profile's median reach; video gets 0.86x ([AuthoredUp](https://authoredup.com/blog/best-performing-content-on-linkedin), 3M posts).
- **Length:** text over 1,000 characters gets 1.18x.
- **Frequency:** 2–3 posts a week ([AuthoredUp](https://authoredup.com/blog/best-performing-content-on-linkedin), [van der Blom](https://podcast.creatorscience.com/richard-van-der-blom-2/)).
- **Timing:** weekdays 3–8 pm local; Wed 4 pm is best ([Buffer](https://buffer.com/resources/best-time-to-post-on-linkedin/), 4.8M posts; Hootsuite disagrees and says Tue/Wed 8–9 am).
- **Links:** they cost 19–27% reach overall, but "almost none" on personal profiles ([Ordinal](https://www.tryordinal.com/blog/linkedin-link-penalty-study)), so put the link in the post.
- **Avoid:** engagement bait ("comment YES"). LinkedIn's March 2026 feed update demotes it ([LinkedIn](https://news.linkedin.com/2026/ImprovingTheFeed)).
- **Stay on topic:** keep posts about "local-first AI privacy" so the feed matches you to strangers.
- **Expect Reddit to outperform LinkedIn at first.** One dev saw 100k+ impressions on Reddit against ~250 on LinkedIn for the same project ([dev.to](https://dev.to/damon-thomas/how-i-missed-out-on-thousands-of-views-launching-my-side-project-3d8d)). LinkedIn is where the profile building happens; Reddit and HN are where the users come from.

**Profile setup**
- Pin the launch post, the site and the repo in **Featured**.
- On the project page: a 30–60 s demo, proof that it's local (the open code, a network-tab screenshot, the no-network test), the donation link and a "hire me" link.
- Turn on a free **Service Page** if you want client messages ([LinkedIn Help](https://www.linkedin.com/help/lms/answer/a550345)).

Drafts for every channel are in [`launch/posts.md`](../launch/posts.md).

## 6. Donations

| Platform | Cut on a tip | Note |
|---|---|---|
| **GitHub Sponsors** (recommended if the code is public) | 0% from personal accounts | ~90 supported countries; check yours ([docs](https://docs.github.com/en/sponsors/getting-started-with-github-sponsors/about-github-sponsors)) |
| **Ko-fi** | 0% platform fee on one-off tips, plus PayPal/Stripe fees (third-party sources; unverified) | Pays straight into your PayPal or Stripe account |
| Buy Me a Coffee | 5% plus Stripe fees, about 14% of a $5 coffee (unverified, official page 404) | Best known name |

**Where to put the link:** the site, the README, the store description (one line), and a quiet link in the popup or settings. The Chrome Web Store policy has no rule against donation links, but notification nags are banned ([policies](https://developer.chrome.com/docs/webstore/program-policies/policies)). That's an inference, not an explicit rule.

**Set expectations.** Dark Reader (~7M users) raises ~$5k a year on Open Collective ([OC](https://opencollective.com/darkreader)). Stylus (~1M) raises $161 ([OC](https://opencollective.com/stylus.json)). Treat donations as a thank-you button. The payoff from this project is the profile, the portfolio and the people who reach out.

## Open questions

- Does Chrome Web Store review treat a downloaded ONNX model as remote code?
- What are Privacy Filter's real latency and memory on an 8–16 GB laptop without WebGPU?
- How often do models paraphrase or merge placeholders in long replies? No benchmark exists. Publishing one would be the differentiator.
- Subreddit self-promotion rules: unverified (the rule pages returned 403).
- Buy Me a Coffee and Ko-fi fees: their official pricing pages couldn't be opened.
