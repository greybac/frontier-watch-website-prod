#!/usr/bin/env node
/**
 * Frontier Watch — tracker build step (zero dependencies, Node >= 16)
 *
 * Run after every edit to signals/signals/signals.json:
 *     node build.js
 *
 * What it regenerates inside signals/index.html (between marker comments):
 *   1. STATIC  — crawler-visible HTML for every signal (SEO/GEO). React replaces
 *                this at runtime, so users never see it for more than a moment.
 *   2. DATA    — signals.json embedded as <script id="signals-data">, so the app
 *                renders instantly with no fetch (app.jsx falls back to fetch if absent).
 *   3. JSONLD  — schema.org structured data for search engines and AI crawlers.
 *
 * Skipping this step never breaks the page — the React app still fetches
 * signals.json directly. Only crawler-visible content goes stale.
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DATA_PATH = path.join(ROOT, 'signals', 'signals', 'signals.json');
const PAGE_PATH = path.join(ROOT, 'signals', 'index.html');

const esc = s => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const fmtDate = d => {
  if (!d) return '';
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const HORIZON = { '6-12': '6–12 months', '12-18': '12–18 months', '18-24': '18–24 months' };
const STATUS = { active: 'Active', developing: 'Developing', resolved: 'Resolved', invalidated: 'Invalidated' };

function main() {
  const raw = fs.readFileSync(DATA_PATH, 'utf8');
  const data = JSON.parse(raw);
  const signals = data.signals || [];
  const lastUpdated = (data.meta && data.meta.last_updated) || '';

  // ── 1. Static HTML ──────────────────────────────────────────────────────
  const staticHtml = [
    '<div class="static-signals">',
    '<h1>Signal Tracker</h1>',
    `<p class="static-intro">Forward-looking signals on AI, semiconductors, and quantum computing — confidence-scored, source-cited, outcomes recorded publicly. ${signals.length} signals published since April 2026.${lastUpdated ? ' Last updated ' + esc(fmtDate(lastUpdated)) + '.' : ''}</p>`,
    ...signals.map(s => {
      const briefs = (s.related_briefs || [])
        .map(b => `<a href="${esc(b.url)}" rel="noopener">${esc(b.title)}</a>`)
        .join(' · ');
      const outcome = s.outcome
        ? `<p><strong>Outcome:</strong> ${esc(s.outcome.what_happened)}</p>`
        : '';
      return [
        `<article id="static-${esc(s.id)}">`,
        `<h2>${esc(s.title)}</h2>`,
        `<p class="static-meta">${esc(s.domain)} · ${esc(STATUS[s.status] || s.status)} · Confidence ${s.confidence}/5 · Horizon ${esc(HORIZON[s.horizon] || s.horizon)} · Added ${esc(fmtDate(s.date_added))} · Updated ${esc(fmtDate(s.date_updated))}</p>`,
        `<p><strong>Thesis:</strong> ${esc(s.thesis)}</p>`,
        `<p><strong>Strategic implication:</strong> ${esc(s.strategic_implication)}</p>`,
        outcome,
        briefs ? `<p>Related analysis: ${briefs}</p>` : '',
        '</article>',
      ].filter(Boolean).join('\n');
    }),
    '</div>',
  ].join('\n');

  // ── 2. Embedded data ────────────────────────────────────────────────────
  // </script> can never legally appear inside, but guard anyway.
  const safeJson = JSON.stringify(data).replace(/<\/script/gi, '<\\/script');
  const dataHtml = `<script id="signals-data" type="application/json">${safeJson}</script>`;

  // ── 3. JSON-LD ──────────────────────────────────────────────────────────
  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'Frontier Watch Signal Tracker',
    description: 'Forward-looking signals on AI, semiconductors, and quantum computing — confidence-scored, source-cited, outcomes recorded publicly.',
    url: 'https://frontierwatch.io/signals/',
    creator: { '@type': 'Person', name: 'Himanshu Atre', url: 'https://himanshuatre.com' },
    publisher: { '@type': 'Organization', name: 'Frontier Watch', url: 'https://frontierwatch.io' },
    dateModified: lastUpdated || undefined,
    hasPart: signals.map(s => ({
      '@type': 'Claim',
      name: s.title,
      url: 'https://frontierwatch.io/signals/#' + s.id,
      datePublished: s.date_added,
      dateModified: s.date_updated,
      about: s.domain,
    })),
  };
  const jsonldHtml = `<script type="application/ld+json">${JSON.stringify(jsonld, null, 0).replace(/<\/script/gi, '<\\/script')}</script>`;

  // ── Inject between markers ──────────────────────────────────────────────
  // IMPORTANT: the replacement is a FUNCTION, never a string. String
  // replacements treat `$` sequences as special ($1, $&, $'), and signal
  // text is full of dollar amounts ("$262B") — a string replacement here
  // corrupts the page. A function's return value is inserted literally.
  let page = fs.readFileSync(PAGE_PATH, 'utf8');
  const inject = (content, name) => {
    const start = `<!-- ${name}:START -->`;
    const end = `<!-- ${name}:END -->`;
    const re = new RegExp(`${start}[\\s\\S]*${end}`); // greedy: spans ALL stray markers, self-healing
    if (!re.test(page)) throw new Error(`Marker ${name} not found in signals/index.html`);
    page = page.replace(re, () => `${start}\n${content}\n${end}`);
  };
  inject(staticHtml, 'STATIC');
  inject(dataHtml, 'DATA');
  inject(jsonldHtml, 'JSONLD');

  // ── Self-checks — refuse to write a corrupted page ──────────────────────
  for (const name of ['STATIC', 'DATA', 'JSONLD']) {
    for (const m of [`<!-- ${name}:START -->`, `<!-- ${name}:END -->`]) {
      const count = page.split(m).length - 1;
      if (count !== 1) throw new Error(`Self-check failed: marker ${m} appears ${count}x (expected 1)`);
    }
  }
  const dataMatch = page.match(/<script id="signals-data" type="application\/json">([\s\S]*?)<\/script>/);
  if (!dataMatch) throw new Error('Self-check failed: embedded data script not found');
  const parsed = JSON.parse(dataMatch[1]); // throws if corrupted
  if (!Array.isArray(parsed.signals) || parsed.signals.length !== signals.length)
    throw new Error('Self-check failed: embedded data does not round-trip');
  const opens = (page.match(/<div\b/g) || []).length;
  const closes = (page.match(/<\/div>/g) || []).length;
  if (opens !== closes) throw new Error(`Self-check failed: unbalanced <div> tags (${opens} open, ${closes} close)`);

  fs.writeFileSync(PAGE_PATH, page);

  // ── Sitemap: keep /signals/ lastmod in sync with meta.last_updated ──────
  const SITEMAP_PATH = path.join(ROOT, 'sitemap.xml');
  if (lastUpdated && fs.existsSync(SITEMAP_PATH)) {
    let sitemap = fs.readFileSync(SITEMAP_PATH, 'utf8');
    sitemap = sitemap.replace(
      /<!-- SITEMAP-SIGNALS-LASTMOD --><lastmod>[^<]*<\/lastmod>/,
      () => `<!-- SITEMAP-SIGNALS-LASTMOD --><lastmod>${lastUpdated}</lastmod>`
    );
    fs.writeFileSync(SITEMAP_PATH, sitemap);
  }

  console.log(`build.js: injected ${signals.length} signals (last updated ${lastUpdated || 'unknown'}) into signals/index.html — self-checks passed; sitemap lastmod synced`);
}

main();
