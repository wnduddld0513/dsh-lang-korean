// Snapshot the translation source of an installed DeepSeek Harness into i18n/dsh/source.json:
// every ctx.locale.register(...) dictionary inlined in the official lib/client.js bundles (ja + en
// per key) and every package's locale/**/ja.json display text. A kana-bearing string literal that
// no dictionary accounts for is reported, so a new registration pattern cannot slip past.
//
//   node scripts/extract.mjs ["<DeepSeek Harness>/resources/app/dsh"]
import { readdirSync, readFileSync, existsSync, statSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { registrations, skipString } from './source-resolve.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const DSH = process.argv[2] ?? join(process.env.LOCALAPPDATA ?? '', 'Programs/DeepSeek Harness/resources/app/dsh')
const ROOT = join(DSH, 'node_modules/@deepseek-ai')
const OUT = join(HERE, '../i18n/dsh/source.json')
const KANA = /[\u3040-\u30ff]/

const ui = {}
const problems = []
for (const pkg of readdirSync(ROOT).sort()) {
  const file = join(ROOT, pkg, 'lib/client.js')
  if (!existsSync(file)) continue
  const src = readFileSync(file, 'utf8')
  if (!KANA.test(src)) continue
  const captured = new Set()
  const { found, problems: failed } = registrations(src, pkg)
  problems.push(...failed)
  for (const { ns, dicts } of found) {
    if (!dicts?.ja) continue
    const entry = (ui[ns] ??= {})
    for (const [key, ja] of Object.entries(dicts.ja)) {
      entry[key] = { ja, en: dicts.en?.[key] ?? '' }
      captured.add(ja)
    }
  }
  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (c === '/' && src[i + 1] === '/') { i = src.indexOf('\n', i); if (i < 0) break; continue }
    if (c === '/' && src[i + 1] === '*') { i = src.indexOf('*/', i) + 1; continue }
    if (c !== '"' && c !== "'" && c !== '`') continue
    const end = skipString(src, i)
    const raw = src.slice(i, end + 1)
    i = end
    if (!KANA.test(raw) || raw.includes('\n')) continue
    let value
    try { value = new Function(`return ${raw}`)() } catch { continue }
    if (!captured.has(value)) problems.push(`${pkg}: unregistered Japanese literal ${JSON.stringify(value).slice(0, 80)}`)
  }
}

function* jaFiles(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) yield* jaFiles(path)
    else if (name === 'ja.json') yield path
  }
}
const readMeta = (path) => (existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')).meta ?? {} : {})
const packageText = {}
for (const pkg of readdirSync(ROOT).sort()) {
  const dir = join(ROOT, pkg, 'locale')
  if (!existsSync(dir)) continue
  for (const path of jaFiles(dir)) {
    const ja = readMeta(path)
    const en = readMeta(join(dirname(path), 'en.json'))
    // meta.detail names a document file, not display text.
    for (const field of ['title', 'description']) {
      if (typeof ja[field] !== 'string') continue
      const entry = (packageText[ja[field]] ??= { en: en[field] ?? '', sources: [] })
      entry.sources.push(`${pkg}/${relative(join(ROOT, pkg), path).replace(/\\/g, '/')}#${field}`)
    }
  }
}

const release = JSON.parse(readFileSync(join(DSH, 'desktop-runtime.json'), 'utf8')).release
mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, `${JSON.stringify({ dshVersion: release.version, ui, packageText }, null, 1)}\n`)
const keys = Object.values(ui).reduce((sum, entry) => sum + Object.keys(entry).length, 0)
console.log(`DSH ${release.version}: ${Object.keys(ui).length} namespaces, ${keys} keys, ${Object.keys(packageText).length} package texts → ${relative(process.cwd(), OUT)}`)
for (const problem of problems) console.warn(`warning: ${problem}`)
