# Businesses Claude Can Run (Almost) Completely

The question here: which remote business models could Claude operate day to day with the owner doing as little as possible? This is a different question from "how do I make money *with* Claude" (see `README.md`).

## Short answer

No business can be handed over **100%**. Three things always need a human:

1. **Legal identity and money.** Bank accounts, Stripe/Shopify payouts, tax, and KYC have to be in a real person's name. Claude can't pass identity checks or CAPTCHAs, and shouldn't hold payment credentials.
2. **Spending decisions.** Ad budgets, refunds above a threshold, and new subscriptions. Anthropic's own test of Claude running a shop ([Project Vend](https://www.anthropic.com/research/project-vend-1)) lost money, partly because Claude got talked into discounts and sent payments to a made-up Venmo account. Keep a human approval step on anything that moves money.
3. **Distribution.** Getting customers is the bottleneck for every model below. Claude can write the posts, ads, and listings, but most platforms (Meta ads, Reddit, TikTok, X) need a human account and forbid bot-run accounts.

What is realistic: **Claude runs ~90% of the operations, and you spend 1–3 hours a week** on approvals, money, and posting. In this environment Claude can run on a schedule (daily or hourly scheduled tasks), push code and websites through GitHub, and manage your Zendrop stores through the connected tool.

## The options, ranked by how much Claude can run

| # | Model | Claude can run | You still do | Startup cost | Time to first $ | Verdict |
|---|---|---|---|---|---|---|
| 1 | **Dropshipping store ops** (Zendrop is already connected) | Product research, importing products, descriptions, pricing, daily order checks, fulfillment, order issues, tracking replies, weekly P&L | Run and pay for ads, approve new products and refunds, own the Shopify/Stripe accounts | $500–2k ad testing + $29/mo Zendrop + Shopify | 2–6 weeks | **Most automatable today.** Weak spot: ads, which decide whether it makes money. Thin margins (15–25%). |
| 2 | **Programmatic niche website** (a useful data/tool site, e.g. calculators, comparison tables, local directories) on GitHub Pages | Build the site, keep the data fresh on a schedule, write pages, fix bugs | Buy a domain, sign up for affiliate/ad programs, share it now and then | ~$15/yr domain | 3–9 months | **Most hands-off long term**, but slow. It only works if each page is genuinely useful; mass AI filler gets demoted by Google. |
| 3 | **Micro-SaaS or paid API** hosted on GitHub plus a cheap host | Build, deploy, fix bugs, answer GitHub issues and support email, ship features | Stripe/Lemon Squeezy setup, launch posts (Product Hunt, Reddit, niche forums), pay for hosting | $0–50/mo | 1–4 months | **Highest ceiling** (median profitable micro-SaaS ≈ $4k MRR), but needs a niche you can reach. |
| 4 | **Digital products** (templates, Claude skills, spreadsheets, guides) on Gumroad / Lemon Squeezy | Make the products, write listings, update them, answer buyer questions | Create the store account, upload listings, promote | $0 | 2–8 weeks | Easy to make, hard to sell without an audience. Good add-on to #2 or #3. |
| 5 | **Curated newsletter** for a niche (Beehiiv / Buttondown) | Research, write, and schedule each issue | Account, sponsor deals, growth | $0–40/mo | 3–6 months | Writing is fully delegable; growth isn't. |
| 6 | **Print-on-demand** (Printful/Printify + Shopify) | Listings, order monitoring, simple text/vector designs | Design quality check, ads, accounts | $0 + ads | 1–3 months | Fulfillment is fully automated, but Claude isn't strong at artwork, and the market is saturated. |

**Avoid:** automated trading bots (you can lose real money fast), fully automated cold-email agencies (deliverability and anti-spam law), mass-produced AI books/YouTube/blogs (platforms demote them), and anything where Claude would pose as a human to customers.

## Recommendation

Start with **#1, because it's already set up**, and build **#2 or #3 alongside it** as the long-term asset.

- **Zendrop store (start this week).** Your account has 2 connected Shopify stores (`bys-store-3010423-847087` and `afhpk9-bb`) on the $29/mo, up-to-20-products plan, and the free trial is already used. That makes it the only model where Claude can start operating today with no new accounts. The catch: it only pays if you're willing to spend about $500–1,000 testing ads. If you aren't, skip to #2/#3 and stop paying for Zendrop.
- **A niche website or micro-SaaS (start in parallel).** Costs almost nothing, Claude can build and maintain it entirely through this GitHub repo, and it compounds instead of depending on ad spend.

## How the handoff would work

1. **Daily scheduled task (Claude):** check orders and fulfillment, handle order issues and tracking questions, and flag anything stuck. For the website or SaaS: refresh data, fix errors, answer issues.
2. **Weekly scheduled task (Claude):** a one-page report covering revenue, costs, ad spend, margin, what to test next, and a short list of decisions that need you.
3. **You, 1–3 hrs/week:** approve or reject that list, move money, launch or kill ads, and post where Claude can't.
4. **Hard rules for Claude:** no spending, refunds over $X, price changes over Y%, or new subscriptions without your OK. Never pretend to be a person. Log every action in this repo.

## Next decision for you

Pick one:
- **A.** "Run the Zendrop stores." Tell me your ad budget and whether either store already has products or sales.
- **B.** "Build an asset." Give me a niche you know (a hobby, a job, a local area) and I'll propose 3 site or SaaS ideas with a build plan.
- **C.** Both.

## Sources

- [Anthropic: Project Vend (Claude running a small shop)](https://www.anthropic.com/research/project-vend-1), plus coverage in [SmartCompany](https://www.smartcompany.com.au/artificial-intelligence/anthropic-ai-small-retail-business-trial/) and [Yahoo Tech](https://tech.yahoo.com/ai/articles/happened-ai-put-charge-running-165633199.html)
- [Baytech: agentic enterprise 2026](https://www.baytechconsulting.com/blog/agentic-enterprise-build-your-ai-team-2026): most companies are still at the pilot stage with agents
- [Printful API](https://www.printful.com/site/api), [MESA: automated Shopify + Printful](https://www.getmesa.com/blog/how-to-build-automated-shopify-store-with-printful)
- Margin and micro-SaaS figures come from the sources listed in `README.md`.

Many of these sources sell tools, so their income claims are optimistic. I found no independent, audited example of a business run end to end by an AI agent.
