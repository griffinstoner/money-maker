# Claude Prompts for Each Job

Paste these into Claude (or a Claude Code session in this repo) with the PDF pages attached. Replace the `[brackets]`.

**Rule for all of them:** Claude must cite the page/section for every item. Check anything that will change the price against that source page before it goes to a client.

---

## Prompt 1: Spec scope extraction

```
You are a commercial estimator for a [drywall/framing] subcontractor.
Attached are spec sections [09 21 16, 09 22 16, ...] for [Project].

Produce a scope checklist for this trade:
1. Materials and products required (with manufacturer/basis-of-design if named)
2. Assembly requirements: fire ratings, STC ratings, UL designs, finish levels,
   deflection track, moisture/abuse-resistant board locations
3. Items that are often missed or costly: shaft wall, head-of-wall details,
   control joints, backing/blocking, corner bead types, mockups, testing
4. Explicit exclusions or "by others" items
5. Submittals, warranties, and allowances that affect price

Cite the section and paragraph number for every item. If something is ambiguous,
put it in a separate "Ambiguous / needs RFI" list. Do not guess.
```

## Prompt 2: Drawing/spec conflict check

```
Attached are the wall type legend / finish schedule / general notes [sheets A-xxx]
and the spec scope checklist from before.

List every conflict or gap between drawings and specs. Examples: a wall type
calls for a board the spec doesn't list, rated walls with no UL design,
heights not shown, finish levels not defined.
Format: | # | Drawing ref | Spec ref | Issue | Pricing impact (High/Med/Low) |
```

## Prompt 3: Inclusions / exclusions / clarifications sheet

```
Using the scope checklist and conflict list, write a one-page
"Inclusions, Exclusions & Clarifications" sheet for [Client]'s bid on [Project].
Use the style and standard exclusions from this past bid from the client: [paste].
Keep it short and specific. Base every clarification on a real conflict found.
```

## Prompt 4: Questions for the GC

```
Turn the "Ambiguous / needs RFI" items and High/Med conflicts into pre-bid
questions [Client] can send to the GC. One question per item, cite the sheet/spec,
and propose an assumption: "If no answer by bid day, we will assume ___."
```

## Prompt 5: Delivery email

```
Write a short delivery email to [Client contact] for the [Project] takeoff.
Totals: [bid total], [$/SF]. Key assumptions: [list]. Open decisions for them: [list].
Attachments: estimate xlsx, markup PDF, scope sheet, GC questions.
Plain, direct and under 150 words. No filler.
```

## Prompt 6: Addendum impact

```
Attached is Addendum [#] for [Project] and our current takeoff summary.
List every change that affects [trade] scope or quantities, cite the item,
and say which takeoff lines need to be re-measured or re-priced.
```

## Prompt 7: Prospect research (weekly)

```
Find active bid opportunities in [metro] with interior work (offices, schools,
healthcare, multifamily) where bids are due in the next 2–4 weeks. Look at public
agency bid portals for [city/county/school district/state]. For each: project name,
owner, GC(s) if listed, bid date, link to plan holders' list if public.
Then list the [drywall/painting] subcontractors on those plan holders' lists.
```
