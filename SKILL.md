---
name: ats-resume-builder
description: Builds, audits, tailors, and exports elite ATS-friendly Software Engineer resumes using the XYZ formula, exact job-description keywords, and single-column formatting. Use when creating a resume from scratch, tailoring an existing resume to a job description, auditing ATS compatibility, or exporting Markdown to HTML/PDF.
license: MIT
compatibility: Claude Code, Codex, Cursor, GitHub Copilot, Gemini CLI, OpenCode, Amp
metadata:
  version: "1.0.0"
  triggers:
    - "create swe resume"
    - "optimize engineer resume"
    - "ats resume builder"
    - "software engineer cv"
    - "improve my resume"
    - "tailor resume to jd"
---

# Software Engineer ATS Resume Builder

A complete workflow for producing a truthful, single-column, keyword-targeted Software Engineer resume in Markdown, then exporting it to clean HTML and PDF.

This skill is deliberately opinionated. It optimizes for three things: getting past keyword search, surviving a six-second human scan, and staying defensible in the interview.

## 0. Assets in this skill

| Path | Purpose |
| :--- | :--- |
| `SKILL.md` | Workflow and rules (this file) |
| `templates/resume.md` | Fill-in Markdown skeleton |
| `templates/resume.css` | ATS-safe print stylesheet |
| `scripts/build.mjs` | Markdown -> HTML -> PDF (uses installed Chrome/Edge; no uploads) |
| `scripts/ats-check.mjs` | Local audit and JD keyword coverage score |
| `scripts/pii-check.mjs` | Fails when real personal data appears in tracked files |
| `examples/master-resume.md` | Fictional, high-scoring reference resume |
| `examples/job-description.txt` | Fictional JD for coverage demos |
| `references/` | Action verbs, keyword bank, edge cases, rubric, parsing, cover letters |

When the repository is available, prefer running the scripts over hand-waving the audit. If only `SKILL.md` is installed, perform the same checks manually.

---

## 1. Non-negotiables

1. **Never invent experience, metrics, employers, dates, or technologies.** If a number is missing, write `[ADD METRIC: ...]` and ask. A resume that lies is worse than a resume that scores 70.
2. **Single column, plain text, selectable PDF.** No tables, text boxes, columns, icons, photos, skill bars, charts, or text inside images.
3. **Contact information in the body**, never in a PDF header/footer.
4. **Exact keyword spelling from the job description** where it is truthful (`React.js`, not `ReactJS`; `PostgreSQL`, not `Postgres`).
5. **One page** for under 5 years of relevant experience. **Two pages maximum** for 5-10 years. Beyond 10 years, two pages still beats three.
6. **No fluff.** No objective, no "passionate team player", no soft-skill laundry list, no references line, no photo, no date of birth.
7. **Every claim must survive an interview question.** If you cannot explain how a metric was measured, do not use it.

---

## 2. Choose the mode

| Mode | Trigger | Output |
| :--- | :--- | :--- |
| **Build** | No resume, or an outdated one | Master resume + a tailored variant |
| **Tailor** | A specific job description exists | Edited variant + diff summary + coverage score |
| **Audit** | "Why am I not getting interviews?" | Scored report + prioritized fixes |
| **Export** | Resume already approved | `.md`, `.html`, `.pdf`, verified parse |
| **Review** | Recruiter-style feedback | Line-level critique + rewrite suggestions |

For Build and Tailor, produce a **master resume** (everything true and useful) and a **variant per application**. Never maintain a single file that gets overwritten for every job.

---

## 3. Discovery: ask once, in one batch

Do not interrogate the user one question at a time. Ask up to six questions in a single message, and proceed with stated assumptions if the user skips optional items.

**Required for any output:**

1. Target role and seniority (e.g., "Senior Backend Engineer, 5+ years").
2. Target market and language (US, LATAM, EU; English or Spanish; remote/hybrid/on-site).
3. Current resume or a raw work history (companies, titles, dates, what they built).
4. Job description (recommended; paste or file). If absent, ask for 3-5 target postings to infer the market.
5. Work authorization / relocation constraint, only if it affects the header or summary.
6. Output expectations: one page or two, PDF only or DOCX too.

**Useful optional prompts:**

- "Which 2-3 achievements are you most proud of, and what changed because of them?"
- "What scale did you operate at? Users, requests, transactions, revenue, data volume, team size, on-call scope."
- "What is the strongest technology signal for this target role?"
- "Is there anything we must NOT include (NDA, current employer, gap, short tenure)?"

**Infer, then confirm.** Calculate years of relevant experience from the dates. Do not ask for information already present in the file.

---

## 4. Build the master inventory

Before writing bullets, extract a flat achievement bank. For each role, capture:

- Company, title, location, start/end (`Month Year`).
- Product, users, and business model in one line.
- 3-6 achievements with: action, subject, scale, outcome, and technology.
- Incidents, migrations, launches, cost reductions, reliability work, mentoring, hiring, design ownership.
- Numbers with units and time windows. Mark estimates as estimates.

Keep the master resume in `resume/master.md`. Create variants in `resume/variants/<company>-<role>.md`. Never commit personal resumes to a public repository.

---

## 5. Extract the job description

Read the JD twice and produce a short brief:

| Signal | What to capture |
| :--- | :--- |
| **Title** | Exact title and seniority; mirror it in the header/summary only if accurate |
| **Hard skills** | Languages, frameworks, cloud, databases, tools, methodologies |
| **Spelling** | Exact casing and punctuation from the JD |
| **Domain** | Payments, health, logistics, SaaS, marketplace, etc. |
| **Scope** | Team size, ownership, on-call, scale, compliance |
| **Outcomes** | What the hire is expected to change (latency, reliability, revenue, cost) |
| **Knockouts** | Work authorization, location, years, degree, certifications |

Separate requirements into **must-have**, **nice-to-have**, and **noise** (benefits, company boilerplate). Target 75-85% coverage of must-haves. Chasing 100% produces keyword stuffing and lies.

If the user provides several JDs, extract the intersection: those terms belong in the master resume; role-specific terms belong in variants.

---

## 6. Select and tailor

1. **Pick the evidence.** Choose the 8-12 achievements that best match the JD's outcomes, not the ones that are easiest to describe.
2. **Order by relevance.** Most relevant role first only if chronology allows; otherwise keep reverse chronology and move relevant bullets to the top of each role.
3. **Mirror vocabulary.** Use the JD's nouns for the same concept (`observability` vs `monitoring`; `CI/CD` vs `deployment pipelines`) when both are true.
4. **Cut aggressively.** Remove achievements that do not support this target. A focused resume beats a complete one.
5. **Keep a diff.** After tailoring, list what changed: added keywords, reordered bullets, removed content, placeholders to fill.
6. **Never change dates or titles** to fit a narrative. Contract and part-time work should be labeled honestly.

**Tailoring budget:** change at most 25-30% of the document per application. Larger rewrites usually signal a weak master resume.

---

## 7. Bullet engineering

### The XYZ formula

> Accomplished **X**, as measured by **Y**, by doing **Z**.

- **X** = outcome and action verb.
- **Y** = proof: percentage, time, money, volume, reliability, adoption, team size.
- **Z** = technical method that makes the outcome credible.

**Strong:** "Reduced p95 checkout latency from 840ms to 210ms by caching idempotency lookups in Redis and moving fraud scoring off the request path."

**Weak:** "Worked on performance improvements for the checkout service."

### Metric ladder

When the user has no number, climb down this ladder instead of inventing one:

1. Before/after measurement (latency, error rate, conversion, cost).
2. Absolute scale (requests/day, records, users, transactions).
3. Relative scope (percentage of traffic, number of services, team size).
4. Frequency (deployments per week, incidents per month, tickets closed).
5. Time saved (hours per week, days per release).
6. Qualitative proof (audit passed, migration completed, incident resolved) with the constraint that made it hard.

If none exist, use a placeholder and ask. Never fabricate.

### Rules

- 3-5 bullets for recent roles; 1-2 for older or less relevant roles.
- One idea per bullet. No semicolon chains longer than two clauses.
- 120-220 characters is a good target; hard warn above 260.
- Start with an owned verb: *Architected, Built, Cut, Designed, Eliminated, Led, Migrated, Reduced, Scaled, Shipped*.
- Ban: *helped, assisted, worked on, responsible for, participated in, involved in*.
- At least 60% of bullets should contain a number; 100% should contain an outcome.
- Vary verbs. Do not start five bullets with "Developed".
- Put the technology at the end unless it is the headline.

See `references/action-verbs.md` for a categorized verb list.

---

## 8. Section rules

### Header

```
First Last
City, State/Country | Open to Remote | +1 555 555 5555 | email | linkedin.com/in/handle | github.com/handle
```

- No full street address. City + country is enough.
- Use an international-ready phone format.
- Links must be clean and public. Remove repos with unfinished tutorials if they are the only GitHub signal.
- For US applications, omit photo, date of birth, marital status, nationality, and ID numbers.

### Summary (conditional)

Include a 2-3 line summary only when at least one is true:

- 7+ years of experience.
- Career changer or returner who needs a narrative bridge.
- Deep domain pivot where the target role is not obvious from the titles.
- Senior/staff scope that needs a one-line thesis.

Otherwise skip it. The top of the resume should be experience, not prose. A summary must name the target role, the domain, the core stack, and one proof point. No adjectives without evidence.

### Experience

- Reverse chronological. `Month Year – Month Year` (or `Present`).
- Format: `**Title** | Company — City, Country (Remote)` on one line, dates italic on the next.
- Keep company descriptors short, e.g., "B2B SaaS for floral supply chain (ERP + e-commerce)".
- Promotions: separate entries under the same company, or one entry with both titles and a clear date split.

### Skills

- Plain text, grouped, 3-5 lines, max 8 items per line.
- Group by: Languages, Frameworks, Cloud & Infrastructure, Databases & Tools, Observability, AI & Automation.
- Mirror JD spelling. Remove obsolete or obvious tools (MS Office, "Git" for seniors, "Agile" unless the JD asks).
- Do not rate proficiency. No bars, percentages, or stars.

### Projects

Use for under 3 years of experience, career changers, or when a project is the strongest evidence for the target stack.

- One line: `**Name** | [live URL] | [GitHub]`.
- One bullet: problem, stack, scale/usage, outcome.
- Never list tutorial clones without a live link or real usage.

### Education

- Under 2 years of experience: before experience.
- 2+ years: at the bottom, 1-3 lines.
- GPA only if above 3.5 and graduated within 2 years.
- Bootcamps and certifications belong in Education or Certifications, not both.

### Certifications

One or two lines. Include issuer and year when recent. Skip expired or in-progress credentials unless the exam date is set.

### Extra sections

Allowed when they carry hiring signal: Publications, Open Source, Talks, Awards, Patents, Languages (only if the role needs them), Volunteer (only if technical or leadership-relevant). Do not add "Interests" unless it is a genuine conversation hook.

---

## 9. Formatting rules

| Item | Rule |
| :--- | :--- |
| Layout | Single column, top-to-bottom reading order |
| Font | Calibri, Arial, Helvetica, Georgia, or Times New Roman; 9.5-11pt body; 14-20pt name |
| Margins | 0.4-0.7in; 0.5in is a safe default |
| Line spacing | 1.15-1.35 |
| Headings | Standard names: WORK EXPERIENCE, TECHNICAL SKILLS, PROJECTS, EDUCATION, CERTIFICATIONS |
| Dates | `Month Year – Month Year`; consistent across all roles |
| Bullets | Standard `-`, `*`, or `•`; no custom glyphs |
| Links | Plain text plus clickable PDF link; no shortened URLs |
| Encoding | UTF-8; accents and `ñ` must survive copy-paste |
| File | `FirstName-LastName-Resume.pdf`; `.docx` only when explicitly requested |
| PDF | Text-based, selectable, fonts embedded, under ~1 MB |
| Page count | 1 page < 5 years; 2 pages max 5-10 years; 2 pages preferred beyond 10 |

**Do not use:** tables, columns, text boxes, shapes, images, icons, emoji, skill bars, headshot, colored backgrounds behind text, headers/footers with contact data, or multi-column templates.

**PDF metadata:** set the Title. Chrome-based export writes it reliably; Author is not, so do not depend on it.

**DOCX:** use it only when a portal or recruiter asks. Keep the same single-column structure; tables used for layout are the most common cause of parsed resumes turning into soup.

---

## 10. Build and export

From the repository root:

```bash
# Markdown -> HTML + PDF (uses installed Chrome/Edge/Chromium)
node scripts/build.mjs resume/master.md --out resume/dist --name First-Last-Resume

# HTML only
node scripts/build.mjs resume/master.md --out resume/dist --no-pdf

# A4 for Europe/LATAM, custom body size for dense resumes
node scripts/build.mjs resume/master.md --a4 --font-size 9.2pt
```

If no browser is found, open the HTML and print to PDF with margins set to none and background graphics enabled.

**DOCX fallback (optional):**

```bash
pandoc resume/master.md -o resume/dist/First-Last-Resume.docx
```

Then verify section order, bullet symbols, and that no table was introduced.

---

## 11. Validation before delivery

### Automated

```bash
node scripts/ats-check.mjs resume/master.md --jd jd.txt --years 5 --output dist/First-Last-Resume.pdf
```

The script checks contact data, section names, tables/images/emoji, weak verbs, metric density, date format, length, privacy leaks, file naming, and weighted JD keyword coverage. It exits non-zero on errors and on a score below `--min-score`.

### Manual parse test

1. Open the PDF and press Ctrl/Cmd+A, then copy into a plain text editor.
2. Confirm the order is Name -> contact -> sections -> roles -> bullets.
3. Confirm no text is missing, duplicated, or interleaved.
4. Confirm links still point to LinkedIn/GitHub.
5. Confirm the document is one column at 100% zoom.

### Recruiter scan test

Give it six seconds, then answer:

- Is the target title obvious?
- Are three proof points visible in the top third?
- Is the stack obvious without reading every bullet?
- Is there anything that would raise a "why is this here?" question?

### Honest ATS framing

ATS platforms are searchable databases and knockout-question engines, not magical rejectors. They parse, index, and rank. Exact keywords help recruiters find you; formatting prevents parsing failures; knockout answers (authorization, location, salary, years) can reject you before a human looks. Do not promise "ATS-proof" or a specific vendor score.

Score interpretation: 90+ ready to apply, 80-89 strong with minor gaps, 70-79 needs tailoring, below 70 rework content or targeting. See `references/scoring-rubric.md`.

---

## 12. Edge cases

| Situation | Move |
| :--- | :--- |
| **Employment gap** | Use `Month Year` dates honestly; describe caregiving, study, or freelance in one line if it helps; never stretch dates |
| **Career changer** | Lead with a 2-line bridge summary, a Projects section, and transferable outcomes; put target keywords in real work |
| **New grad / bootcamp** | Education and Projects first; internships count as experience; cap at one page |
| **Overqualified** | Trim senior-only scope, emphasize hands-on work, address the "why this role" question in the cover letter |
| **Short tenures** | Group contract work under one "Contract / Freelance" entry; focus on outcomes, not duration |
| **International / visa** | State work authorization only when it helps; never imply authorization you do not have |
| **Non-English market** | Produce a native-language version, not a literal translation; keep tech terms in English when that is the convention |
| **Current employer confidentiality** | Use a descriptor ("a top-5 LATAM marketplace") and omit metrics covered by NDA |
| **Two-page overflow** | Cut oldest roles to 1 bullet, remove unrelated projects, reduce font to 9.5pt, tighten margins to 0.4in |
| **No metrics anywhere** | Use scope and frequency; add placeholders and ask; do not invent |

More detail in `references/edge-cases.md`.

---

## 13. Localization notes

- **US/Canada:** "Resume", no photo, no personal data, 1 page preferred, Letter size, `Month Year` dates, no GPA unless early-career.
- **UK/EU:** "CV" is acceptable; A4 size; photo only if the market expects it (rare in tech); include languages and work authorization when relevant.
- **LATAM:** Spanish or English depending on the company; A4; phone with country code; "CV" is common.
- **Remote-first companies:** state `Open to Remote` and your timezone overlap if it is a real constraint.
- **Spanish version:** translate section headers to `EXPERIENCIA LABORAL`, `HABILIDADES TÉCNICAS`, `PROYECTOS`, `EDUCACIÓN`, `CERTIFICACIONES`. Keep technology names in English. Do not machine-translate bullets; rewrite for the local market.

---

## 14. Privacy and ethics

- Do not upload personal resumes to public repos, issues, or gists. Keep them in an ignored local folder.
- Run `npm run check:pii` before committing to this repository. It blocks real emails, phone numbers, profile handles, and identity numbers in tracked files. For your own names and employers, keep them in the git-ignored `.pii-denylist.local`.
- Redact employer names, client names, emails, and phone numbers before sharing a resume with a third-party tool.
- Never add a photo, birth date, marital status, religion, or ID number for US applications.
- Never claim a degree, certification, clearance, or language level the candidate does not have.
- If a metric is an estimate, label it as approximate in the source notes, not necessarily in the resume.
- Respect NDAs. Describe impact without exposing client data or unreleased products.

---

## 15. Output format

When delivering, provide:

1. The tailored Markdown file (and HTML/PDF when the repo scripts are available).
2. A short change summary: keywords added, bullets rewritten, sections reordered, placeholders to fill.
3. The validation result: score, remaining warnings, and the manual parse test result.
4. The exact file name and target application.
5. Any questions that still block truthfulness (missing metrics, authorization, dates).

Do not dump a 400-line report unless the user asked for an audit. Lead with the artifact and the three decisions that matter.

---

## 16. Definition of done

- [ ] Single column, selectable PDF, standard fonts, no tables/images/icons.
- [ ] Contact line in the body with email, phone, LinkedIn, GitHub.
- [ ] Target title and top three proof points visible in the top third.
- [ ] Every bullet has an owned verb and an outcome; 60%+ have a number.
- [ ] JD must-have keywords appear exactly where truthful; coverage 75%+.
- [ ] No invented data; placeholders are explicit.
- [ ] Dates consistent; no unexplained gaps disguised.
- [ ] One page under 5 years; two pages maximum otherwise.
- [ ] File named `FirstName-LastName-Resume.pdf`; Title metadata set.
- [ ] Copy-paste parse test passed; links work.
- [ ] A human read it once and would interview the candidate.

---

## 17. References

| File | Use it for |
| :--- | :--- |
| `references/action-verbs.md` | Replacing weak verbs, varying openings |
| `references/keyword-bank.md` | Role-specific hard skills and domain terms |
| `references/scoring-rubric.md` | 100-point audit and prioritization |
| `references/ats-parsing.md` | How parsers fail and how to test |
| `references/edge-cases.md` | Gaps, pivots, international, seniority |
| `references/cover-letter.md` | Optional 3-paragraph cover letter |
