#!/usr/bin/env node
/**
 * build.mjs — Markdown resume -> clean HTML -> PDF
 *
 * Zero npm dependencies. PDF export uses a local Chrome/Edge/Chromium in
 * headless mode, so nothing is uploaded and no browser is downloaded.
 *
 * Usage:
 *   node scripts/build.mjs resume.md
 *   node scripts/build.mjs resume.md --out dist --name First-Last-Resume
 *   node scripts/build.mjs resume.md --no-pdf --font-size 9.2pt --a4
 */

import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_CSS = path.join(ROOT, "templates", "resume.css");

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function fail(message) {
  console.error(`\nError: ${message}\n`);
  process.exit(1);
}

function parseArgs(argv) {
  const opts = {
    out: "dist",
    css: DEFAULT_CSS,
    fontSize: "9.4pt",
    a4: false,
    pdf: true,
    requirePdf: false,
    lang: "en",
    help: false,
  };
  const positional = [];

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case "--out":
        opts.out = argv[++i];
        break;
      case "--name":
        opts.name = argv[++i];
        break;
      case "--title":
        opts.title = argv[++i];
        break;
      case "--css":
        opts.css = path.resolve(argv[++i]);
        break;
      case "--font-size":
        opts.fontSize = argv[++i];
        break;
      case "--lang":
        opts.lang = argv[++i];
        break;
      case "--a4":
        opts.a4 = true;
        break;
      case "--no-pdf":
        opts.pdf = false;
        break;
      case "--require-pdf":
        opts.requirePdf = true;
        break;
      case "-h":
      case "--help":
        opts.help = true;
        break;
      default:
        if (arg.startsWith("--")) fail(`unknown option "${arg}" (run with --help)`);
        positional.push(arg);
    }
  }

  opts.input = positional[0];
  if (opts.help) return opts;
  if (!opts.input) fail("missing input file. Example: node scripts/build.mjs resume.md");
  if (!/^\d+(\.\d+)?(pt|px)$/.test(opts.fontSize)) {
    fail(`invalid --font-size "${opts.fontSize}". Use values like 9.4pt or 13px.`);
  }
  if (!existsSync(opts.input)) fail(`input file not found: ${opts.input}`);
  if (!existsSync(opts.css)) fail(`CSS file not found: ${opts.css}`);

  return opts;
}

function help() {
  console.log(`
Markdown resume -> HTML -> PDF

Usage:
  node scripts/build.mjs <resume.md> [options]

Options:
  --out <dir>        Output directory (default: dist)
  --name <base>      Output base name (default: input file name)
  --title <text>     HTML <title> (default: name)
  --font-size <size> Body font size (default: 9.4pt)
  --css <file>       Custom stylesheet (default: templates/resume.css)
  --lang <code>      HTML language (default: en)
  --a4               Use A4 instead of US Letter
  --no-pdf           Build HTML only
  --require-pdf      Exit with an error if PDF export fails
  -h, --help         Show this help

PDF export looks for Chrome, Edge, or Chromium already installed on the
machine. If none is found, the HTML is still written and can be printed
to PDF with Ctrl/Cmd+P.
`);
}

// ---------------------------------------------------------------------------
// Markdown -> HTML (ATS-safe subset)
// ---------------------------------------------------------------------------

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inline(text) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");
}

function isUrl(value) {
  return /^(https?:\/\/|www\.)/i.test(value) || /^[\w.-]+\.(com|dev|io|co|net|org|me|app|ai)(\/|$)/i.test(value);
}

function isEmail(value) {
  return /^[^\s@|]+@[^\s@|]+\.[^\s@|]+$/.test(value);
}

function contactLine(text) {
  return text
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      if (isEmail(part)) return `<a href="mailto:${part}">${part}</a>`;
      if (isUrl(part)) {
        const href = /^https?:\/\//i.test(part) ? part : `https://${part}`;
        return `<a href="${href}">${part}</a>`;
      }
      return escapeHtml(part);
    })
    .join(' <span class="sep">|</span> ');
}

function convertMarkdown(markdown, warnings) {
  const lines = markdown.replace(/^\uFEFF/, "").split(/\r?\n/);
  let html = "";
  let inList = false;
  let contactEmitted = false;

  const closeList = () => {
    if (inList) {
      html += "</ul>\n";
      inList = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (!line.trim()) {
      closeList();
      continue;
    }

    if (/^\s*\|.*\|\s*$/.test(line)) {
      warnings.push("Markdown table row detected. ATS parsers often scramble tables; use plain bullets.");
      closeList();
      html += `<p>${inline(line)}</p>\n`;
      continue;
    }

    if (/^#{1,6}\s+/.test(line)) {
      closeList();
      const match = line.match(/^(#{1,6})\s+(.*)$/);
      const level = match[1].length;
      const content = inline(match[2]);
      if (level === 1 && !contactEmitted) {
        html += `<h1>${content}</h1>\n`;
        contactEmitted = false;
      } else {
        html += `<h${level}>${content}</h${level}>\n`;
      }
      continue;
    }

    if (line.startsWith("- ") || (line.startsWith("* ") && !/^\*[^*].*\*$/.test(line))) {
      if (!inList) {
        html += "<ul>\n";
        inList = true;
      }
      html += `<li>${inline(line.slice(2))}</li>\n`;
      continue;
    }

    if (/^\*[^*].*\*$/.test(line) && !line.startsWith("**")) {
      closeList();
      html += `<p class="dates">${inline(line.slice(1, -1))}</p>\n`;
      continue;
    }

    if (html.endsWith("</h1>\n") && !contactEmitted) {
      contactEmitted = true;
      html += `<p class="contact">${contactLine(line)}</p>\n`;
      continue;
    }

    closeList();
    html += `<p>${inline(line)}</p>\n`;
  }

  closeList();
  return html;
}

// ---------------------------------------------------------------------------
// PDF export (installed browser, no downloads)
// ---------------------------------------------------------------------------

function browserCandidates() {
  const candidates = [];
  if (process.env.CHROME_PATH) candidates.push(process.env.CHROME_PATH);

  if (process.platform === "win32") {
    const roots = [process.env.PROGRAMFILES, process.env["PROGRAMFILES(X86)"], process.env.LOCALAPPDATA].filter(Boolean);
    for (const root of roots) {
      candidates.push(
        path.join(root, "Google", "Chrome", "Application", "chrome.exe"),
        path.join(root, "Microsoft", "Edge", "Application", "msedge.exe"),
        path.join(root, "Chromium", "Application", "chrome.exe"),
      );
    }
  } else if (process.platform === "darwin") {
    candidates.push(
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
    );
  } else {
    candidates.push("google-chrome", "google-chrome-stable", "chromium", "chromium-browser", "microsoft-edge");
  }

  const seen = new Set();
  return candidates.filter((candidate) => {
    if (!candidate || seen.has(candidate)) return false;
    seen.add(candidate);
    return path.isAbsolute(candidate) ? existsSync(candidate) : true;
  });
}

function run(command, args, timeoutMs = 60_000) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`browser timed out after ${timeoutMs / 1000}s`));
    }, timeoutMs);

    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`browser exited with code ${code}\n${stderr.slice(-800)}`));
    });
  });
}

function countPdfPages(buffer) {
  const text = buffer.toString("latin1");
  const pages = text.match(/\/Type\s*\/Page\b(?!s)/g);
  return pages ? pages.length : null;
}

async function exportPdf(htmlPath, pdfPath) {
  const candidates = browserCandidates();
  if (candidates.length === 0) {
    return { ok: false, reason: "no Chrome, Edge, or Chromium installation found" };
  }

  const profileDir = path.join(os.tmpdir(), `ats-resume-builder-${process.pid}`);
  const argsBase = [
    "--headless=new",
    "--disable-gpu",
    "--disable-extensions",
    "--no-first-run",
    "--no-default-browser-check",
    "--no-pdf-header-footer",
    "--print-to-pdf-no-header",
    "--run-all-compositor-stages-before-draw",
    `--user-data-dir=${profileDir}`,
    `--print-to-pdf=${pdfPath}`,
    pathToFileURL(htmlPath).href,
  ];
  if (typeof process.getuid === "function" && process.getuid() === 0) argsBase.unshift("--no-sandbox");

  let lastError = null;
  try {
    for (const browser of candidates) {
      try {
        await run(browser, argsBase);
        if (!existsSync(pdfPath)) throw new Error("browser finished but no PDF was written");
        return { ok: true, browser };
      } catch (error) {
        lastError = error;
      }
    }
  } finally {
    await rm(profileDir, { recursive: true, force: true }).catch(() => {});
  }

  return { ok: false, reason: lastError ? lastError.message : "unknown browser error" };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    help();
    return;
  }

  const markdown = await readFile(opts.input, "utf8");
  const css = await readFile(opts.css, "utf8");
  const warnings = [];
  const content = convertMarkdown(markdown, warnings);

  const outDir = path.resolve(opts.out);
  await mkdir(outDir, { recursive: true });

  const baseName = opts.name || path.basename(opts.input, path.extname(opts.input));
  const htmlPath = path.join(outDir, `${baseName}.html`);
  const pdfPath = path.join(outDir, `${baseName}.pdf`);
  const title = opts.title || baseName.replace(/[-_]/g, " ");
  const pageSize = opts.a4 ? "A4" : "Letter";
  const pageOverride = opts.a4 ? "@page { size: A4; }\n" : "";

  const html = `<!DOCTYPE html>
<html lang="${escapeHtml(opts.lang)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="generator" content="ats-resume-builder">
<title>${escapeHtml(title)}</title>
<style>
${css}
:root { --font-size: ${opts.fontSize}; }
${pageOverride}</style>
</head>
<body>
${content}</body>
</html>
`;

  await writeFile(htmlPath, html, "utf8");
  console.log(`HTML   ${path.relative(process.cwd(), htmlPath)}  (${pageSize}, ${opts.fontSize})`);

  for (const warning of warnings) console.warn(`WARN   ${warning}`);

  if (!opts.pdf) return;

  const result = await exportPdf(htmlPath, pdfPath);
  if (result.ok) {
    const pages = countPdfPages(await readFile(pdfPath));
    const suffix = pages ? `, ~${pages} page${pages === 1 ? "" : "s"}` : "";
    console.log(`PDF    ${path.relative(process.cwd(), pdfPath)}  (${path.basename(result.browser)}${suffix})`);
    console.log("\nBefore applying: open the PDF, select all text, and confirm every section is selectable.");
    return;
  }

  console.warn(`\nPDF export skipped: ${result.reason}`);
  console.warn("Open the HTML and use Ctrl/Cmd+P -> Save as PDF (margins: none, background: on).");
  console.warn("Or set CHROME_PATH to a Chrome/Edge/Chromium executable and run again.");
  if (opts.requirePdf) process.exitCode = 1;
}

main().catch((error) => fail(error.message));
