/**
 * dsh-lang-korean — Host half.
 *
 * Owns the `lang-korean` settings namespace: one switch per translation pack. The Client half reads
 * it through `configForms` and registers or withdraws the Korean dictionaries; nothing model-facing
 * is registered.
 */

import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'

// A local directory installed as a link lies outside the profile's module routing, so a failed bare
// import resolves from the running Host's own entry file instead.
async function load(specifier) {
  try {
    return await import(specifier)
  } catch (error) {
    if (error?.code !== 'ERR_MODULE_NOT_FOUND' || !process.argv[1]) throw error
    return import(pathToFileURL(createRequire(process.argv[1]).resolve(specifier)).href)
  }
}

const z = (await load('@deepseek-ai/schemastery')).default

export const name = 'lang-korean'

/**
 * Volatile fields are switched on this bundle's Plugins page and apply without a remount. A plugin
 * pack has no default: unset, it follows whether that plugin's bundle is on; once switched, the
 * saved choice holds.
 */
export const Config = z.object({
  dsh: z.boolean().default(true).description('Show the DeepSeek Harness interface and built-in plugin titles in Korean.').volatile(),
  sessionDelete: z.boolean().description('Show better-dsh-session-deletetool in Korean; unset follows whether it is on.').volatile(),
  claudeStyle: z.boolean().description('Show the dsh-claude-style theme in Korean; unset follows whether it is on.').volatile(),
  skillsManager: z.boolean().description('Show dsh-skills-manager in Korean; unset follows whether it is on.').volatile(),
})

export function apply(ctx) {
  // The Client half ships its own page, so a client building pages from the schema should not.
  ctx.inject(['settings'], (child) => {
    child.effect(() => child.settings.configure({ auto: false }, ctx.fiber))
  })
}
