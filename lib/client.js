/**
 * dsh-locale-ko — Client half: the Korean language and its page on the Plugins page.
 *
 * Korean enters through the public locale API: `addLanguage` for the selectable language and
 * `register(ns, 'ko', dict)` for every namespace. The dictionaries live in a package-local chunk
 * fetched only while the switch on this bundle's Plugins page is on; switching it off withdraws
 * every registration. Package titles and descriptions are LocalizedText maps that never consult
 * dictionaries, so while the pack is on `resolveText` answers Korean for the Japanese entry those
 * maps carry. The page's controls are this plugin's own, with the host's switch markup and tokens
 * copied in: Harness Client packages are not loaded as modules.
 */
window.__ModuleLoader__.load({
  id: 'dsh-locale-ko',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const NS = 'langKorean'
    const ENTRY = 'locale-ko'
    const KO = 'ko'

    /** One switch per pack, rendered in this order. */
    const PACKS = [
      { field: 'dsh', default: true, load: () => require.async('./client.dsh-ko.js') },
    ]

    const en = {
      'summary': 'Korean for the DeepSeek Harness interface.',
      'pack.dsh': 'DeepSeek Harness Korean',
      'pack.dsh.hint': 'The interface copy and built-in plugin titles and descriptions. When off, they return to the language selected in General.',
      'state.loading': 'Loading the dictionaries…',
      'state.failed': 'The dictionaries could not be loaded: {message}',
      'language.inactive': 'Korean is available, but another display language is selected.',
      'language.activate': 'Switch to Korean',
      'saveFailed': 'This value was not accepted.',
      'loading': 'Loading…',
      'unavailable': 'These settings are unavailable. Check that the plugin is on in Plugins.',
      'readOnly': 'Read only: a higher configuration layer sets these values.',
      'renderFailed': 'This page could not be displayed:',
    }
    const zh = {
      'summary': 'DeepSeek Harness 界面的韩语翻译。',
      'pack.dsh': 'DeepSeek Harness 韩语',
      'pack.dsh.hint': '界面文案以及内置插件的名称和说明。关闭后恢复为“通用”中选择的语言。',
      'state.loading': '正在加载词典…',
      'state.failed': '无法加载词典：{message}',
      'language.inactive': '韩语已可用，但当前选择的是其他显示语言。',
      'language.activate': '切换到韩语',
      'saveFailed': '该值未被接受。',
      'loading': '加载中…',
      'unavailable': '无法读取这些设置。请确认插件页面中已启用该插件。',
      'readOnly': '只读：这些值由更高的配置层设置。',
      'renderFailed': '无法显示此页面：',
    }
    const ko = {
      'summary': 'DeepSeek Harness 화면을 한국어로 표시합니다.',
      'pack.dsh': 'DeepSeek Harness 한글화',
      'pack.dsh.hint': '화면 문구와 내장 플러그인 이름·설명을 한국어로 표시합니다. 끄면 일반 설정에서 고른 언어로 돌아갑니다.',
      'state.loading': '사전을 불러오는 중…',
      'state.failed': '사전을 불러오지 못했습니다: {message}',
      'language.inactive': '한국어를 쓸 수 있지만 다른 표시 언어가 선택되어 있습니다.',
      'language.activate': '한국어로 전환',
      'saveFailed': '이 값이 반영되지 않았습니다.',
      'loading': '불러오는 중…',
      'unavailable': '설정을 읽을 수 없습니다. 플러그인 페이지에서 이 플러그인이 켜져 있는지 확인하세요.',
      'readOnly': '읽기 전용: 상위 설정 계층이 이 값을 정합니다.',
      'renderFailed': '이 페이지를 표시하지 못했습니다:',
    }

    const CSS = `
.lk-page{min-width:0;color:var(--dsw-alias-label-primary)}
.lk-row{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:12px 0;border-bottom:.5px solid var(--dsw-alias-border-l2)}
.lk-row-text{min-width:0;flex:1}
.lk-label{display:block;font-size:14px;line-height:22px}
.lk-hint{margin:2px 0 0;font-size:12px;line-height:1.5;color:var(--dsw-alias-label-tertiary)}
.lk-error{margin:4px 0 0;font-size:12px;line-height:1.5;color:var(--dsw-alias-state-error-primary)}
.lk-switch{box-sizing:border-box;position:relative;flex:0 0 auto;width:36px;height:20px;margin-top:1px;padding:2px;border:0;border-radius:999px;background:var(--dsw-alias-border-l3);cursor:pointer}
.lk-switch[aria-checked=true]{background:var(--dsw-alias-brand-primary)}
.lk-switch:disabled{cursor:default;opacity:.5}
.lk-switch:focus-visible,.lk-button:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}
.lk-thumb{display:block;width:16px;height:16px;border-radius:50%;background:var(--dsw-alias-label-primary-foreground);transition:transform .12s ease}
.lk-switch[aria-checked=false] .lk-thumb{background:var(--dsw-alias-switch-thumb)}
.lk-switch[aria-checked=true] .lk-thumb{transform:translate(16px)}
.lk-notice{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:12px 0 0;padding:10px 12px;border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-module-platform);font-size:13px;line-height:1.5}
.lk-button{appearance:none;flex:0 0 auto;border:0;border-radius:var(--dsw-radius-md);padding:4px 12px;background:var(--dsw-alias-brand-primary);font:inherit;font-size:13px;line-height:1.5;color:var(--dsw-alias-label-primary-foreground);cursor:pointer}
`

    const isKorean = (id) => typeof id === 'string' && id.toLowerCase() === KO

    /**
     * Applies the packs the settings document asks for. Only a change of a pack's effective state
     * acts, so a chunk that failed to load is retried by switching it off and on, not on every
     * settings update.
     */
    function createController(locale, source) {
      const states = {}
      const desired = {}
      const generation = {}
      const held = new Map()
      const listeners = new Set()
      let version = 0
      let language
      let patched
      let activateWhenReady = false
      let disposed = false

      const switchedOn = (pack, value) => {
        const saved = value?.[pack.field]
        return typeof saved === 'boolean' ? saved : pack.default === true
      }

      const notify = () => {
        version++
        for (const listener of [...listeners]) listener()
      }
      const setState = (field, state) => {
        states[field] = state
        notify()
      }

      /** Holds the Korean definition while a pack is on, unless another plugin already provides it. */
      const syncLanguage = () => {
        const wanted = held.size > 0
        if (wanted && language === undefined && !locale.getSnapshot().locales.some((l) => isKorean(l.id))) {
          language = locale.addLanguage({ id: KO, label: '한국어', fallback: 'en' })
        } else if (!wanted && language !== undefined) {
          const dispose = language
          language = undefined
          dispose()
        }
      }

      const syncResolveText = () => {
        const wanted = [...held.values()].some((entry) => entry.packageText !== undefined)
        if (wanted && patched === undefined) {
          const proto = Object.getPrototypeOf(locale)
          const original = proto.resolveText
          const replacement = function resolveText(text) {
            if (text !== null && typeof text === 'object' && text.ko === undefined && typeof text.ja === 'string' && isKorean(this.getSnapshot().active)) {
              for (const entry of held.values()) {
                const translated = entry.packageText?.[text.ja]
                if (translated !== undefined) return translated
              }
            }
            return original.call(this, text)
          }
          proto.resolveText = replacement
          patched = { proto, original, replacement }
        } else if (!wanted && patched !== undefined) {
          if (patched.proto.resolveText === patched.replacement) patched.proto.resolveText = patched.original
          patched = undefined
        }
      }

      const syncAll = () => {
        syncLanguage()
        syncResolveText()
      }

      async function turnOn(pack) {
        const run = (generation[pack.field] = (generation[pack.field] ?? 0) + 1)
        setState(pack.field, { kind: 'loading' })
        let data
        try {
          data = await pack.load()
        } catch (error) {
          if (!disposed && generation[pack.field] === run) setState(pack.field, { kind: 'failed', error })
          return
        }
        if (disposed || generation[pack.field] !== run) return
        // Dictionaries first, so a stored Korean preference never resolves before its copy exists.
        const disposers = []
        try {
          for (const [ns, dict] of Object.entries(data.dictionaries ?? {})) disposers.push(locale.register(ns, KO, dict))
          held.set(pack.field, {
            packageText: data.packageText,
            dispose: () => {
              for (const dispose of disposers.reverse()) dispose()
            },
          })
          syncAll()
        } catch (error) {
          held.delete(pack.field)
          for (const dispose of disposers.reverse()) dispose()
          syncAll()
          setState(pack.field, { kind: 'failed', error })
          return
        }
        setState(pack.field, { kind: 'on' })
        if (activateWhenReady) {
          activateWhenReady = false
          if (!isKorean(locale.getSnapshot().active)) locale.setLocale(KO)
        }
      }

      function turnOff(pack) {
        generation[pack.field] = (generation[pack.field] ?? 0) + 1
        const entry = held.get(pack.field)
        held.delete(pack.field)
        entry?.dispose()
        syncAll()
        setState(pack.field, { kind: 'off' })
      }

      const reconcile = () => {
        const snapshot = source.getSnapshot()
        if (disposed || snapshot.status !== 'ready') return
        for (const pack of PACKS) {
          const want = switchedOn(pack, snapshot.value)
          if (desired[pack.field] === want) continue
          desired[pack.field] = want
          if (want) turnOn(pack)
          else turnOff(pack)
        }
      }

      return {
        start() {
          const stopSource = source.subscribe(reconcile)
          // Another plugin's Korean definition may unload while a pack is on; take it over then.
          const stopLocale = locale.subscribe(() => {
            if (!disposed) syncLanguage()
          })
          reconcile()
          return () => {
            disposed = true
            stopSource()
            stopLocale()
            for (const entry of held.values()) entry.dispose()
            held.clear()
            syncAll()
          }
        },
        subscribe(listener) {
          listeners.add(listener)
          return () => listeners.delete(listener)
        },
        getVersion: () => version,
        switchedOn,
        state: (field) => states[field] ?? { kind: 'off' },
        anyOn: () => held.size > 0,
        requestActivation(value) {
          activateWhenReady = value
        },
      }
    }

    function Switch({ checked, disabled, label, onChange }) {
      return h('button', {
        type: 'button',
        role: 'switch',
        'aria-checked': checked,
        'aria-label': label,
        disabled,
        className: 'lk-switch',
        onClick: () => onChange(!checked),
      }, h('span', { className: 'lk-thumb' }))
    }

    function Row({ label, hint, error, children }) {
      return h('div', { className: 'lk-row' },
        h('div', { className: 'lk-row-text' },
          h('span', { className: 'lk-label' }, label),
          hint ? h('p', { className: 'lk-hint' }, hint) : null,
          error ? h('p', { className: 'lk-error', role: 'alert' }, error) : null),
        children)
    }

    function Panel({ form, controller, locale, t }) {
      const snapshot = React.useSyncExternalStore(form.subscribe, form.getSnapshot)
      React.useSyncExternalStore(controller.subscribe, controller.getVersion)
      const active = React.useSyncExternalStore(locale.subscribe, () => locale.getSnapshot().active)
      const [busy, setBusy] = React.useState(false)
      const [errors, setErrors] = React.useState({})
      const page = 'lk-page'
      if (snapshot.status !== 'ready') {
        return h('div', { className: page }, h('p', { className: 'lk-hint' }, t(snapshot.status === 'loading' ? 'loading' : 'unavailable')))
      }
      const write = async (field, value) => {
        setBusy(true)
        setErrors((current) => ({ ...current, [field]: undefined }))
        // Switching a pack on is a request to read Korean, so it also selects the language.
        controller.requestActivation(value === true)
        let accepted = false
        try {
          accepted = await form.set(field, value)
        } catch {
          accepted = false
        }
        setBusy(false)
        if (!accepted) {
          controller.requestActivation(false)
          setErrors((current) => ({ ...current, [field]: t('saveFailed') }))
        }
      }
      const locked = !snapshot.writable || busy
      const status = (field) => {
        const state = controller.state(field)
        if (state.kind === 'loading') return t('state.loading')
        if (state.kind === 'failed') return t('state.failed', { message: String(state.error?.message ?? state.error) })
        return undefined
      }
      return h('div', { className: page },
        h('style', null, CSS),
        PACKS.map((pack) => h(Row, {
          key: pack.field,
          label: t(`pack.${pack.field}`),
          hint: t(`pack.${pack.field}.hint`),
          error: errors[pack.field] ?? status(pack.field),
        }, h(Switch, {
          checked: controller.switchedOn(pack, snapshot.value),
          disabled: locked,
          label: t(`pack.${pack.field}`),
          onChange: (value) => write(pack.field, value),
        }))),
        controller.anyOn() && !isKorean(active)
          ? h('div', { className: 'lk-notice', role: 'status' },
            h('span', null, t('language.inactive')),
            h('button', { type: 'button', className: 'lk-button', onClick: () => locale.setLocale(KO) }, t('language.activate')))
          : null,
        snapshot.writable ? null : h('p', { className: 'lk-hint' }, t('readOnly')))
    }

    /** A failure stays readable on the page; an uncaught throw would blank the slot entry. */
    class Guard extends React.Component {
      constructor(props) {
        super(props)
        this.state = { error: null }
      }

      static getDerivedStateFromError(error) {
        return { error }
      }

      render() {
        if (this.state.error === null) return this.props.children
        return h('p', { className: 'lk-error', role: 'alert' }, `${this.props.t('renderFailed')} ${String(this.state.error?.message ?? this.state.error)}`)
      }
    }

    return {
      inject: ['slots', 'locale', 'configForms'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { en, zh, ko }), 'dsh-locale-ko: page dictionary')
        const t = ctx.locale.bind(NS)
        // Service objects are class instances whose methods read `this`; hooks detach them.
        const runtime = ctx.locale
        const locale = {
          subscribe: (listener) => runtime.subscribe(listener),
          getSnapshot: () => runtime.getSnapshot(),
          setLocale: (id) => runtime.setLocale(id),
        }
        const source = ctx.configForms.get(ENTRY)
        const form = {
          subscribe: (listener) => source.subscribe(listener),
          getSnapshot: () => source.getSnapshot(),
          set: (field, value) => source.set(field, value),
        }
        const controller = createController(runtime, form)
        ctx.effect(() => controller.start(), 'dsh-locale-ko: packs')
        ctx.slots.inject('plugins.bundle.config', () => ctx.slots.register({
          name: 'plugins.bundle.config',
          key: 'dsh-locale-ko',
          locale: NS,
        }, ({ view }) => (view === 'summary' ? t('summary') : h(Guard, { t }, h(Panel, { form, controller, locale, t })))))
      },
    }
  },
})
