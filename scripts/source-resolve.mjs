// Static reading of built client bundles: literal resolution of locale.register(...) arguments,
// shared by the source extractors. Nothing here executes a bundle.

export function skipString(src, i) {
  const quote = src[i]
  for (i++; i < src.length && src[i] !== quote; i++) if (src[i] === '\\') i++
  return i
}

/** From the bracket at `open`, the trimmed top-level comma pieces and the closing index. */
export function scan(src, open) {
  let depth = 0
  let start = open + 1
  const parts = []
  for (let i = open; i < src.length; i++) {
    const c = src[i]
    if (c === '"' || c === "'" || c === '`') { i = skipString(src, i); continue }
    if (c === '/' && src[i + 1] === '/') { i = src.indexOf('\n', i); continue }
    if (c === '/' && src[i + 1] === '*') { i = src.indexOf('*/', i) + 1; continue }
    if (c === '(' || c === '{' || c === '[') depth++
    else if (c === ')' || c === '}' || c === ']') {
      depth--
      if (depth === 0) {
        parts.push(src.slice(start, i))
        return [parts.map((p) => p.trim()).filter(Boolean), i]
      }
    } else if (c === ',' && depth === 1) {
      parts.push(src.slice(start, i))
      start = i + 1
    }
  }
  throw new Error('unbalanced brackets')
}

/**
 * Expression of the nearest declaration of `name` before `pos`, else the first one in the file.
 * Minified bundles chain declarations, so `,name=` counts as one too.
 */
function declarationOf(src, name, pos) {
  const re = new RegExp(`(?:\\b(?:const|let|var)\\s+|,\\s*)${name.replace(/\$/g, '\\$')}\\s*=(?![=>])\\s*`, 'g')
  let found
  for (let m; (m = re.exec(src));) if (found === undefined || m.index < pos) found = m
  if (found === undefined) return undefined
  const at = found.index + found[0].length
  if ('{(['.includes(src[at])) return [src.slice(at, scan(src, at)[1] + 1), at]
  if (src[at] === '"' || src[at] === "'" || src[at] === '`') return [src.slice(at, skipString(src, at) + 1), at]
  return [src.slice(at, at + src.slice(at).search(/[;,\n})]/)).trim(), at]
}

/** Evaluate a literal expression, following identifiers, member chains, spreads and shorthands. */
export function resolve(src, expr, pos, depth = 0) {
  if (depth > 6) throw new Error(`reference chain too deep: ${expr.slice(0, 60)}`)
  try {
    return new Function(`return (${expr})`)()
  } catch (error) {
    if (!(error instanceof ReferenceError)) throw error
  }
  if (/^[\w$]+$/.test(expr)) {
    const declaration = declarationOf(src, expr, pos)
    if (declaration === undefined) throw new Error(`no declaration of ${expr}`)
    return resolve(src, declaration[0], declaration[1], depth + 1)
  }
  if (/^[\w$]+(\.[\w$]+)+$/.test(expr)) {
    const [head, ...path] = expr.split('.')
    return path.reduce((value, key) => value?.[key], resolve(src, head, pos, depth + 1))
  }
  if (expr.startsWith('{')) {
    const out = {}
    for (const part of scan(expr, 0)[0]) {
      if (part.startsWith('...')) { Object.assign(out, resolve(src, part.slice(3).trim(), pos, depth + 1)); continue }
      const colon = part[0] === '"' || part[0] === "'" ? skipString(part, 0) + 1 : part.indexOf(':')
      if (colon < 0 || colon >= part.length) { out[part] = resolve(src, part, pos, depth + 1); continue }
      const key = part.slice(0, colon).trim().replace(/^["']|["']$/g, '')
      out[key] = resolve(src, part.slice(colon).replace(/^\s*:\s*/, ''), pos, depth + 1)
    }
    return out
  }
  if (expr.startsWith('[')) return scan(expr, 0)[0].map((part) => resolve(src, part, pos, depth + 1))
  throw new Error(`cannot resolve ${expr.slice(0, 80)}`)
}

/**
 * Apply the `Object.assign(NAME.locale, …)` / `Object.assign(NAME, …)` merges a bundle runs on a
 * registered dictionary object before handing it to the registry.
 */
function withAssignedParts(src, name, value) {
  const re = new RegExp(`Object\\.assign\\(\\s*${name.replace(/\$/g, '\\$')}(\\.[\\w$]+)?\\s*,`, 'g')
  for (const m of src.matchAll(re)) {
    const [args] = scan(src, m.index + 'Object.assign'.length)
    const target = m[1] ? (value[m[1].slice(1)] ??= {}) : value
    for (const part of args.slice(1)) Object.assign(target, resolve(src, part, m.index))
  }
  return value
}

/** The locale → dictionary map one register call contributes. */
export function dictionariesOf(src, args, pos) {
  if (args.length < 3) {
    const value = resolve(src, args[1], pos)
    return /^[\w$]+$/.test(args[1]) && value !== null && typeof value === 'object' ? withAssignedParts(src, args[1], value) : value
  }
  let id
  try { id = resolve(src, args[1], pos) } catch { id = undefined }
  if (typeof id === 'string') return { [id]: resolve(src, args[2], pos) }
  // for (const [locale, dict] of LIST) disposers.push(ctx.locale.register(ns, locale, dict))
  const loop = /for\s*\(\s*const\s*\[\s*[\w$]+\s*,\s*[\w$]+\s*\]\s*of\s*([\w$.()]+?)\s*\)[^]*$/.exec(src.slice(Math.max(0, pos - 400), pos))
  if (loop === null) throw new Error('three-argument register outside a pair loop')
  const list = resolve(src, loop[1].replace(/^Object\.entries\((.*)\)$/, '$1'), pos)
  return Array.isArray(list) ? Object.fromEntries(list) : list
}

/** Every `locale.register(ns, ...)` call: `{ ns, dicts }` per call, plus readable failures. */
export function registrations(src, label) {
  const found = []
  const problems = []
  for (const m of src.matchAll(/locale\.register\(/g)) {
    try {
      const [args] = scan(src, m.index + m[0].length - 1)
      const ns = resolve(src, args[0], m.index)
      if (typeof ns !== 'string') throw new Error(`namespace is not a string: ${args[0]}`)
      found.push({ ns, dicts: dictionariesOf(src, args, m.index) })
    } catch (error) {
      problems.push(`${label}: ${src.slice(m.index, m.index + 60).replace(/\s+/g, ' ')} — ${error.message}`)
    }
  }
  return { found, problems }
}
