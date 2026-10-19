# money-maker

Research on the most realistic ways to make money with Claude, plus a reusable prompt (`PROMPT.md`) that turns Claude into a business partner for picking one path and executing it.

## What the research says (Oct 2026)

Most "make money with AI" articles are SEO filler that reuse the same list. Where real numbers show up, here's how the main options compare:

| Path | Startup cost | Time to first $ | Realistic ceiling (solo) | Why Claude helps |
|---|---|---|---|---|
| **AI automation services for local/small businesses** | ~$0 | 2–6 weeks | $8k–18k/mo with 4–10 retainer clients | Claude Code builds the workflows (lead follow-up, intake, reporting, support triage) |
| **Done-for-you writing services** (ghostwriting, sales copy, proposals, content repurposing) | ~$0 | 1–3 weeks | $3k–10k/mo | Claude drafts in the client's voice; you sell and edit |
| **Micro-SaaS / niche tools** | $0–200/mo | 1–3 months | Median profitable micro-SaaS is about $4.2k MRR | Claude Code does most of the build, even if you're not a developer |
| **Digital products** (Claude skills, templates, prompt packs, guides) | ~$0 | 2–8 weeks | Very uneven, depends on audience | Fast to make, but distribution is the bottleneck |
| **Dropshipping** (Zendrop is already connected to this account) | $500–2k+ ad spend | 1–2 months | 15–22% net margin; solo Pro operators net about $1.8k–3.5k/mo on 200–300 orders | Product research, ad copy, store ops, order handling via the Zendrop connector |

**What this means:** the fastest, lowest-risk route is **selling a service first** (automation or writing), because it costs nothing to start and you get paid before you build. Then turn the work you repeat most into a **product** (SaaS, template, or skill). Dropshipping needs real ad money up front and has thin margins. Only do it if you have money to risk on testing.

**Things that don't work:** mass-producing AI blog posts, KDP books, or faceless YouTube channels with no editing or point of view (the platforms flood and demote it), and any "passive income" pitch that skips getting customers.

Sources: [taskip: AI agency pricing](https://taskip.net/ai-automation-agency-pricing/), [developersmatrix: agency pricing](https://developersmatrix.com/blog/ai-automation-agency-pricing-2026), [superframeworks: micro-SaaS](https://superframeworks.com/articles/best-micro-saas-ideas-solopreneurs), [aimagicx: vibe-coding micro-SaaS](https://www.aimagicx.com/blog/vibe-coding-solopreneur-micro-saas-guide-2026), [Ryan Doser: selling Claude skills](https://ryandoser.com/make-money-with-claude/), [unil.ink: Zendrop guide](https://unil.ink/blog/zendrop-guide-2026), [Zendrop: dropshipper earnings](https://www.zendrop.com/blog/how-much-do-dropshippers-make/), [TrueProfit: dropshipping profitability](https://trueprofit.io/blog/is-dropshipping-profitable), [IdeasRepay: Claude side hustles](https://www.ideasrepay.com/blog/claude-ai-side-hustles).

Many of these sources sell tools or courses, so read their income numbers as optimistic upper bounds, not as what to expect.

## Jarvis

Open this repo in Claude Code and it becomes **Jarvis**, a business partner that runs `PROMPT.md` with you and remembers where you are between sessions.

- First session: just say hi. Jarvis asks a few questions about you and saves the answers to `jarvis/profile.md`.
- `/jarvis`: daily briefing (progress, anything that needs attention, today's top 3).
- `/scorecard`: log the week's numbers and get the one thing to fix.
- Memory lives in `jarvis/` (profile, scorecard, log), and deliverables go in `work/`. Jarvis commits these so they survive cloud sessions.
- **Talk to Jarvis out loud:** run the voice version on your computer. See [`voice/README.md`](voice/README.md) for the 5-minute setup and a comparison of other ways to get a talking assistant.
