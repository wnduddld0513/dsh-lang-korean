// Snapshot the English source of supported third-party plugins into i18n/<pack>/source.json, read
// from a profile's installed copies.
//   dictionaries — keys of every ctx.locale.register(...) dictionary (en + zh per key); Korean is
//                  registered under the same namespace and keys.
//   englishText  — every inline { zh, en } copy entry, keyed by its English text, for plugins that
//                  pick `entry[activeLocale]` themselves instead of using the locale registry.
// Package descriptions (locale/en.json meta.description) join englishText; titles stay as named.
//
//   node scripts/extract-plugins.mjs ["<profile>/node_modules"]
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { registrations, scan } from './source-resolve.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const MODULES = process.argv[2] ?? join(process.env.DSH_HOME ?? join(homedir(), '.dsh'), 'profiles/desktop/node_modules')

const PLUGINS = [
  { pack: 'claude-style', package: 'dsh-claude-style', mode: 'englishText' },
  { pack: 'session-delete', package: 'better-dsh-session-deletetool', mode: 'dictionaries' },
  { pack: 'skills-manager', package: '@michengai/dsh-skills-manager', mode: 'dictionaries' },
]

function clientEntry(manifest) {
  const client = manifest.exports?.['./client']
  return typeof client === 'string' ? client : client?.default
}

/** Every `{ zh: "…", en: "…" }` object literal whose two values are plain strings. */
function inlineCopy(src) {
  const texts = {}
  let skipped = 0
  // A whole-file tokenizer misreads regex literals in minified code, so each candidate is scanned
  // from its own opening brace.
  for (const m of src.matchAll(/\{\s*["']?(?:zh|en)["']?\s*:/g)) {
    let parts
    try { parts = scan(src, m.index)[0] } catch { continue }
    const keys = parts.map((p) => /^["']?(\w+)["']?\s*:/.exec(p)?.[1])
    if (parts.length !== 2 || !keys.includes('zh') || !keys.includes('en')) continue
    let value
    try { value = new Function(`return ({${parts.join(',')}})`)() } catch { skipped++; continue }
    if (typeof value.en !== 'string' || typeof value.zh !== 'string' || value.en === '') { skipped++; continue }
    texts[value.en] ??= { zh: value.zh }
  }
  return { texts, skipped }
}

const readMeta = (path) => (existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')).meta ?? {} : {})

for (const plugin of PLUGINS) {
  const dir = join(MODULES, plugin.package)
  if (!existsSync(join(dir, 'package.json'))) {
    console.warn(`skip ${plugin.pack}: ${plugin.package} is not installed in ${MODULES}`)
    continue
  }
  const manifest = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'))
  const src = readFileSync(join(dir, clientEntry(manifest)), 'utf8')
  const out = { package: plugin.package, version: manifest.version, mode: plugin.mode, ui: {}, englishText: {} }
  const notes = []
  if (plugin.mode === 'dictionaries') {
    const { found, problems } = registrations(src, plugin.package)
    notes.push(...problems)
    for (const { ns, dicts } of found) {
      if (!dicts?.en) continue
      const entry = (out.ui[ns] ??= {})
      for (const [key, en] of Object.entries(dicts.en)) if (typeof en === 'string') entry[key] = { en, zh: dicts.zh?.[key] ?? '' }
    }
  } else {
    const { texts, skipped } = inlineCopy(src)
    out.englishText = texts
    if (skipped) notes.push(`${skipped} { zh, en } entries hold non-literal values and stay untranslated`)
  }
  const en = readMeta(join(dir, 'locale/en.json'))
  const zh = readMeta(join(dir, 'locale/zh.json'))
  if (typeof en.description === 'string' && typeof zh.description === 'string') out.englishText[en.description] ??= { zh: zh.description }

  const file = join(HERE, `../i18n/${plugin.pack}/source.json`)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, `${JSON.stringify(out, null, 1)}\n`)
  const keys = Object.values(out.ui).reduce((sum, entry) => sum + Object.keys(entry).length, 0)
  console.log(`${plugin.package}@${manifest.version}: ${Object.keys(out.ui).length} namespaces, ${keys} keys, ${Object.keys(out.englishText).length} English texts → i18n/${plugin.pack}/source.json`)
  for (const note of notes) console.warn(`warning: ${note}`)
}
