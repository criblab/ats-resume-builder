# Security Policy

## Supported versions

Fixes land on `main` and in the latest tagged release. Older copies are not patched.

## Reporting a vulnerability

Use **GitHub private vulnerability reporting**: Security tab → *Report a vulnerability*.

Do not open a public issue for a security problem. Do not paste real personal data in a report; use synthetic fixtures and redact logs.

Please include:

- The affected file and commit.
- What an attacker controls and what they gain.
- Minimal reproduction steps.
- Whether the issue is already public.

## Scope

This repository ships instructions that AI agents execute, plus local Node scripts. In scope:

- **Unsafe skill instructions** in `SKILL.md` and `references/`: prompt injection, hidden network calls, attempts to read or transmit files outside the resume being edited, or instructions that exfiltrate data to a third party.
- **Personal-data gate bypasses** in `scripts/pii-check.mjs`: false negatives for emails, phone numbers, profile handles, identity numbers, or unauthorized binary files.
- **Path traversal or arbitrary file write** in `scripts/build.mjs` (`--out`, `--name`, `--css`).
- **Unsafe output**: script injection or dangerous link schemes in generated HTML/PDF.
- **CI/CD**: workflow injection, over-broad permissions, unpinned third-party actions.
- **Data exposure**: personal data committed to the repository or present in its history.

## Out of scope

- How a specific commercial ATS scores, ranks, or rejects a resume.
- Resume wording, the accuracy of a user's claims, or hiring outcomes.
- Issues that require an already-compromised machine or a modified local copy of the scripts.
- The example resume being fictional; that is intentional.

## Response

Best effort, no SLA, no bug bounty. The project is MIT licensed and comes with no warranty.
