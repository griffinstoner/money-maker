# Takeoff Desk: Launch Checklist

Everything needed to start is in this folder:

| File | What it is |
|---|---|
| `BUSINESS-MODEL.md` | The plan: customers, pricing, unit economics, 12-month model, risks |
| `site/` | The website (`index.html` + `styles.css`): a static site that works on any host |
| `ops/estimate-template.xlsx` | Estimate workbook: Project inputs → Takeoff lines → Bid summary with $/SF check |
| `ops/JOB-WORKFLOW.md` | Intake → scope read → takeoff → **QC checklist** → delivery |
| `ops/claude-prompts.md` | The prompts Claude runs on every job (spec read, conflicts, scope sheet, GC questions, addenda) |
| `ops/outreach.md` | Where to find prospects, message templates, call script, weekly targets |
| `ops/pipeline-tracker.csv` | Prospect and client tracker (open in Google Sheets or Excel) |
| `ops/service-agreement-DRAFT.md` | Client agreement draft. **A lawyer must review it before use.** |

---

## Who does what

I can build things and do the desk work. Some things legally and practically need a real person with their name on the business.

| Task | Who |
|---|---|
| Website, templates, contracts, outreach messages | ✅ **Claude** (done) |
| Finding live bids and prospects on public plan rooms each week | ✅ **Claude** (Prompt 7, can run on a schedule) |
| Reading specs, finding conflicts, writing scope sheets, GC questions, delivery emails, addenda reviews | ✅ **Claude**, with you checking against the source pages |
| Drafting every outreach message for a specific prospect and project | ✅ **Claude**. **You** send it from your own email. |
| Measuring drawings (the takeoff itself) | ⚠️ **You**, in takeoff software. Claude can read plans and do rough quantities, but it can't yet measure a full plan set accurately enough to bid on. A human must measure and check. |
| Business registration, bank account, Stripe, insurance | 🧑 **You**. These need your identity and signature. |
| Sending emails, taking calls, signing contracts, receiving payment | 🧑 **You** |
| Being accountable when a number is wrong | 🧑 **You**. This is why the QC checklist exists. |

**Honest bottom line:** I can do about half the hours of this business (the reading, writing, research and paperwork), but it needs you as the operator. You have no construction background yet, so follow **"Starting with no construction experience"** below before you sell anything.

---

## Starting with no construction experience

You can do this, but **don't sell drywall takeoffs in week one.** Change the order:

1. **Start with painting and flooring.** These are the simplest takeoffs: wall and floor areas from the finish schedule, plus door and frame counts. The site already lists them first. Add drywall/framing only after about 10 practice jobs, or once you have an estimating partner.
2. **Get an experienced estimator to check your first jobs.** Look for a retired estimator or project manager who will check your takeoffs for $50–75/hr or a share of each job. Places to look: ABC Carolinas, AGC of South Carolina, local SCORE mentors (free), and estimating groups on LinkedIn. This is the single biggest risk reducer.
3. **Learn from real plans.** Download 3–5 public SC school or university projects (see `ops/outreach.md` for where), do the painting/flooring takeoffs, and compare your quantities with the published bid tabs, where available, or with your partner's check.
4. **Learn the vocabulary first.** Read the free training for your takeoff software, and a painting/drywall estimating guide (e.g. PDCA resources for painting). Ask Claude to explain any plan sheet or spec section line by line. That's what `ops/claude-prompts.md` is for.
5. **Don't go out with "experience" you don't have.** Offer "free first takeoff, compare it with your numbers." That way the work earns trust before you claim anything.

Expect **3–4 weeks of practice** before your first paid job, not 1–2.

---

## Your launch steps

### Day 1–2: Decide and set up (≈3 hrs)
- [ ] **Pick a starting metro** in South Carolina: Greenville–Spartanburg (Upstate), Columbia (Midlands) or Charleston (Lowcountry). Sell statewide, since the work is remote, but focus your outreach in one area first.
- [ ] **Pick a name.** "Takeoff Desk" is a working name. Search your state's business registry, the USPTO trademark database (TESS), and Google first. To rename, find-and-replace "Takeoff Desk" in `site/index.html`.
- [ ] Register an LLC with the **SC Secretary of State** (online filing; check the current fee on sos.sc.gov) and get an EIN (free at irs.gov).
- [ ] Check with **SC LLR** (Contractor's Licensing Board) to confirm that an estimating-only service needs no contractor's license. Since you won't perform construction work it normally shouldn't, but confirm it. Also check your city/county business license.
- [ ] Open a business bank account.

### Day 2–3: Put the site live (≈1 hr)
- [ ] **Buy a domain** (~$12/yr at Cloudflare, Namecheap, etc.).
- [ ] **Set up the form:** create a free Formspree account → new form → copy the form ID. In `site/index.html`, replace `YOUR_FORM_ID` in the `<form action="...">`, and replace every `hello@example.com` with your email. (Until then, the form opens the visitor's email app instead.)
- [ ] **Host it for free:** drag the `site/` folder onto **Netlify Drop** (app.netlify.com/drop) or **Cloudflare Pages**, then connect your domain. Alternatively, use GitHub Pages from this repo.
- [ ] Set up a Google Business Profile (free) for local search.

### Day 3–5: Tools (≈2 hrs)
- [ ] Takeoff software: start a free trial of Bluebeam, PlanSwift, STACK or an AI takeoff tool. Choose by the end of the trial.
- [ ] **Stripe:** create Payment Links for "Bid Desk – $1,500/mo" (recurring) and "Single Takeoff" (custom amount). Or invoice through Stripe.
- [ ] Have a lawyer review `ops/service-agreement-DRAFT.md` (often $300–800 flat fee). Use e-signature (Dropbox Sign, DocuSign free tiers).
- [ ] Get a quote for **professional liability (E&O) insurance**. Buy it before your first paid retainer.

### Week 1–2: Practice (≈10 hrs)
- [ ] Download 2 public plan sets from a city or school district bid portal. Do full takeoffs following `JOB-WORKFLOW.md`.
- [ ] Use those as your sample deliverables (they're public projects, so you can show them).

### Week 2+: Sell
- [ ] Follow `ops/outreach.md`. 20 personalized messages a week, each with a real partial takeoff.
- [ ] Goal for day 30: **1–2 retainers ($1,500–3,000/mo)**.

---

## How to hand me a job

Open a Claude Code session in this repo, attach the plan/spec PDFs, and say for example:

> "New job: [Project] for [Client], drywall, bid due [date]. Run steps 1–2 of the job workflow on the attached specs and drawings."

I'll produce the scope checklist, conflict list, scope sheet and GC questions, and I'll fill in the estimate workbook once you give me the quantities from your takeoff.

To find prospects, ask: **"Run the weekly prospect search for [metro], [trade]."** I can also set it up as a scheduled task that runs every Monday.
