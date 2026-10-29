# 100-Point Resume Scoring Rubric

Use this when the local script is unavailable, or to explain its heuristic result. Score the resume as it would be read by a recruiter and parsed by an ATS, not as a writing exercise.

## Weights

| Dimension | Points | What earns the points |
| :--- | ---: | :--- |
| Content and evidence | 30 | Relevant scope, owned outcomes, credible metrics, no filler |
| Targeting and keywords | 25 | Exact must-have terms, title alignment, domain language, 75%+ coverage |
| Structure and scanability | 15 | Standard order, top-third signal, 1-2 pages, scannable bullets |
| ATS formatting | 15 | Single column, selectable text, standard fonts/headers, clean file |
| Credibility and consistency | 10 | Dates, titles, tense, no contradictions, no inflated claims |
| Presentation | 5 | Grammar, punctuation, spelling, consistent style |

## Content and evidence (30)

- 25-30: Every recent role has 3-5 bullets; 60%+ contain numbers; outcomes are specific and technically credible; scope is clear.
- 18-24: Strong bullets but some metrics are vague or some roles are thin.
- 10-17: Responsibilities instead of outcomes; few numbers; generic stack lists.
- 0-9: Copy-pasted job descriptions; no evidence of impact.

Deductions: invented or unverifiable metrics (-10), bullets over 260 characters (-2 each), weak verbs (-2 each), no technical method (-2 per bullet).

## Targeting and keywords (25)

- 22-25: 75-85% must-have coverage; exact spelling; title mirrored; domain language natural.
- 17-21: Good coverage, a few must-haves missing or spelled differently.
- 10-16: Generic resume; less than 60% coverage; keywords present but buried.
- 0-9: No tailoring; wrong domain or seniority.

Deductions: keyword stuffing or repeated terms without context (-5), mismatch between target title and resume title (-5), missing must-have hard skill (-2 each).

## Structure and scanability (15)

- 13-15: Standard headers, reverse chronology, top third contains title and proof, one page under 5 years.
- 9-12: Readable but the best evidence is buried; one section is misplaced.
- 4-8: Unconventional order, walls of text, summary that repeats the resume.
- 0-3: Recruiter cannot find role, stack, or timeline in six seconds.

Deductions: non-standard section name (-2), page overflow (-3), no skills section (-3), summary below 7 years without a narrative reason (-2).

## ATS formatting (15)

- 13-15: Single column, text-based PDF, standard fonts, contact in body, no tables/icons, clean file name.
- 9-12: Mostly clean; minor risks such as a decorative line or unusual bullet glyph.
- 4-8: Tables, columns, or text boxes; contact in header/footer; image-based PDF.
- 0-3: Scanned image, portfolio-style layout, or unreadable parse.

Deductions: table/column (-5), contact in header/footer (-5), image or icon (-3), non-standard font (-2), wrong file name (-2), missing email (-5).

## Credibility and consistency (10)

- 9-10: Dates align, titles make sense, tense is consistent, claims are defensible, no unexplained gaps disguised.
- 6-8: Minor inconsistencies or one claim that needs a better explanation.
- 3-5: Overlapping roles, title inflation, date stretching, or contradictory metrics.
- 0-2: Fabrication risk.

Deductions: overlapping full-time roles without explanation (-3), year-only dates used to hide a gap (-2), senior title with junior scope (-3), mismatched totals (-2).

## Presentation (5)

- 5: Clean grammar, consistent punctuation, no typos, consistent date and location format.
- 3-4: A few typos or inconsistent capitalization.
- 1-2: Distracting errors.
- 0: Hard to read.

## Bands

| Score | Meaning | Action |
| ---: | :--- | :--- |
| 90-100 | Ready to apply | Export, run the parse test, submit |
| 80-89 | Strong | Fix the top 2 warnings, then apply |
| 70-79 | Needs tailoring | Rework targeting and evidence before applying |
| 60-69 | Weak | Rewrite the experience section; consider a different target |
| Below 60 | Not ready | Rebuild from the master inventory |

## Prioritization

Fix in this order:

1. **Wrong target** (title, seniority, domain) - no amount of formatting saves a mismatched resume.
2. **Missing must-have keywords** - add only where truthful.
3. **No evidence** - replace responsibilities with outcomes and metrics.
4. **ATS breakage** - tables, columns, images, headers/footers.
5. **Length and scanability** - cut, reorder, tighten.
6. **Polish** - grammar, consistency, spacing.

## Script mapping

`scripts/ats-check.mjs` uses a simplified version of this rubric:

- Errors subtract 10 points; warnings subtract 3.
- With `--jd`, the final score is `60% structural + 40% keyword coverage`.
- Without `--jd`, the structural score is the final score.
- The script cannot judge credibility, grammar, or visual layout. Use this rubric for those.

A high script score is necessary, not sufficient. A human still has to want to interview the candidate.
