#!/usr/bin/env node
/**
 * pii-check.mjs — block personal data from entering the repository.
 *
 * Scans text files for real emails, phone numbers, personal profile handles,
 * identity numbers, and any term listed in a local denylist. Fictional
 * placeholders are allowed: RFC 2606 domains (example.com/.org/.net/.example),
 * NANP reserved numbers (555-0100..555-0199), the all-fives placeholder, and
 * the handles below.
 *
 * Binary files cannot be inspected, so they are rejected unless their path is
 * listed in ALLOWED_BINARIES. A committed PDF or image can carry personal data
 * in its text or metadata; approving one is a review decision, not a default.
 *
 * Usage:
 *   node scripts/pii-check.mjs                 # every tracked file
 *   node scripts/pii-check.mjs --staged        # files staged for commit
 *   node scripts/pii-check.mjs --all           # walk the worktree
 *   node scripts/pii-check.mjs --paths a.md b.md
 *   node scripts/pii-check.mjs --denylist my-terms.txt
 *   node scripts/pii-check.mjs --json
 *
 * Exit codes: 0 = clean, 1 = findings, 2 = usage error.
 *
 * --staged reads the file from the worktree, not from the index. A partially
 * staged file is therefore checked in full, which can fail a commit whose
 * staged hunk is clean. That errs on the safe side; unstage the file to pass.
 *
 * Values are masked in the output on purpose: an unmasked report would copy
 * the leaked data into CI logs and issue trackers.
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_DENYLIST = path.join(ROOT, ".pii-denylist.local");

const MAX_BYTES = 1_000_000;
const SKIP_DIRS = new Set([".git", "node_modules", "dist", "out", "coverage", ".idea", ".vscode"]);
const SKIP_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".bmp", ".tif", ".tiff",
  ".pdf", ".docx", ".doc", ".xlsx", ".pptx", ".zip", ".gz", ".tgz", ".7z",
  ".woff", ".woff2", ".ttf", ".otf", ".eot", ".mp3", ".mp4", ".mov", ".wasm",
]);

// Fictional contact data the examples and templates are allowed to use.
const ALLOWED_EMAIL_DOMAINS = new Set(["example.com", "example.org", "example.net", "example"]);
const ALLOWED_PHONE_DIGITS = new Set(["5555555", "5555555555", "15555555555"]);
const ALLOWED_HANDLES = new Set([
  "handle", "your-handle", "your-username", "username", "user", "example",
  "johndoe", "jane-doe", "johnsmith", "johndev",
]);

// Binary files that may be committed. Add a path only after reviewing its
// content and metadata in the pull request.
const ALLOWED_BINARIES = new Set(["docs/preview.png", "docs/social-preview.png"]);

const ALLOW_MARKER = "pii-allow";

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function usage(message) {
  if (message) console.error(`\nError: ${message}\n`);
  console.error(`Usage: node scripts/pii-check.mjs [options]

Options:
  --staged             Check files staged for commit (pre-commit hook)
  --all                Walk the worktree instead of asking git
  --paths <files...>   Check only the given files
  --denylist <file>    Extra terms to block, one per line
  --json               Print machine-readable JSON
  -h, --help           Show this help
`);
  process.exit(2);
}

function parseArgs(argv) {
  const opts = { mode: "tracked", json: false, denylist: DEFAULT_DENYLIST };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case "--staged": opts.mode = "staged"; break;
      case "--all": opts.mode = "all"; break;
      case "--json": opts.json = true; break;
      case "--denylist":
        opts.denylist = path.resolve(argv[++i] || "");
        break;
      case "--paths": {
        const files = [];
        while (argv[i + 1] && !argv[i + 1].startsWith("--")) files.push(argv[++i]);
        if (files.length === 0) usage("--paths needs at least one file");
        opts.mode = "paths";
        opts.paths = files;
        break;
      }
      case "-h":
      case "--help":
        usage();
        break;
      default:
        if (arg.startsWith("--")) usage(`unknown option "${arg}"`);
        opts.paths = (opts.paths || []).concat(arg);
        opts.mode = "paths";
    }
  }
  return opts;
}

// ---------------------------------------------------------------------------
// File collection
// ---------------------------------------------------------------------------

function git(args) {
  const out = execFileSync("git", args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
    maxBuffer: 32 * 1024 * 1024,
  });
  return out.split("\0").filter(Boolean);
}

function walk(dir, acc) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(full, acc);
      continue;
    }
    if (entry.isFile()) acc.push(full);
  }
  return acc;
}

function collect(opts) {
  if (opts.mode === "paths") {
    return opts.paths.map((file) => path.resolve(file));
  }
  if (opts.mode === "staged") {
    return git(["diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z"])
      .map((file) => path.join(ROOT, file));
  }
  if (opts.mode === "all") {
    return walk(ROOT, []);
  }
  try {
    return git(["ls-files", "-z"]).map((file) => path.join(ROOT, file));
  } catch {
    return walk(ROOT, []);
  }
}

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------

const EMAIL = /[A-Za-z0-9._%+'-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+/g;
const PHONE = /(?<![\w+])(?:\+\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?){2,4}\d{2,4}(?![\w%])/g;
const PROFILE = /(?:(?:https?:\/\/)?(?:www\.)?(linkedin\.com\/in|github\.com)\/)([A-Za-z0-9][A-Za-z0-9_-]{0,38})(\/[^\s)"'<]*)?/gi;
const CPF = /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g;
const SSN = /\b\d{3}-\d{2}-\d{4}\b/g;
const LABELED_ID = /(?:passport|pasaporte|[cC][eé]dula|cedula|\bdni\b|\bnie\b|\bssn\b|social security)\b[^\n]{0,15}?\b([A-Z]{0,3}-?\d{5,10}[A-Z]?)\b/gi;
const BIRTH_DATE = /(?:date of birth|fecha de nacimiento|birth date|\bborn\b)\b[^\n]{0,25}?\b(?:19|20)\d{2}\b/gi;

function maskEmail(value) {
  const at = value.lastIndexOf("@");
  const local = value.slice(0, at);
  const domain = value.slice(at);
  return `${local.slice(0, 1)}${"*".repeat(Math.max(2, local.length - 1))}${domain}`;
}

function maskTail(value, keep = 2) {
  const visible = value.replace(/\D/g, "").slice(-keep);
  return `***${visible}`;
}

function maskHandle(value) {
  return `${value.slice(0, 2)}${"*".repeat(Math.max(2, value.length - 2))}`;
}

function isAllowedEmail(value) {
  const domain = value.slice(value.lastIndexOf("@") + 1).toLowerCase();
  return ALLOWED_EMAIL_DOMAINS.has(domain) || domain.endsWith(".example");
}

function isAllowedPhone(raw) {
  const digits = raw.replace(/\D/g, "");
  if (ALLOWED_PHONE_DIGITS.has(digits)) return true;
  // NANP reserves 555-0100..555-0199 for fiction.
  return /(?:^|\D)555[\s.-]?01\d{2}(?!\d)/.test(raw);
}

function isAllowedHandle(handle) {
  return ALLOWED_HANDLES.has(handle.toLowerCase());
}

function overlaps(spans, start, end) {
  return spans.some(([from, to]) => start < to && end > from);
}

function checkLine(line, denylist) {
  const hits = [];

  const cpfs = [...line.matchAll(CPF)];
  const ssns = [...line.matchAll(SSN)];
  const ids = [...line.matchAll(LABELED_ID)];
  const births = [...line.matchAll(BIRTH_DATE)];
  const identifierSpans = [
    ...cpfs.map((m) => [m.index, m.index + m[0].length]),
    ...ssns.map((m) => [m.index, m.index + m[0].length]),
    ...ids.map((m) => [m.index, m.index + m[0].length]),
  ];

  for (const match of line.matchAll(EMAIL)) {
    if (!isAllowedEmail(match[0])) hits.push({ rule: "email", value: maskEmail(match[0]) });
  }

  for (const match of line.matchAll(PHONE)) {
    const raw = match[0];
    const digits = raw.replace(/\D/g, "");
    const looksLikePhone = raw.startsWith("+") ? digits.length >= 8 : digits.length >= 10;
    if (!looksLikePhone) continue;
    if (overlaps(identifierSpans, match.index, match.index + raw.length)) continue;
    if (!isAllowedPhone(raw)) hits.push({ rule: "phone", value: maskTail(raw) });
  }

  for (const match of line.matchAll(PROFILE)) {
    const [, host, handle, rest] = match;
    if (isAllowedHandle(handle)) continue;
    // github.com/org/repo is a project link; a bare github.com/handle is a profile.
    if (host.toLowerCase() === "github.com" && rest) continue;
    hits.push({ rule: "handle", value: `${host}/${maskHandle(handle)}` });
  }

  for (const match of cpfs) hits.push({ rule: "cpf", value: maskTail(match[0]) });
  for (const match of ssns) hits.push({ rule: "ssn", value: maskTail(match[0]) });
  for (const match of ids) hits.push({ rule: "identity", value: maskTail(match[1]) });
  for (const match of births) hits.push({ rule: "birth-date", value: "***" });

  const lower = line.toLowerCase();
  for (const term of denylist) {
    if (lower.includes(term)) hits.push({ rule: "denylist", value: maskHandle(term) });
  }

  return hits;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function inspect(file) {
  const stats = statSync(file);
  if (!stats.isFile()) return { kind: "skip" };
  if (SKIP_EXTENSIONS.has(path.extname(file).toLowerCase())) return { kind: "binary" };
  if (stats.size > MAX_BYTES) return { kind: "binary" };
  const buffer = readFileSync(file);
  if (buffer.subarray(0, 8192).includes(0)) return { kind: "binary" };
  return { kind: "text", text: buffer.toString("utf8") };
}

function loadDenylist(file) {
  if (!file || !existsSync(file)) return [];
  return readFileSync(file, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim().toLowerCase())
    .filter((line) => line && !line.startsWith("#") && line.length >= 3);
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const denylist = loadDenylist(opts.denylist);
  const files = collect(opts).filter((file) => existsSync(file));

  const findings = [];
  let scanned = 0;
  let binaries = 0;

  for (const file of files) {
    const info = inspect(file);
    if (info.kind === "skip") continue;
    const relative = path.relative(ROOT, file).split(path.sep).join("/");

    if (info.kind === "binary") {
      binaries += 1;
      if (!ALLOWED_BINARIES.has(relative)) {
        findings.push({ file: relative, line: 0, rule: "binary", value: "(not inspected)" });
      }
      continue;
    }

    scanned += 1;

    info.text.split(/\r?\n/).forEach((line, index) => {
      if (line.toLowerCase().includes(ALLOW_MARKER)) return;
      for (const hit of checkLine(line, denylist)) {
        findings.push({ file: relative, line: index + 1, rule: hit.rule, value: hit.value });
      }
    });
  }

  findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);

  if (opts.json) {
    console.log(JSON.stringify({ scanned, binaries, findings }, null, 2));
  } else if (findings.length === 0) {
    console.log(`\nPII CHECK  ${scanned} text file(s) and ${binaries} binary file(s) checked, no personal data found.\n`);
  } else {
    console.log(`\nPII CHECK  ${scanned} text file(s) and ${binaries} binary file(s) checked`);
    console.log("=".repeat(60));
    for (const finding of findings) {
      const location = finding.line > 0 ? `${finding.file}:${finding.line}` : finding.file;
      console.log(`  ${location}  ${finding.rule.padEnd(11)} ${finding.value}`);
    }
    console.log(`
Found ${findings.length} issue(s) that must be resolved before committing.
Use fictional data (example.com, 555-0100..555-0199, handle/your-handle).
If a match is a legitimate placeholder, add "pii-allow" to the line and say
why in the pull request. A binary file must be added to ALLOWED_BINARIES in
scripts/pii-check.mjs after its content and metadata are reviewed.`);
  }

  if (findings.length > 0) process.exitCode = 1;
}

try {
  main();
} catch (error) {
  console.error(`\nUnexpected error: ${error.message}\n`);
  process.exit(2);
}
