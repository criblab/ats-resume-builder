# How ATS Parsing Actually Works

Applicant Tracking Systems are databases with a hiring workflow on top. They are not sentient gatekeepers. Understanding the pipeline prevents both superstition and careless formatting.

## The pipeline

1. **Upload and extraction.** The ATS converts the file to text. PDFs are usually parsed with a text extractor; DOCX is parsed from the document model. Scanned PDFs need OCR and often fail.
2. **Section detection.** The parser looks for headings such as Experience, Education, and Skills, then assigns lines to fields.
3. **Entity extraction.** It guesses name, email, phone, employer, title, and dates. Ambiguity produces empty or swapped fields.
4. **Indexing.** The extracted text becomes searchable. Recruiters search for terms; a missing term is invisible.
5. **Knockout questions.** Application-form answers (authorization, location, salary, years) can filter candidates independently of the resume.
6. **Ranking and review.** Recruiters filter and skim. The resume still has to persuade a human.

## Common parse failures

| Failure | Cause | Fix |
| :--- | :--- | :--- |
| Empty employer or title fields | Two-column layout, icons, or title/company on separate visual blocks | Single column, one line per role |
| Contact missing | Contact in PDF header/footer or inside an image | Contact line in the body |
| Dates wrong or missing | Dates in sidebars, graphics, or inconsistent formats | `Month Year – Month Year` in the body |
| Scrambled bullets | Tables, text boxes, or multi-column templates | Plain paragraphs and standard bullets |
| Skills not indexed | Skills inside images or charts | Plain text skills list |
| Garbled accents | Wrong encoding or non-standard font | UTF-8, standard font, test copy-paste |
| Text unselectable | Scanned or image-exported PDF | Export a text-based PDF |
| Section ignored | Creative heading ("My Journey") | Standard heading ("Work Experience") |

## Format guidance

- **PDF vs DOCX:** Both are widely accepted. PDF preserves layout; DOCX is easier for some older systems to parse. Follow the portal's instruction. Never submit a scanned PDF.
- **Fonts:** Calibri, Arial, Helvetica, Georgia, Times New Roman. Embed fonts in the PDF.
- **Size:** Body 9.5-11pt. Do not shrink below 9pt to force one page; cut content instead.
- **Margins:** 0.4-0.7in. Keep at least 0.4in so printers and parsers do not clip text.
- **Headers/footers:** Do not put contact information there. Page numbers are acceptable but unnecessary on a one-page resume.
- **Links:** Keep the visible URL as plain text and the clickable link on top. Avoid link shorteners.
- **Ligatures:** Word and Chrome can export `fi`/`fl` as single glyphs (`ﬁ`, `ﬂ`). Text extraction then returns `notiﬁcation` and keyword search misses it. The bundled CSS disables ligatures; if you use another template, verify with copy-paste.
- **File name:** `FirstName-LastName-Resume.pdf`. Avoid spaces, version numbers, and "final_final".
- **File size:** Under ~1 MB. Compress images, but a text-only resume should be far smaller.
- **Metadata:** Set the Title where the tool allows it; Author is often dropped by browser exports. The build script sets the PDF Title. Word/Pandoc may not.

## Section headings that parse well

- `WORK EXPERIENCE`, `PROFESSIONAL EXPERIENCE`, `EXPERIENCE`
- `TECHNICAL SKILLS`, `SKILLS`
- `PROJECTS`
- `EDUCATION`
- `CERTIFICATIONS`
- `PUBLICATIONS`, `AWARDS`, `LANGUAGES`, `VOLUNTEER`

Avoid synonyms that require interpretation: "Where I've Made an Impact", "Toolbox", "Academic Pursuits", "My Story".

## Platform notes

These are tendencies, not guarantees. Vendors change parsers frequently.

- **Workday:** Form-heavy; the parsed resume often matters less than the application fields. Fill both carefully and mirror the resume.
- **Greenhouse / Lever:** Generally tolerant of modern PDFs; recruiter search and structured fields still depend on clean text.
- **Taleo / iCIMS:** Older parsers; plain formatting and DOCX can be safer. Avoid columns and graphics entirely.
- **SmartRecruiters / Ashby:** Modern parsing, but knockout questions and structured profiles dominate.
- **LinkedIn Easy Apply:** The profile is the source of truth, not the uploaded file. Keep both aligned.

## Parse test protocol

1. Export the final PDF.
2. Select all, copy, paste into Notepad or a plain text editor.
3. Read the order: name, contact, sections, roles, dates, bullets.
4. Search for the target title and the top five keywords.
5. Confirm accents and special characters.
6. Open the PDF at 100% and confirm one column.
7. Click every link.
8. If anything is missing, fix the source Markdown or CSS and rebuild. Do not patch the PDF.

## What not to optimize for

- A specific "ATS score" from a vendor. Scores are marketing heuristics with different formulas.
- Keyword density targets. Recruiters read the document; repetition looks desperate.
- Hiding keywords in white text. Parsers may index it, humans and ethics will not forgive it.
- Paying for a "resume rewrite" that invents metrics. The interview exposes it.

## Honest promise

Clean formatting gets the resume parsed. Exact, truthful keywords get it found. Evidence gets it read. None of these guarantee an interview; they remove avoidable reasons to be rejected.
