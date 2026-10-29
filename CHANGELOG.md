# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and [Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-10-27

### Added

- `SKILL.md` workflow for building, tailoring, auditing, and exporting Software Engineer resumes.
- Master-resume -> tailored-variant model, with truthfulness guardrails and explicit metric placeholders.
- Section-by-section rules for header, summary, experience, skills, projects, education, and certifications.
- Localization guidance for US, EU, LATAM, English, and Spanish resumes.
- Edge-case guidance for gaps, career changes, new grads, seniority, relocation, confidentiality, and two-page overflow.
- `scripts/build.mjs`: Markdown -> HTML -> PDF using an installed Chrome, Edge, or Chromium. No uploads, no browser download.
- `templates/resume.md` and ATS-safe `templates/resume.css` with Letter/A4 support.
- `scripts/ats-check.mjs`: contact, formatting, section, evidence, date, length, privacy, file-name, and weighted keyword-coverage checks.
- 100-point scoring rubric and a parse-test protocol.
- Keyword bank, action-verb list, ATS parsing notes, and cover-letter framework.
- Fictional example resume and job description scoring 98/100.
- GitHub Actions validation workflow.
- English and Spanish documentation.

### Notes

- PDF export requires a local Chromium-based browser. The HTML is always generated if PDF export is unavailable.
- The validator is heuristic. It does not emulate any specific ATS vendor.
