# Business Model: Remote Construction Estimates

**One line:** A remote "bid desk" for small subcontractors. They send plans, we send back quantity takeoffs and bid-ready estimates within 48 hours, so they can bid more jobs without hiring a full-time estimator.

Fits path #1 in the [README](../README.md) (a service first, then a product). It costs almost nothing to start, the work is done entirely online, and Claude speeds up the slowest parts.

---

## 1. The problem

- Small subcontractors (roughly 2–25 employees) usually have the **owner do the estimating**, at night, after a day on site. That limits how many jobs they bid, and **bid volume drives revenue**.
- A full-time estimator costs a salary plus benefits. Freelance estimators charge about **$75–200/hr** ([DEV](https://dev.to/designestimation/how-much-does-construction-estimating-cost-in-2026-3h6p)), which adds up fast for a firm that bids every week.
- Takeoff software helps (Togal.AI is about $299/user/mo, STACK about $2.6k/user/yr, PlanSwift about $1.6–2k) ([Dupple](https://dupple.com/learn/best-construction-estimating-software), [FitGap](https://us.fitgap.com/products/togal-ai), [G2](https://www.g2.com/compare/senterprisys-limited-project-de-risk-vs-stack-takeoff-estimate-vs-planswift)), but **someone still has to run it, check it, and price it**. Most owners don't want to learn another tool.

**What the customer is really buying:** more bids out the door, on time, without losing their evenings.

## 2. Who to sell to

Pick **one trade in one region** first. Trades with repetitive, measurable takeoffs are the easiest:

| Trade | Why it works | What you deliver |
|---|---|---|
| **Drywall / framing / acoustical ceilings** | Area- and length-heavy, bids constantly | SF of board by type, LF of studs/track, ceiling SF |
| **Painting / wallcovering** | Simple quantities, lots of small bidders | Wall/ceiling SF by finish, door/frame counts |
| **Flooring** | Room-by-room areas from finish schedules | SF/SY by material, LF of base, transitions |
| **Concrete / flatwork** | Volume math plus rebar | CY, SF of slab, LF of footings, rebar estimate |
| **Roofing (residential)** | Can be done from aerial reports, no plans needed | Squares, pitch, ridges/valleys, materials list |

**Best first niche:** commercial **drywall or painting** subs in one metro area. They bid often, the plans are on public plan rooms, and the takeoffs are well defined.

**Not a fit at first:** MEP (mechanical, electrical, plumbing). It needs deep trade knowledge, and mistakes are costly.

## 3. The offer

> "I help [drywall] contractors in [metro] bid 2x more jobs by delivering accurate takeoffs and bid-ready estimates within 48 hours, without hiring an estimator. $1,500/month."

### Pricing

| Tier | Price | What's included | Who it's for |
|---|---|---|---|
| **Single takeoff** | $250–400 (residential / small commercial)<br>$500–900 (larger commercial) | Quantities plus a marked-up plan PDF | Trying you out, one-off bids |
| **Bid Desk** (main offer) | **$1,500/mo** | Up to 6 takeoffs/mo, priced estimate in their template, scope/exclusions sheet, 48-hr turnaround | Subs bidding every week |
| **Bid Desk Pro** | **$3,000/mo** | Up to 15 takeoffs/mo, plan-room monitoring (find bids for them), bid-day support, sending addenda updates | Growing subs who want a full bid department |

- First takeoff at a **discount or free** in exchange for a side-by-side check against their own numbers. This builds trust faster than any pitch.
- Monthly retainers beat per-job pricing: predictable income for you, and a price lower than a hire for them.
- **You produce quantities and apply THEIR unit prices.** They own the final number. This keeps you out of the business of guessing labor rates, and limits liability.

## 4. How the work gets done

1. **Intake.** The client forwards a bid invite (BuildingConnected, email, plan room). You download the drawings, specs, and addenda.
2. **Scope read (Claude).** Claude reads the spec sections for the trade and pulls out materials, finishes, fire ratings, and exclusions into a checklist. It flags conflicts between specs and drawings. This step often takes an hour or more by hand.
3. **Takeoff (software).** Measure in Bluebeam, PlanSwift, or an AI takeoff tool. AI auto-takeoff is fast but **always needs a human check**. Wall types, scale, and partial-height walls are common errors.
4. **Pricing.** Load quantities into the client's own spreadsheet/template with their unit costs, waste factors, and markup.
5. **Bid package (Claude).** Claude drafts the proposal letter, inclusions/exclusions, clarifications, and RFI questions in the client's voice.
6. **QC and delivery.** Check totals against a rule-of-thumb (e.g. $/SF for similar jobs). Send the estimate, marked-up drawings, and a short summary of notes and risks.

**Target time:** 2–5 hours per takeoff once you know the trade, versus 6–12+ hours for an owner doing it at night.

### Startup costs

| Item | Cost |
|---|---|
| Takeoff software (Bluebeam or PlanSwift; AI tool optional) | ~$0–300/mo (start with trials, check current pricing) |
| Claude subscription | ~$20–200/mo |
| Plan rooms (BuildingConnected, public agency portals) | Usually free for subs |
| Simple website / one-page site, Stripe invoicing | ~$0–20/mo |
| **Total to start** | **under $500** |

## 5. Unit economics

**Bid Desk client ($1,500/mo, 6 takeoffs at ~3.5 hrs each):**

- Hours: about 21/mo, plus ~3 hrs of communication = **~24 hrs**
- Effective rate: **~$62/hr** at first, rising to **$100+/hr** as templates and tools speed you up
- Cost of serving them: software and Claude spread across clients ≈ $50–75/client
- **Gross margin: ~95%** while you do the work yourself; ~50–60% once you hire help (see below)

**Capacity:** one full-time person can carry about **6–8 Bid Desk clients** (~140–190 hrs/mo).

## 6. 12-month financial model (one person, then one hire)

Assumptions: 1 new retainer client per month from month 3, one-off takeoffs on the side, 10% client churn after month 6, and one junior/offshore estimator hired at month 9 (remote estimator postings show about $1,500–2,200/mo for offshore/contract roles ([Workable](https://jobs.workable.com/jobs/09da8d37-5d68-4a86-b6d9-0aff67545194.md))). You move into QC and sales.

| Month | Retainer clients | Retainer rev | One-off rev | Costs | **Profit** |
|---|---|---|---|---|---|
| 1 | 0 | $0 | $600 | $300 | **$300** |
| 2 | 1 | $1,500 | $900 | $300 | **$2,100** |
| 3 | 2 | $3,000 | $900 | $350 | **$3,550** |
| 6 | 5 | $7,500 | $1,200 | $450 | **$8,250** |
| 9 | 7 | $10,500 + 1 Pro ($3,000) | $1,200 | $2,700 (hire) | **$12,000** |
| 12 | 9 | $13,500 + 2 Pro ($6,000) | $1,500 | $5,000 (2 hires) | **$16,000** |

**Treat these numbers as a target, not a forecast.** The slow part is the first 2–3 retainers. After that, referrals between subs and GCs tend to drive growth. Being late or inaccurate once can lose a client, so don't take on more work than you can handle well.

## 7. How to get clients

1. **Find who's bidding.** Public bid lists and plan holders' lists (city, county, school district, and state DOT portals) show which subs are bidding which jobs. That's a free, warm prospect list.
2. **Lead with work, not a pitch.** Pick a job they're bidding right now, do a quick partial takeoff (one floor or one area), and send it: "I took off level 1 of the [Project] drywall: 18,400 SF of 5/8" Type X. I can do the full set by Thursday for $300." This beats any generic cold email.
3. **Talk to GCs.** General contractors want more sub bids on every package. Ask them to recommend you to subs who often fail to bid.
4. **Local trade groups.** ABC/AGC chapters, local supply houses (drywall and paint suppliers know every sub in town), and trade Facebook groups.
5. **Referral offer.** One free takeoff for every referred client who signs.

**Weekly targets:** 20 personalized outreach messages → 3–4 replies → 1–2 free/paid test takeoffs → 1 retainer close every 2–4 weeks.

## 8. Business model canvas

| | |
|---|---|
| **Customer segments** | Small commercial subs (drywall, painting, flooring, concrete) in one metro; later, residential roofers and small GCs |
| **Value proposition** | More bids, 48-hr turnaround, no estimator hire, owner gets evenings back |
| **Channels** | Plan-holder lists, sample takeoffs, GC referrals, supply houses, trade groups |
| **Customer relationships** | Monthly retainer, a dedicated estimator, shared bid calendar |
| **Revenue streams** | Retainers ($1.5k/$3k), one-off takeoffs ($250–900), later software subscriptions |
| **Key activities** | Spec reading, takeoff, pricing in client templates, QC, bid packaging |
| **Key resources** | Trade knowledge, takeoff templates and checklists, Claude workflows, assemblies library |
| **Key partners** | Takeoff software vendors, plan rooms, supply houses, offshore estimator talent |
| **Cost structure** | Software (~$300/mo), Claude, later estimator salaries; almost no fixed costs |

## 9. Risks and how to handle them

| Risk | How to handle it |
|---|---|
| **A takeoff error costs a client money on a job they win** | Client applies their own prices and approves the final bid. Use a written scope-of-service and limitation-of-liability clause (have a lawyer review it), QC checklist on every job, and carry professional liability (E&O) insurance once you have revenue. |
| **You don't know the trade** | Start with the simplest trade. Learn from the trade's estimating guides and the client's past bids. Your first 2–3 test takeoffs are compared against the client's own numbers. Partnering with a retired estimator for QC is a strong shortcut. |
| **AI takeoff tools get good enough that subs do it themselves** | Sell the outcome (bids out the door), not the measuring. Most owners don't want to run software. Use the same AI tools yourself to lower your cost. |
| **Bid-day crunch: everyone's bids due the same day** | Cap jobs per client per week, require plans 3+ business days before the due date, and keep a shared bid calendar. |
| **Offshore estimating firms undercut you** | Compete on being local: knowing regional codes, suppliers, and GCs, being in the same time zone, and being able to call during bid day. |
| **Clients ask for labor pricing** | Stay with quantities plus their unit prices until you have real data on regional labor rates. |

## 10. First 30 days

| Days | Goal | Measurable target |
|---|---|---|
| **1–7** | Pick trade and metro. Learn the takeoff tool. Make 2 practice takeoffs from public plan sets. | 2 practice takeoffs done, a QC checklist and estimate template built |
| **8–14** | Build a prospect list from public plan-holder lists. Make a 1-page site and a sample takeoff PDF. | 50 prospects listed, 20 outreach messages sent |
| **15–21** | Send sample partial takeoffs on live bids. Offer the first full takeoff free or at a discount. | 3 test takeoffs delivered, 1 paid takeoff |
| **22–30** | Convert test clients to Bid Desk. Ask for a referral from each. | **1–2 retainers signed ($1.5–3k MRR)** |

## 11. Where this goes next (the product)

Once you have done 50+ takeoffs in one trade, you have something most software companies don't: real data and repeatable workflows. Possible products:

- **Spec-reader tool:** upload a spec book, get a trade-specific scope checklist with conflicts flagged (built with Claude Code + the Claude API). Sell at $50–150/mo to subs and estimators.
- **Assemblies and templates library** for one trade (digital product).
- **Bid-tracker micro-SaaS:** bid calendar, win/loss tracking, and $/SF benchmarks by job type.

Service revenue funds the build, and service clients become the first beta users.

---

### Sources

[DEV: construction estimating costs 2026](https://dev.to/designestimation/how-much-does-construction-estimating-cost-in-2026-3h6p), [TechnBrains: AI construction estimating](https://www.technbrains.com/blog/ai-construction-estimating/), [Dupple: estimating software 2026](https://dupple.com/learn/best-construction-estimating-software), [FitGap: Togal.AI pricing](https://us.fitgap.com/products/togal-ai), [G2: STACK vs PlanSwift](https://www.g2.com/compare/senterprisys-limited-project-de-risk-vs-stack-takeoff-estimate-vs-planswift), [Pctechmag: estimating software for small contractors](https://pctechmag.com/2026/06/best-construction-estimating-software-for-small-contractors-in-2026/), [Workable: remote estimator posting](https://jobs.workable.com/jobs/09da8d37-5d68-4a86-b6d9-0aff67545194.md), [SiteRecon: subcontractors](https://order.siterecon.ai/who-we-serve/subcontractors), [Kinetic Staff: offshore estimators](https://www.kineticstaff.com/industries-we-serve/engineering/estimator/).

Most of these are vendor or staffing-firm pages, so treat their numbers as optimistic. The pricing tiers and financial model above are assumptions to test with real customers, not market data.
