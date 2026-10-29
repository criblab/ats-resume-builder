# Contributing

Thanks for helping improve the project. The goal is a resume workflow that is honest, readable by machines, and useful to humans.

## Before you open a PR

- Read `SKILL.md` and keep the rules consistent with the scripts and references.
- Never include real personal data, client names, emails, phone numbers, or confidential metrics. Use the fictional `examples/` data or invent clearly fake data.
- Keep the toolkit dependency-free. `build.mjs` and `ats-check.mjs` must run with Node 18+ and no `npm install`.
- Test on Windows, macOS, or Linux if your change touches browser detection or file paths.

### Personal data

`npm run check:pii` scans every tracked text file and fails on real emails, phone numbers, profile handles, and identity numbers. CI runs it on every pull request.

- Allowed placeholders: `example.com` / `example.org` / `example.net` domains, NANP fictional numbers (`555-0100` to `555-0199`), `555-555-5555`, and the handles listed in `scripts/pii-check.mjs`.
- If a match is a legitimate placeholder, add `pii-allow` to that line and explain it in the PR.
- `.pii-denylist.local` (git-ignored) is for names and employers you never want published. It stays on your machine, so CI does not see it. Start from `.pii-denylist.example`.
- Binary files cannot be inspected. A new PDF, image, or archive fails the check until its path is added to `ALLOWED_BINARIES` in `scripts/pii-check.mjs`, after reviewing its content and metadata.
- Enable the local gate once per clone: `npm run hooks`.

## Development

```bash
git clone https://github.com/criblab/ats-resume-builder.git
cd ats-resume-builder

npm test                    # validator against the example
npm run check:pii           # personal-data gate (must pass before committing)
npm run check:jd            # keyword coverage demo
npm run build:html          # Markdown -> HTML
npm run build               # Markdown -> HTML + PDF (needs Chrome/Edge)
npm run hooks               # enable the pre-commit gate for this clone
```

There are no runtime dependencies. Do not add a package unless the benefit is substantial and documented.

## What to contribute

- **Keywords:** add role-specific, truthful terms to `references/keyword-bank.md`. Avoid vendor marketing language.
- **Action verbs:** add verbs to `references/action-verbs.md` with a clear "use when" description.
- **Edge cases:** document a real situation in `references/edge-cases.md`, without personal data.
- **Parsing notes:** update `references/ats-parsing.md` when a platform behavior is verified. Label tendencies, not guarantees.
- **Validator checks:** add deterministic checks only. If a check is heuristic, say so in the output and in the README.
- **Translations:** keep section aliases and examples consistent. Spanish documentation should read naturally, not as a literal translation.

## Style

- English for code, comments, and the primary docs. Spanish mirror in `README.es.md`.
- Two-space indentation in JavaScript, YAML, and Markdown.
- Prefer ASCII in code paths and CLI output. The resume content itself is UTF-8 and may contain accents.
- Keep the SKILL.md opinionated and short; move detail to `references/`.
- No emojis in resume output. No icons in the PDF.

## Tests

Before submitting:

```bash
npm test
npm run check:pii
npm run build:html
node scripts/ats-check.mjs examples/master-resume.md --json
```

The example must keep a score of 90+ and zero errors. If you change scoring weights, update `references/scoring-rubric.md` and the README example output.

## Pull requests

- One topic per PR.
- Describe the problem, the change, and how you tested it.
- Include before/after output when changing the validator or the template.
- Do not reformat unrelated files.

## Reporting issues

Include:

- Operating system and Node version.
- The command you ran.
- The expected and actual output.
- A minimal, redacted resume or a synthetic reproduction.
- For PDF issues: browser name and version, and whether the HTML looks correct.

## Code of conduct

Be direct, be kind, and assume good faith. Harassment, discrimination, and publishing someone's personal data are not tolerated.
