# Job Workflow: Intake → Takeoff → QC → Delivery

Follow this for every job. The QC checklist is not optional. One bad takeoff loses a client.

## 1. Intake (15 min)

When a request comes in from the website form or by email:

- [ ] Reply within 1 business day: confirm scope, turnaround date and price (or "free first takeoff").
- [ ] Get the **complete** set: drawings (architectural, plus structural/RCP/finish schedules if relevant), project manual / specs, **all addenda**, bid form.
- [ ] Bid due date and time. Deliver at least **1 business day before** it.
- [ ] Scope boundaries: which areas, alternates, unit prices requested, base bid only?
- [ ] Client's estimate template and unit prices (first job only; save to `clients/<client>/`).
- [ ] Log the job in the pipeline tracker.

**Don't start without the full set.** If plans arrive less than 3 business days before the bid, quote a rush fee or decline.

## 2. Scope read (30–60 min, Claude)

- [ ] Run **Prompt 1: Spec scope extraction** from `claude-prompts.md` on the trade's spec sections (e.g. Division 09 21 16 Gypsum Board Assemblies).
- [ ] Run **Prompt 2: Drawing/spec conflict check** on the wall-type sheet, finish schedule, and general notes.
- [ ] Save the output as `scope-notes.md` in the job folder. You check it by hand. Claude can misread a spec, so confirm every line against the source page it cites.

## 3. Takeoff (2–4 hrs, takeoff software)

- [ ] **Set and verify scale on every sheet.** Measure a known dimension (a door, a grid line) to confirm.
- [ ] Set up conditions/assemblies to match the wall-type legend and finish schedule, one per type.
- [ ] Take off by floor and area, in the same order every time (e.g. top-left to bottom-right).
- [ ] Color-code by type and keep a legend on each sheet.
- [ ] Note heights: full height vs. to ceiling vs. above ceiling (deck). Height errors are the most common big miss.
- [ ] Count openings and deduct where your client deducts (ask once, save their rule).
- [ ] Export quantities into `estimate-template.xlsx` → `Takeoff` sheet, with the drawing reference for every line.

## 4. Pricing (30 min)

- [ ] Apply the client's unit prices, waste factors, overhead and profit (Project sheet).
- [ ] Never invent labor rates. Missing a price? Leave it blank and flag it.

## 5. QC checklist (30 min, must pass before delivery)

- [ ] Scale verified on every sheet used.
- [ ] Every wall/ceiling/floor type in the legends appears in the takeoff, or is noted as not in scope.
- [ ] All addenda reviewed and applied. List them on the Project sheet.
- [ ] Ratio checks: wall board SF ÷ floor SF is in a normal range for the building type, and **Bid $/SF** is in line with the client's past jobs. If not, find out why.
- [ ] Spot-check 3 random lines by re-measuring them.
- [ ] Inclusions/exclusions sheet matches the specs.
- [ ] Totals add up, there are no blank prices without a flag, and units are consistent.
- [ ] A second pair of eyes if available (fill in "Checked by").

## 6. Delivery

Send one email with:

1. `Estimate – <Project>.xlsx`
2. `Takeoff markup – <Project>.pdf` (color-coded drawings with legend)
3. `Scope & exclusions – <Project>.pdf` (from Prompt 3)
4. `Questions for GC – <Project>` (from Prompt 4, ready to paste)
5. A 3–5 line summary: totals, $/SF, biggest assumptions, anything they must decide.

Use the delivery email in `claude-prompts.md` (Prompt 5).

## 7. After the bid

- [ ] Ask: "Did you submit? Win or lose, and where did you land vs. the low number?" Record it in the tracker.
- [ ] Build up a $/SF history per client and building type. This makes your QC better every month.
- [ ] If they win a job, ask for a referral.
