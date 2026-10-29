#!/usr/bin/env node
/**
 * ats-check.mjs — deterministic, local ATS and resume-quality audit.
 *
 * Usage:
 *   node scripts/ats-check.mjs resume.md
 *   node scripts/ats-check.mjs resume.md --jd job-description.txt
 *   node scripts/ats-check.mjs resume.md --jd jd.txt --years 5 --pages 2
 *   node scripts/ats-check.mjs resume.md --output dist/First-Last-Resume.pdf
 *   node scripts/ats-check.mjs resume.md --json
 *
 * Exit codes: 0 = no errors, 1 = errors, 2 = usage error.
 */

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const SECTION_ALIASES = {
  summary: ["summary", "professional summary", "profile", "about", "about me", "objective"],
  experience: ["work experience", "professional experience", "experience", "employment", "employment history", "work history", "relevant experience"],
  skills: ["technical skills", "skills", "core skills", "core competencies", "technologies", "technical proficiencies"],
  projects: ["projects", "selected projects", "personal projects", "open source", "open-source"],
  education: ["education", "academic background", "academics"],
  certifications: ["certifications", "certificates", "licenses", "licenses & certifications", "certifications & licenses"],
  awards: ["awards", "honors", "achievements", "awards & honors"],
  publications: ["publications", "papers", "research"],
  languages: ["languages", "spoken languages"],
  volunteer: ["volunteer", "volunteering", "community", "leadership"],
  interests: ["interests", "hobbies"],
};

const STANDARD_HEADERS = new Set(Object.values(SECTION_ALIASES).flat());

const WEAK_VERBS = [
  "helped", "assisted", "worked on", "responsible for", "participated in", "involved in",
  "was tasked with", "duties included", "supported", "handled", "did", "made",
];

const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "been", "but", "by", "can", "could", "did", "do",
  "does", "for", "from", "had", "has", "have", "he", "her", "his", "how", "i", "if", "in", "into",
  "is", "it", "its", "job", "may", "me", "more", "most", "must", "my", "no", "not", "of", "on",
  "or", "our", "out", "over", "own", "role", "she", "should", "so", "some", "such", "than", "that",
  "the", "their", "them", "then", "there", "these", "they", "this", "those", "to", "too", "under",
  "up", "us", "use", "using", "very", "was", "we", "were", "what", "when", "where", "which", "while",
  "who", "why", "will", "with", "would", "you", "your", "years", "year", "experience", "experienced",
  "work", "working", "team", "teams", "ability", "strong", "knowledge", "including", "etc", "plus",
  "preferred", "required", "requirements", "responsibilities", "qualifications", "candidate", "ideal",
  "company", "position", "applicants", "apply", "benefits", "salary", "remote", "hybrid", "onsite",
  "about", "across", "also", "among", "any", "both", "each", "either", "ensure", "help", "including",
  "new", "one", "other", "per", "provide", "related", "relevant", "skills", "support", "through",
  "well", "within", "without", "build", "building", "develop", "developing", "design", "designing",
  "deliver", "delivering", "drive", "driving", "join", "looking", "opportunity", "great", "good",
  "improve", "platform", "distributed", "write", "reviews", "hiring", "part", "day", "example", "month", "months",
]);

const TECH_PHRASES = [
  "rest api", "rest apis", "restful", "spring boot", "spring mvc", "node.js", "react.js", "next.js",
  "typescript", "javascript", "java", "python", "golang", "kubernetes", "docker", "terraform", "aws",
  "gcp", "azure", "ci/cd", "postgresql", "mysql", "mongodb", "redis", "kafka", "rabbitmq", "graphql",
  "microservices", "distributed systems", "event-driven", "unit testing", "integration testing", "tdd",
  "agile", "scrum", "kanban", "system design", "observability", "prometheus", "grafana", "linux",
  "github actions", "opensearch", "elasticsearch", "sqs", "sns", "lambda", "serverless", "feature flags",
  "oauth", "jwt", "sql", "nosql", "hibernate", "jpa", "maven", "gradle", "webhooks", "openapi", "swagger",
  "sdlc", "code review", "mentoring", "stakeholder management", "cross-functional", "performance optimization",
  "scalability", "high availability", "load balancing", "caching", "message queue", "api design",
  "cloud architecture", "data structures", "algorithms", "microservice architecture", "etl", "data pipeline",
];

const MONTHS = /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/i;

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function usage(message) {
  if (message) console.error(`\nError: ${message}\n`);
  console.error(`Usage: node scripts/ats-check.mjs <resume.md> [options]

Options:
  --jd <file>       Job description to score keyword coverage against
  --years <n>       Years of experience (enables summary/page heuristics)
  --pages <n>       Target page count (default: infer from word count)
  --output <file>   Planned output path (checks file naming)
  --min-score <n>   Fail if the score is below n (default: 0)
  --title <text>    Target job title to check for
  --json            Print machine-readable JSON
  -h, --help        Show this help
`);
  process.exit(2);
}

function parseArgs(argv) {
  const opts = { json: false, minScore: 0 };
  const positional = [];

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const value = () => {
      const next = argv[++i];
      if (next === undefined || next.startsWith("--")) usage(`missing value for ${arg}`);
      return next;
    };
    switch (arg) {
      case "--jd": opts.jd = value(); break;
      case "--years": opts.years = Number(value()); break;
      case "--pages": opts.pages = Number(value()); break;
      case "--output": opts.output = value(); break;
      case "--min-score": opts.minScore = Number(value()); break;
      case "--title": opts.title = value(); break;
      case "--json": opts.json = true; break;
      case "-h":
      case "--help": usage(); break;
      default:
        if (arg.startsWith("--")) usage(`unknown option "${arg}"`);
        positional.push(arg);
    }
  }

  opts.input = positional[0];
  if (!opts.input) usage("missing resume file");
  if (!existsSync(opts.input)) usage(`file not found: ${opts.input}`);
  if (opts.jd && !existsSync(opts.jd)) usage(`job description not found: ${opts.jd}`);
  if (Number.isNaN(opts.minScore) || opts.minScore < 0 || opts.minScore > 100) usage("--min-score must be 0-100");
  return opts;
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/\.(?=\s|$)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseSections(markdown) {
  const lines = markdown.replace(/^\uFEFF/, "").split(/\r?\n/);
  const sections = [];
  let current = { level: 0, title: "", lines: [] };

  for (const line of lines) {
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    // h1/h2 start a section; h3+ stay inside it so bullets remain attached
    if (heading && heading[1].length <= 2) {
      if (current.title) sections.push(current);
      current = { level: heading[1].length, title: heading[2].replace(/\*\*/g, "").trim(), lines: [] };
    } else if (current.title) {
      current.lines.push(line);
    } else if (heading) {
      current.lines.push(line);
    }
  }
  if (current.title) sections.push(current);
  return { sections, lines };
}

function findSection(sections, key) {
  const aliases = SECTION_ALIASES[key] || [key];
  return sections.find((section) => aliases.includes(section.title.toLowerCase())) || null;
}

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------

function runChecks(markdown, opts, jdText) {
  const errors = [];
  const warnings = [];
  const infos = [];
  let passes = 0;

  const { sections, lines } = parseSections(markdown);
  const h1 = sections.find((section) => section.level === 1);
  const h2s = sections.filter((section) => section.level === 2);
  const allText = normalize(markdown.replace(/^#+\s+/gm, ""));
  const contactText = sections.filter((s) => s.level === 1).map((s) => s.lines.join(" ")).join(" ");

  const add = (level, area, message) => {
    if (level === "error") errors.push({ area, message });
    else if (level === "warn") warnings.push({ area, message });
    else infos.push({ area, message });
  };
  const pass = () => { passes += 1; };

  // --- Identity and contact -------------------------------------------------
  if (!h1 || !h1.title.trim()) {
    add("error", "Header", "Missing # Name heading at the top of the resume.");
  } else {
    pass();
  }

  if (!/[^\s@]+@[^\s@]+\.[^\s@]+/.test(contactText)) {
    add("error", "Header", "No email address found.");
  } else {
    pass();
  }

  if (!/(\+\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/.test(contactText)) {
    add("warn", "Header", "No phone number found. Add one for markets where recruiters call.");
  } else {
    pass();
  }

  for (const [label, regex] of [["LinkedIn", /linkedin\.com\/in\//i], ["GitHub", /github\.com\//i]]) {
    if (!regex.test(contactText)) add("warn", "Header", `${label} URL missing. Tech recruiters expect it in the contact line.`);
    else pass();
  }

  // --- Prohibited formatting ------------------------------------------------
  if (/<img|<table|<div|<section|<header|<footer/i.test(markdown)) {
    add("error", "Formatting", "Embedded HTML layout (img/table/div/section/header/footer) can break parsing.");
  } else {
    pass();
  }

  if (/^\s*\|.*\|\s*$/m.test(markdown)) {
    add("error", "Formatting", "Markdown table detected. Use single-column bullets instead.");
  } else {
    pass();
  }

  if (/!\[[^\]]*\]\([^)]*\)/.test(markdown)) {
    add("error", "Formatting", "Image detected. Photos and logos are not ATS-readable.");
  } else {
    pass();
  }

  if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(markdown)) {
    add("warn", "Formatting", "Emoji or icon glyph detected. Remove icons from section headers and bullets.");
  } else {
    pass();
  }

  if (/references?\s+(are\s+)?available\s+upon\s+request/i.test(markdown)) {
    add("warn", "Formatting", 'Remove "References available upon request". It wastes a line.');
  } else {
    pass();
  }

  // --- Section headers ------------------------------------------------------
  const unknown = h2s.filter((section) => !STANDARD_HEADERS.has(section.title.toLowerCase()));
  if (unknown.length > 0) {
    add("warn", "Sections", `Non-standard section heading(s): ${unknown.map((s) => `"${s.title}"`).join(", ")}.`);
  } else {
    pass();
  }

  for (const required of ["experience", "skills", "education"]) {
    if (!findSection(sections, required)) {
      add(required === "experience" ? "error" : "warn", "Sections", `No ${required} section found.`);
    } else {
      pass();
    }
  }

  const summary = findSection(sections, "summary");
  if (summary && opts.years !== undefined && opts.years < 7) {
    add("warn", "Summary", "Summary present below 7 years of experience. Keep it only if it names target role, domain, and proof.");
  } else {
    pass();
  }

  if (opts.title) {
    if (allText.includes(normalize(opts.title))) pass();
    else add("warn", "Targeting", `Target title "${opts.title}" does not appear verbatim. Recruiters search for it.`);
  }

  // --- Experience bullets ---------------------------------------------------
  const experience = findSection(sections, "experience");
  const bullets = experience
    ? experience.lines.filter((line) => /^-\s+/.test(line)).map((line) => line.replace(/^-\s+/, "").replace(/\*\*|`/g, ""))
    : [];

  if (experience && bullets.length < 3) {
    add("warn", "Experience", `Only ${bullets.length} experience bullet(s). Recent roles need 3-5.`);
  } else if (experience) {
    pass();
  }

  if (bullets.length > 0) {
    const withMetric = bullets.filter((bullet) => /\d/.test(bullet));
    const ratio = withMetric.length / bullets.length;
    if (ratio < 0.6) {
      add("warn", "Evidence", `Only ${Math.round(ratio * 100)}% of experience bullets contain a number. Target 60%+ with scale, time, money, or volume.`);
    } else {
      pass();
    }

    const weak = bullets.filter((bullet) => WEAK_VERBS.some((verb) => new RegExp(`^${verb}\\b`, "i").test(bullet)));
    if (weak.length > 0) {
      add("warn", "Evidence", `${weak.length} bullet(s) start with a weak verb. Replace with owned action verbs (see references/action-verbs.md).`);
    } else {
      pass();
    }

    const long = bullets.filter((bullet) => bullet.length > 260);
    if (long.length > 0) {
      add("info", "Evidence", `${long.length} bullet(s) exceed 260 characters. Consider splitting or trimming.`);
    } else {
      pass();
    }

    const firstWords = bullets.map((bullet) => bullet.split(/\s+/)[0].toLowerCase());
    const repeated = firstWords.filter((word, index) => firstWords.indexOf(word) !== index);
    if (repeated.length > Math.max(1, bullets.length / 3)) {
      add("info", "Evidence", "Many bullets start with the same verb. Vary the opening verb.");
    } else {
      pass();
    }
  }

  // --- Dates ----------------------------------------------------------------
  const dateLines = lines.filter((line) => /^\*[^*].*\*$/.test(line.trim()));
  if (dateLines.length === 0) {
    add("warn", "Dates", "No italic date ranges found. Use *Month Year – Month Year* under each role.");
  } else {
    const missingMonth = dateLines.filter((line) => !MONTHS.test(line) && !/\b\d{1,2}\/\d{4}\b/.test(line));
    if (missingMonth.length > 0) {
      add("warn", "Dates", `${missingMonth.length} date range(s) use years only or an unclear format. Prefer *Month Year – Month Year*.`);
    } else {
      pass();
    }
  }

  // --- Skills ---------------------------------------------------------------
  const skills = findSection(sections, "skills");
  if (skills) {
    const skillLines = skills.lines.filter((line) => /^-\s+/.test(line));
    if (skillLines.length === 0) {
      add("warn", "Skills", "Skills section has no bullet lines. Group by Languages, Frameworks, Cloud, Databases/Tools.");
    } else if (skillLines.length > 5) {
      add("warn", "Skills", `${skillLines.length} skill lines is long. Keep it to 3-5 scannable lines.`);
    } else {
      pass();
    }
  }

  // --- Page length ----------------------------------------------------------
  const words = markdown.replace(/[#*`_|>-]/g, " ").split(/\s+/).filter(Boolean).length;
  const targetPages = opts.pages || (words > 700 ? 2 : 1);
  const maxWords = targetPages === 1 ? 700 : targetPages * 700;
  if (words > maxWords + 150) {
    add("warn", "Length", `${words} words for a ${targetPages}-page target. Trim older roles or lower font/spacing.`);
  } else {
    pass();
  }

  // --- Privacy / local conventions -----------------------------------------
  if (/\b(date of birth|marital status|nationality|passport number|c[eé]dula|documento de identidad)\b/i.test(markdown)) {
    add("warn", "Privacy", "Sensitive personal data detected (birth date, marital status, ID). Remove it for US/global applications.");
  } else {
    pass();
  }

  // --- File naming ----------------------------------------------------------
  if (opts.output) {
    const base = path.basename(opts.output);
    if (/^\p{Lu}[\p{L}'-]+[-_]\p{Lu}[\p{L}'-]+[-_](Resume|CV)\.(pdf|docx)$/u.test(base)) pass();
    else add("warn", "Files", `"${base}" is not FirstName-LastName-Resume.pdf. Consistent naming helps recruiters and avoids ATS collisions.`);
  }

  // --- Keyword coverage -----------------------------------------------------
  let keywordReport = null;
  if (jdText) {
    keywordReport = scoreKeywords(jdText, markdown);
    if (keywordReport.coverage < 0.6) {
      add("warn", "Keywords", `Keyword coverage is ${Math.round(keywordReport.coverage * 100)}%. Add missing hard skills where they are truthful.`);
    } else {
      pass();
    }
    if (keywordReport.missing.length > 0) {
      add("info", "Keywords", `Missing or unmatched: ${keywordReport.missing.slice(0, 12).join(", ")}.`);
    }
  }

  // --- Score ----------------------------------------------------------------
  const penalty = errors.length * 10 + warnings.length * 3;
  const structural = Math.max(0, Math.min(100, 100 - penalty));
  const score = keywordReport
    ? Math.round(structural * 0.6 + keywordReport.coverage * 100 * 0.4)
    : structural;

  return { errors, warnings, infos, passes, words, bullets: bullets.length, keywordReport, score };
}

// ---------------------------------------------------------------------------
// Keyword scoring
// ---------------------------------------------------------------------------

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function variants(term) {
  const out = new Set([term]);
  if (term.length > 2) {
    out.add(`${term}s`);
    out.add(`${term}ed`);
    out.add(`${term}ing`);
    // ship -> shipped / shipping
    if (/[^aeiou][aeiou][bcdfgklmnprstvz]$/.test(term)) {
      const doubled = term + term.slice(-1);
      out.add(`${doubled}ed`);
      out.add(`${doubled}ing`);
    }
  }
  if (term.endsWith("ing")) out.add(term.slice(0, -3)).add(`${term.slice(0, -3)}e`).add(`${term.slice(0, -3)}ed`);
  if (term.endsWith("ed")) out.add(term.slice(0, -2));
  if (term.endsWith("s") && !term.endsWith("ss")) out.add(term.slice(0, -1));
  return [...out].filter(Boolean);
}

function hasTerm(haystack, term) {
  const flat = haystack.replace(/[-–—/]/g, " ");
  if (term.includes(" ") || /[-–—/]/.test(term)) {
    return haystack.includes(term) || flat.includes(term.replace(/[-–—/]/g, " "));
  }
  return variants(term).some((variant) =>
    new RegExp(`(^|[^a-z0-9+#.])${escapeRegex(variant)}([^a-z0-9+#.]|$)`, "i").test(flat),
  );
}

function scoreKeywords(jdText, resumeText) {
  const jd = normalize(jdText);
  const resume = normalize(resumeText);
  const terms = new Map();

  for (const phrase of TECH_PHRASES) {
    if (hasTerm(jd, phrase)) terms.set(phrase, { weight: 3, freq: 1 });
  }

  const tokens = jd.replace(/[^a-z0-9+#./\s-]/g, " ").split(/\s+/).filter(Boolean);
  const freq = new Map();
  for (const rawToken of tokens) {
    const token = rawToken.replace(/^[./-]+|[./-]+$/g, "");
    if (token.length < 2 || /^\d+$/.test(token) || STOPWORDS.has(token)) continue;
    freq.set(token, (freq.get(token) || 0) + 1);
  }

  const topTokens = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30);
  for (const [token, count] of topTokens) {
    if (!terms.has(token)) terms.set(token, { weight: 1, freq: count });
  }

  const missing = [];
  let total = 0;
  let matched = 0;
  for (const [term, meta] of terms) {
    total += meta.weight;
    if (hasTerm(resume, term)) matched += meta.weight;
    else missing.push({ term, freq: meta.freq, weight: meta.weight });
  }

  missing.sort((a, b) => b.weight - a.weight || b.freq - a.freq);
  return {
    coverage: total === 0 ? 1 : matched / total,
    matched,
    total,
    missing: missing.map((item) => item.term),
  };
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

function color(enabled, code, text) {
  return enabled ? `\u001b[${code}m${text}\u001b[0m` : text;
}

function report(result, opts, input) {
  const tty = process.stdout.isTTY;
  const green = (text) => color(tty, 32, text);
  const red = (text) => color(tty, 31, text);
  const yellow = (text) => color(tty, 33, text);
  const bold = (text) => color(tty, 1, text);

  console.log(`\n${bold("ATS CHECK")}  ${input}`);
  console.log("=".repeat(60));

  const section = (title, items, formatter) => {
    if (items.length === 0) return;
    console.log(`\n${title}`);
    for (const item of items) console.log(`  ${formatter(item)}`);
  };

  section("Errors", result.errors, (item) => `${red("[x]")} ${item.area}: ${item.message}`);
  section("Warnings", result.warnings, (item) => `${yellow("[!]")} ${item.area}: ${item.message}`);
  section("Notes", result.infos, (item) => `[i] ${item.area}: ${item.message}`);

  console.log(`\nSummary`);
  console.log(`  ${green("[ok]")} ${result.passes} checks passed`);
  console.log(`  [i] ${result.bullets} experience bullets, ${result.words} words`);
  if (result.keywordReport) {
    const pct = Math.round(result.keywordReport.coverage * 100);
    console.log(`  [i] Keyword coverage: ${pct}% (${result.keywordReport.matched}/${result.keywordReport.total} weighted terms)`);
    if (result.keywordReport.missing.length > 0) {
      console.log(`  [i] Unmatched: ${result.keywordReport.missing.slice(0, 15).join(", ")}`);
    }
  }

  const grade = result.score >= 90 ? "A" : result.score >= 80 ? "B" : result.score >= 70 ? "C" : result.score >= 60 ? "D" : "F";
  const scoreLine = `  Score: ${result.score}/100 (${grade})`;
  console.log(result.score >= 80 ? green(scoreLine) : result.score >= 60 ? yellow(scoreLine) : red(scoreLine));

  console.log(`
Manual checks the script cannot do:
  1. Open the PDF and copy-paste all text. Nothing should be missing or reordered.
  2. Confirm one column, no tables, no icons, no text in headers/footers.
  3. Confirm fonts are standard and embedded, and the file is under ~1 MB.
  4. Read it once as a recruiter: can you find the target title and 3 proof points in 6 seconds?
`);

  if (opts.minScore > 0) {
    if (result.score < opts.minScore) {
      console.error(red(`Failed: score ${result.score} is below --min-score ${opts.minScore}.`));
    } else {
      console.log(green(`Passed: score ${result.score} >= ${opts.minScore}.`));
    }
  }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const markdown = await readFile(opts.input, "utf8");
  const jdText = opts.jd ? await readFile(opts.jd, "utf8") : null;
  const result = runChecks(markdown, opts, jdText);

  if (opts.json) {
    console.log(JSON.stringify({ input: opts.input, ...result }, null, 2));
  } else {
    report(result, opts, opts.input);
  }

  if (result.errors.length > 0 || (opts.minScore > 0 && result.score < opts.minScore)) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`\nUnexpected error: ${error.message}\n`);
  process.exit(2);
});
