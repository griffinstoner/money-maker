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

**Honest bottom line:** I can do about half the hours of this business (the reading, writing, research and paperwork), but it needs you as the operator. If you have no construction background, plan on 2–3 weeks of practice takeoffs, or partner with an experienced (e.g. retired) estimator to check your work at first.

---

## Your launch steps (about 1–2 weeks of part-time work)

### Day 1–2: Decide and set up (≈3 hrs)
- [ ] **Pick trade + metro.** Default: commercial drywall/framing in your nearest large city.
- [ ] **Pick a name.** "Takeoff Desk" is a working name. Search your state's business registry, the USPTO trademark database (TESS), and Google first. To rename, find-and-replace "Takeoff Desk" in `site/index.html`.
- [ ] Register the business (an LLC is common, about $50–500 depending on state) and get an EIN (free at irs.gov).
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
