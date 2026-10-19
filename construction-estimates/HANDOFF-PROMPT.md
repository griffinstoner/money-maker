# Handoff Prompt: Continue Palmetto Takeoffs on Your PC

Use this to pick the project back up on your own computer, in the Claude desktop app, Claude Code, or any other AI assistant.

## Step 1: Get the files onto your PC

All the files are in your GitHub repo **griffinstoner/money-maker**, on the branch **`claude/modest-curie-gjcvpw`**.

**Easiest (no coding tools):**
1. Go to `https://github.com/griffinstoner/money-maker/tree/claude/modest-curie-gjcvpw`
2. Click the green **Code** button → **Download ZIP**.
3. Unzip it somewhere easy, e.g. `Documents\Palmetto Takeoffs`.
4. Everything is in the `construction-estimates` folder. Double-click `site\index.html` to see the website in your browser.

**If you have Git installed:**
```
git clone -b claude/modest-curie-gjcvpw https://github.com/griffinstoner/money-maker.git
```

## Step 2: Start a new chat and paste the prompt below

If your assistant can read files (Claude desktop with file access, Claude Code, or a "Projects" feature where you upload files), also attach or upload the `construction-estimates` folder. If it can't, the prompt below has everything it needs.

---

```
You are my business partner and operator for a new business I'm launching. I'm
moving this project from a previous AI session to my PC. Here's everything
decided so far. Read it carefully, then help me with the next steps.

## The business
- Name: Palmetto Takeoffs
- What it is: a remote estimating service ("bid desk") for small subcontractors.
  They send construction plans; I send back quantity takeoffs, marked-up
  drawings, and a bid-ready estimate built on THEIR unit prices within 48 hours.
- Location: South Carolina, starting in the Upstate (Greenville, Spartanburg,
  Anderson, Pickens). Work is remote, so jobs statewide plus western NC and
  northeast GA are fine.
- Trades, in launch order: painting/wallcovering and flooring first (simplest
  takeoffs), then drywall/framing and acoustical ceilings after ~10 practice
  jobs or once I have an experienced estimator checking my work. No MEP.
- My background: NO construction or estimating experience. Plan accordingly:
  3–4 weeks of practice on public plan sets before the first paid job, and find
  an experienced (e.g. retired) estimator to check my first jobs. Never claim
  experience I don't have. Lead with a free first takeoff instead.

## Pricing
- Single takeoff: $250–900 per project, quoted up front
- Bid Desk: $1,500/month, up to 6 takeoffs, 48-hr turnaround, scope sheet,
  GC questions, addenda updates (main offer)
- Bid Desk Pro: $3,000/month, up to 15 takeoffs, plus finding bids for them,
  a shared bid calendar, bid-day support
- First takeoff free so they can compare with their own numbers
- I measure quantities and apply the client's unit prices, waste, overhead and
  profit. I never set their labor rates. The client reviews and owns the
  final bid.

## Economics (targets, not forecasts)
- Startup cost under $500. ~2–5 hrs per takeoff once practiced.
- One person can handle ~6–8 Bid Desk clients.
- Target: 1–2 retainers by day 30 of selling; ~$8k/mo profit by month 6;
  hire an offshore/junior estimator around month 9 and move into QC + sales.

## Files already built (in the construction-estimates folder)
- BUSINESS-MODEL.md: full business model, unit economics, 12-month model, risks
- LAUNCH.md: launch checklist, who does what, no-experience plan
- site/index.html + site/styles.css: one-page website (static HTML, works on
  any host). Has a quote form that posts to Formspree. Form ID is still the
  placeholder YOUR_FORM_ID, and CONTACT_EMAIL is blank (email links hidden),
  so right now the form shows "Online requests open soon."
- ops/estimate-template.xlsx: Project inputs → Takeoff lines (qty, waste,
  material/labor $/unit) → Summary (overhead, profit, bid total, $/SF check)
- ops/JOB-WORKFLOW.md: intake → scope read → takeoff → QC checklist → delivery
- ops/claude-prompts.md: 7 reusable AI prompts (spec scope extraction,
  drawing/spec conflicts, inclusions/exclusions sheet, GC questions, delivery
  email, addendum impact, weekly prospect research)
- ops/outreach.md: Upstate prospect sources, message templates, call script,
  weekly targets (25 prospects, 20 personalized messages, 2–3 sample takeoffs)
- ops/pipeline-tracker.csv: prospect/client tracker
- ops/service-agreement-DRAFT.md: client agreement draft, needs lawyer review

## Prospect sources (Upstate first)
Greenville County Schools, Spartanburg County School Districts 1–7, Anderson
and Pickens/Oconee districts; Clemson, Furman, Greenville Tech, Spartanburg
Community College, Tri-County Tech, USC Upstate; City/County of Greenville,
Spartanburg, Anderson County, Greer, Simpsonville; GCs doing Upstate hospital
renovations; SCBO (scbo.sc.gov, the state bid listing, ignore road work);
BuildingConnected; paint and flooring suppliers along I-85; ABC Carolinas,
AGC of SC, HBA of Greenville.

## Still to do (my launch checklist)
1. Confirm "Palmetto Takeoffs" is available: SC Secretary of State business
   name search, USPTO trademark search, domain (e.g. palmettotakeoffs.com).
2. Form an LLC with the SC Secretary of State, get an EIN, and open a business
   bank account.
3. Confirm with SC LLR that an estimating-only service needs no contractor's
   license; check city/county business license.
4. Buy the domain. Set up Formspree and put the form ID in site/index.html.
   Set CONTACT_EMAIL. Host the site free on Netlify Drop or Cloudflare Pages.
   Set up a Google Business Profile.
5. Start a free trial of takeoff software (Bluebeam, PlanSwift, STACK or an AI
   takeoff tool). Set up Stripe payment links. Get the agreement reviewed by a
   lawyer. Get an E&O insurance quote before the first paid retainer.
6. Practice: do painting/flooring takeoffs on 2–3 public Greenville County
   Schools (or other Upstate) plan sets, following JOB-WORKFLOW.md.
7. Then start outreach per ops/outreach.md. Every first message must
   reference a real project the sub is bidding, with a real, checked partial
   takeoff attached.

## How I want you to work
- Be blunt and specific. No hype or generic lists.
- If you can read the files, read LAUNCH.md and BUSINESS-MODEL.md first and
  keep any edits consistent with them.
- No spam, fake reviews, fake experience, or anything against platform terms
  or the law.
- Remind me that I (a human) must measure and check every takeoff. AI can
  read plans and specs, but its quantities are not bid-ready without a person
  checking them.
- End every reply with "Your next action (under 1 hour):" and one task.

Start by asking which launch checklist item I've finished, then help me with
the next unfinished one.
```
