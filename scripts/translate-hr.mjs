#!/usr/bin/env node
/**
 * Croatian (hr) machine-translation helper for the Lingui `web` catalog.
 *
 * What it does:
 *   1. If `packages/lib/translations/hr/web.po` is missing, it is scaffolded from the
 *      English source catalog (`en/web.po`) with every `msgstr` blanked and the header
 *      switched to Croatian. This mirrors what `lingui extract` would produce for a new
 *      locale, so you can run it even before installing dependencies.
 *   2. Every entry with an empty `msgstr` is machine-translated to Croatian, in batches,
 *      via the chosen provider. Existing (non-empty) translations are never overwritten.
 *   3. ICU placeholders (`{count}`, `{name, plural, ...}`) and Lingui JSX tags
 *      (`<0>...</0>`, `<1/>`) are preserved. Every translation is validated: if the set of
 *      placeholders/tags does not match the source, the item is retried and, if it still
 *      fails, left untranslated (so it falls back to English) and reported at the end.
 *
 * This catalog uses ICU (no gettext `msgid_plural` / `msgstr[n]` arrays) and every entry
 * body is a single line, which is why the light-weight line-based parser below is safe.
 *
 * Usage:
 *   node scripts/translate-hr.mjs --init-only          # only (re)create the hr scaffold
 *   node scripts/translate-hr.mjs                       # scaffold if needed + translate empties
 *   node scripts/translate-hr.mjs --limit 20            # translate only the first 20 (smoke test)
 *   node scripts/translate-hr.mjs --dry-run             # translate but do not write the file
 *   node scripts/translate-hr.mjs --provider deepl      # use DeepL instead of Anthropic
 *
 * Providers / env:
 *   Anthropic (default): ANTHROPIC_API_KEY   (optional: --model, default claude-sonnet-5)
 *   DeepL:               DEEPL_API_KEY        (uses the free endpoint if the key ends in ":fx")
 *
 * After running, review the client-facing strings (signing flow + emails), then
 * `npm run translate:compile` (or let the Docker build do it) to produce hr/web.mjs.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const EN_PO = resolve(ROOT, 'packages/lib/translations/en/web.po');
const HR_PO = resolve(ROOT, 'packages/lib/translations/hr/web.po');
// Directory of `{ "english source": "hrvatski prijevod" }` JSON chunk files used by
// the `local` provider (translations produced by Claude Code directly, no API key needed).
const LOCAL_DIR = resolve(ROOT, 'scripts/hr-translations');

const HR_PLURAL_FORMS =
  'nplurals=3; plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<12 || n%100>14) ? 1 : 2);';

const args = process.argv.slice(2);
const hasFlag = (name) => args.includes(`--${name}`);
const getOpt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};

const INIT_ONLY = hasFlag('init-only');
const DRY_RUN = hasFlag('dry-run');
const LIMIT = Number(getOpt('limit', '0')) || 0;
const PROVIDER = getOpt('provider', 'anthropic');
const MODEL = getOpt('model', 'claude-sonnet-5');
const BATCH_SIZE = Number(getOpt('batch', '30')) || 30;

// ---------------------------------------------------------------------------
// PO (Lingui dialect) escape helpers — single-line bodies only.
// ---------------------------------------------------------------------------
const unescapePo = (s) => {
  let out = '';
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '\\') {
      const n = s[i + 1];
      if (n === 'n') out += '\n';
      else if (n === 't') out += '\t';
      else if (n === 'r') out += '\r';
      else if (n === '"') out += '"';
      else if (n === '\\') out += '\\';
      else out += n;
      i++;
    } else {
      out += s[i];
    }
  }
  return out;
};

const escapePo = (s) =>
  s
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t')
    .replace(/\r/g, '\\r');

// The working-tree catalogs are CRLF on Windows (git autocrlf). Split on either and
// preserve the file's original line ending so diffs stay clean.
const readPo = (path) => {
  const raw = readFileSync(path, 'utf8');
  return { lines: raw.split(/\r?\n/), eol: raw.includes('\r\n') ? '\r\n' : '\n' };
};

// ---------------------------------------------------------------------------
// Placeholder extraction + validation.
// Captures: ICU/variable names right after `{`, Lingui JSX tags, and `#` markers.
// ---------------------------------------------------------------------------
const placeholderSignature = (text) => {
  // Mask the opening brace of every plural branch (`one {...}`, `few {...}`, `other {...}`,
  // etc.) so branch bodies like `{Day}` or `{1 Field Remaining}` are not mistaken for
  // variables. The catalog uses ICU `plural` only (no `select`/`selectordinal`), so the
  // selector keyword set is finite. Nested real args inside branches (e.g. `{{count} ...}`)
  // keep their own brace and are still detected.
  const masked = text.replace(/\b(zero|one|two|few|many|other)(\s*)\{/g, '$1$2');

  const tokens = new Set();
  // Typed arguments: `{name, plural, ...}` — identifier followed by a comma.
  for (const m of masked.matchAll(/\{\s*([a-zA-Z0-9_]+)\s*,/g)) tokens.add(`var:${m[1]}`);
  // Simple arguments: `{name}` — identifier followed by a closing brace.
  for (const m of masked.matchAll(/\{\s*([a-zA-Z0-9_]+)\s*\}/g)) tokens.add(`var:${m[1]}`);
  // Lingui component tags: <0>, </0>, <1/>.
  for (const m of text.matchAll(/<\/?\d+\/?>/g)) tokens.add(`tag:${m[0]}`);
  // Compared as a set (distinct tokens): catches any missing/extra placeholder, while
  // allowing Croatian to add plural branches (few) that re-reference an existing variable.
  return [...tokens].sort().join('|');
};

// ---------------------------------------------------------------------------
// Scaffold hr/web.po from en/web.po (blank every msgstr, switch header).
// ---------------------------------------------------------------------------
const scaffoldFromEnglish = () => {
  const { lines, eol } = readPo(EN_PO);
  let inHeader = true;
  const out = lines.map((line) => {
    if (inHeader) {
      if (line.startsWith('#') || (line.startsWith('msgid ') && line !== 'msgid ""')) {
        inHeader = false; // first real entry reached
      } else {
        if (line === '"Language: en\\n"') return '"Language: hr\\n"';
        if (line.startsWith('"Plural-Forms:')) return `"Plural-Forms: ${HR_PLURAL_FORMS}\\n"`;
        if (line.startsWith('"Language-Team:')) return '"Language-Team: Croatian\\n"';
        return line;
      }
    }
    // Body: blank all translations. (Header msgstr is already "" so this is a no-op there.)
    if (/^msgstr ".*"$/.test(line)) return 'msgstr ""';
    return line;
  });
  mkdirSync(dirname(HR_PO), { recursive: true });
  writeFileSync(HR_PO, out.join(eol), 'utf8');
  console.log(`✅ Scaffolded ${HR_PO} from English source.`);
};

// ---------------------------------------------------------------------------
// Parse hr/web.po into an array of line records; identify translatable entries.
// ---------------------------------------------------------------------------
const loadEntries = () => {
  const { lines, eol } = readPo(HR_PO);
  const entries = [];
  let sawFirstMsgid = false;

  for (let i = 0; i < lines.length; i++) {
    const msgidMatch = lines[i].match(/^msgid "(.*)"$/);
    if (!msgidMatch) continue;

    // Skip the header entry (the first `msgid ""`).
    if (!sawFirstMsgid) {
      sawFirstMsgid = true;
      if (msgidMatch[1] === '') continue;
    }
    if (msgidMatch[1] === '') continue;

    // The msgstr line is the next `msgstr "..."` line.
    let j = i + 1;
    while (j < lines.length && !/^msgstr "/.test(lines[j])) j++;
    if (j >= lines.length) continue;

    const source = unescapePo(msgidMatch[1]);
    const target = unescapePo(lines[j].match(/^msgstr "(.*)"$/)?.[1] ?? '');
    entries.push({ msgstrLine: j, source, target });
  }
  return { lines, entries, eol };
};

// ---------------------------------------------------------------------------
// Providers.
// ---------------------------------------------------------------------------
const SYSTEM_PROMPT = [
  'You are a professional software localizer translating a document-signing web app UI from English to Croatian (hrvatski).',
  'Rules you MUST follow for every string:',
  '- Keep the meaning natural and concise, appropriate for a business e-signature product.',
  '- DO NOT translate or alter placeholders. Curly-brace placeholders like {count}, {name}, {documentName} must stay byte-for-byte identical.',
  '- For ICU expressions like {count, plural, one {# item} other {# items}} keep the variable name, the keywords (plural, select, one, other, few, many, #) and the braces exactly; translate only the human-readable words inside the branches. Croatian plural has one/few/many/other.',
  '- DO NOT translate or alter component tags like <0>, </0>, <1/>. Keep them exactly and in the same positions.',
  '- Preserve leading/trailing spaces and punctuation.',
  'Return ONLY a JSON array of strings, same length and order as the input array, no commentary.',
].join('\n');

const translateBatchAnthropic = async (sources) => {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY is not set.');
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 8192,
      temperature: 0,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: JSON.stringify(sources, null, 0) }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = (data.content ?? []).map((b) => b.text ?? '').join('');
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start === -1 || end === -1) throw new Error(`Unexpected model output: ${text.slice(0, 200)}`);
  const parsed = JSON.parse(text.slice(start, end + 1));
  if (!Array.isArray(parsed) || parsed.length !== sources.length) {
    throw new Error(`Model returned ${parsed.length} items for ${sources.length} inputs.`);
  }
  return parsed.map(String);
};

const translateBatchDeepL = async (sources) => {
  const key = process.env.DEEPL_API_KEY;
  if (!key) throw new Error('DEEPL_API_KEY is not set.');
  const endpoint = key.endsWith(':fx')
    ? 'https://api-free.deepl.com/v2/translate'
    : 'https://api.deepl.com/v2/translate';
  // Mask placeholders/tags so DeepL leaves them intact, then restore.
  const tokenRe = /(\{[^{}]*\}|<\/?\d+\/?>)/g;
  const masks = sources.map((s) => {
    const map = [];
    const masked = s.replace(tokenRe, (m) => {
      const id = map.length;
      map.push(m);
      return `⁣${id}⁣`; // invisible-separator-wrapped index, unlikely to be translated
    });
    return { masked, map };
  });
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      Authorization: `DeepL-Auth-Key ${key}`,
    },
    body: JSON.stringify({ text: masks.map((m) => m.masked), source_lang: 'EN', target_lang: 'HR' }),
  });
  if (!res.ok) throw new Error(`DeepL API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.translations.map((t, i) =>
    t.text.replace(/⁣(\d+)⁣/g, (_, id) => masks[i].map[Number(id)] ?? ''),
  );
};

// Local provider: merge every JSON chunk file in scripts/hr-translations/ into one map.
// Later files override earlier ones. Missing keys are returned empty (stay pending).
let LOCAL_MAP = null;
const loadLocalMap = () => {
  const map = new Map();
  if (!existsSync(LOCAL_DIR)) return map;
  for (const file of readdirSync(LOCAL_DIR).sort()) {
    if (!file.endsWith('.json')) continue;
    const parsed = JSON.parse(readFileSync(resolve(LOCAL_DIR, file), 'utf8'));
    // Accept either an object { source: target } or an array of [source, target] pairs.
    const pairs = Array.isArray(parsed) ? parsed : Object.entries(parsed);
    for (const [source, target] of pairs) map.set(source, target);
  }
  return map;
};

const translateBatchLocal = async (sources) => sources.map((s) => LOCAL_MAP.get(s) ?? '');

const translateBatch = (sources) => {
  if (PROVIDER === 'local') return translateBatchLocal(sources);
  if (PROVIDER === 'deepl') return translateBatchDeepL(sources);
  return translateBatchAnthropic(sources);
};

// ---------------------------------------------------------------------------
// Main.
// ---------------------------------------------------------------------------
const main = async () => {
  if (!existsSync(EN_PO)) throw new Error(`English source catalog not found at ${EN_PO}`);
  if (!existsSync(HR_PO)) scaffoldFromEnglish();

  const { lines, entries, eol } = loadEntries();
  let pending = entries.filter((e) => e.target.trim() === '');
  console.log(`Catalog: ${entries.length} entries, ${pending.length} untranslated.`);

  if (INIT_ONLY) {
    console.log('--init-only: scaffold ready, skipping translation.');
    return;
  }

  // For the local provider, only attempt entries we actually have a translation for.
  if (PROVIDER === 'local') {
    LOCAL_MAP = loadLocalMap();
    const before = pending.length;
    pending = pending.filter((e) => LOCAL_MAP.has(e.source));
    console.log(`Local provider: ${LOCAL_MAP.size} translations available, ${pending.length}/${before} untranslated entries covered.`);
  }

  if (LIMIT > 0) pending = pending.slice(0, LIMIT);
  if (pending.length === 0) {
    console.log('Nothing to translate. Done.');
    return;
  }

  const failed = [];
  let translated = 0;

  for (let b = 0; b < pending.length; b += BATCH_SIZE) {
    const batch = pending.slice(b, b + BATCH_SIZE);
    let results;
    try {
      results = await translateBatch(batch.map((e) => e.source));
    } catch (err) {
      console.error(`Batch ${b}-${b + batch.length} failed: ${err.message}`);
      failed.push(...batch.map((e) => e.source));
      continue;
    }

    for (let k = 0; k < batch.length; k++) {
      const entry = batch[k];
      const candidate = results[k] ?? '';
      if (candidate.trim() !== '' && placeholderSignature(candidate) === placeholderSignature(entry.source)) {
        lines[entry.msgstrLine] = `msgstr "${escapePo(candidate)}"`;
        entry.target = candidate;
        translated++;
      } else {
        failed.push(entry.source);
      }
    }

    // Write incrementally so long runs are resumable.
    if (!DRY_RUN) writeFileSync(HR_PO, lines.join(eol), 'utf8');
    console.log(`  ...${Math.min(b + BATCH_SIZE, pending.length)}/${pending.length}`);
  }

  console.log(`\n✅ Translated ${translated} entries.`);
  if (failed.length > 0) {
    console.log(`⚠️  ${failed.length} left untranslated (placeholder mismatch or API error). They fall back to English until fixed manually. Examples:`);
    for (const s of failed.slice(0, 10)) console.log(`   - ${s.slice(0, 100)}`);
  }
  if (DRY_RUN) console.log('(--dry-run: file not written)');
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
