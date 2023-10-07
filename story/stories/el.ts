console.log('el.ts')

export abstract class El extends HTMLElement {
  private static toAny(a: any){return a};
  static els = {} as {[x: string]: El}
  static stash = {} as {[x: string]:any}
  private static tags = {} as {[x: string]: boolean}
  static keys = new WeakMap
  static styles = {} as {[x: string]:string}
  static deps = {} as {[x: string]: {[y: string]: ()=>void}}
  static Raw = class Raw extends String {}

  private static style:string;

  private _id: string;
  private static _contextId?: string;
  private _queued: boolean = false;
  private _created: boolean = false;
  
  private _cache: {
      d: {[x: string]: any};
      clear: () => {};
  }

  /**
   * to be overwritten, returning the rendered content
   * @param html 
   * @returns 
   */
  render(html: Function): any {
    return html``;
  };
  /**
   * to be overwritten, returning styles
   * @param css 
   * @returns
   */
  styles(css: Function): any{return css``};

  /**
   * to be overwritten, the create lifecycle function
   */
  created(): any {};
  /**
   * to be overwritten, the mounted lifecycle function
   */
  mounted(): any {};
  /**
   * to be overwritten, the unmounted lifecycle function
   */
  unmounted(): any{};
  
  constructor() {
    super()
    this._id = `${this.tagName}:${this.getAttribute('key') || Math.random().toString(36).slice(2)}`
    El.style = El.style || El.importStyle()
    this.$html = Object.assign(this.$html.bind(this), { raw: (x: any) => new El.Raw(x) })
    this._cache = { d: {}, clear: () => this._cache.d = {} }
    this._memoize()
    this.$update = this.$update.bind(this)
  }
  connectedCallback() {
    El._contextId = this._id
    this._unstash()
    this.created && !this._created && this.created()
    this._created = true
    El.els[this._id] = this
    this._update()
    this.mounted()
    if (El.tags[this.tagName] && !this.getAttribute('key')){
      console.warn(`Each ${this.tagName} should have a unique \`key\` attribute`)
    }
    El.tags[this.tagName] = true;
  }
  disconnectedCallback() {
    this.unmounted && this.unmounted()
  }
  _memoize() {
    const descriptors = Object.getOwnPropertyDescriptors(this.constructor.prototype)
    for (const [key, d] of Object.entries(descriptors).filter(x => x[1].get)){
      Object.defineProperty(this.constructor.prototype, key, {
        get() {
          return (key in this._cache.d) ? this._cache.d[key] : (this._cache.d[key] = (d.get as any).call(this));
        }
      });
    }
    this.constructor.prototype._memoize = new Function;
  }
  $update() {
    if(!this._queued){
      requestAnimationFrame(_ => {
        this._update();
        this._queued = false;
      });
      this._queued=true;
    }
  }
  _update() {
    El._contextId = this._id
    this._cache.clear();
    this._unstash()
    const html = this.render && this.render(this.$html);
    const shadow = this.shadowRoot || this.attachShadow({ mode: 'open' })
    El.styles[this.tagName] = El.styles[this.tagName] ||
      `<link rel="stylesheet" href="data:text/css;base64,${btoa(El.style + this.styles(El.zcss) || '')}">`
    El.morph(shadow, document.createRange().createContextualFragment(El.styles[this.tagName] + html))
    this._unstash()
    El._contextId = undefined
  }
  _unstash() {
    const camel = (s: string) => s.replace(/-\w/g, c => c[1].toUpperCase())
    const _contextId = El._contextId;
    El._contextId = this._id;
    for (const el of [...Array.from((this.shadowRoot || this).querySelectorAll('*')), this] as any[])
      for (const attr of El.toAny(el.attributes))
        if (attr.value in El.stash) el[camel(attr.name)] = El.stash[attr.value]
        else if (attr.name in el.__proto__) {}
        else try { el[camel(attr.name)] = attr.value } catch {}
    El._contextId = _contextId
  }
  get $refs(): any {
    return new Proxy({}, { get: (obj, key) => (this.shadowRoot || this).querySelector(`[ref="${key.toString()}"]`) });
  }
  $watch(_: any, fn: ()=>void) {
    if (!El.dep._path) return;
    El.deps[El.dep._path] = El.deps[El.dep._path] || {};
    El.deps[El.dep._path][Math.random()] = fn;
    El.dep._path = undefined;
  }
  $observable(a: any, b: any,c: any, d: any) {
    return El.observable(a,b,c,d);
  }
  async $nextTick() {
    return await El.nextTick();
  }
  $html(strings: string[], ...vals:any[]) {
    for (const [i] of strings.entries()) {
      if ((typeof vals[i]).match(/object|function/) && strings[i].endsWith('=')) {
        vals[i] = typeof vals[i] == 'function' ? vals[i].bind(this) : vals[i]
        const key = El.keys.get(vals[i].__target__ || vals[i]) || 'el:' + Math.random().toString(36).slice(2)
        El.keys.set(vals[i].__target__ || vals[i], key)
        El.stash[key] = vals[i]
        vals[i] = JSON.stringify(key)
      }
      else if (strings[i].endsWith('=')) vals[i] = JSON.stringify(vals[i])
      else if (vals[i] instanceof Array) vals[i] = vals[i].join('')
      else vals[i] = El.escape(vals[i])
    }
    return new El.Raw(strings.map((s, i) => [s, vals[i]].join(``)).join(``))
  }
  static importStyle() {
    let src = '';
    for (const el of Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))){
      src += el.tagName == 'STYLE' ? el.innerHTML : `\n@import url(${(el as HTMLLinkElement).href});\n`;
    }
    return src;
  }
  static notify(path: string) {
    for (const id in El.deps[path] || {}) {
      setTimeout(_ => El.deps[path][id]());
    }
  }
  static dep = Object.assign((path: string) => {
    El.dep._path = !El._contextId && path
    if (!El._contextId) return true
    const contextId = El._contextId
    El.deps[path] = El.deps[path] || {}
    return El.deps[path][El._contextId] = () => El.els[contextId].$update()
  },{ _path: undefined as any})

  static observable(x: any, path = Math.random().toString(36).slice(2), c?: any, d?: any) {
    if ((typeof x != 'object' || x === null) && El.dep(path)) return x
    return new Proxy(x, {
      set(x, key: string) {
        El.notify(path + '/' + key) 
        return Reflect.set(x,path,c,d);
      },
      get(x, key, c?: any): any {
        return x.__target__ ? x[key]
          : typeof key == "symbol" ? Reflect.get(x, key, c)
          : (key in x.constructor.prototype && El.dep(path + '/' + key)) ? x[key]
          : (key == '__target__') ? x
          : El.observable(x[key], path + '/' + key);
      }
    });
  }
  static morph(l: any, r: any) {
    let ls = 0, rs = 0, le = l.childNodes.length, re = r.childNodes.length
    const lc = [...l.childNodes], rc = [...r.childNodes]
    const content = (e: any) => e.nodeType == 3 ? e.textContent : e.nodeType == 1 ? e.outerHTML : ''
    const key = (e: any) => e.nodeType == 1 && customElements.get(e.tagName.toLowerCase()) && e.getAttribute('key') || NaN

    for (const a of El.toAny(r.attributes) || [])
      if (l.getAttribute(a.name) != a.value) {
        l.setAttribute(a.name, a.value)
        if (l.constructor.prototype.hasOwnProperty(a.name) && typeof l[a.name] == 'boolean') l[a.name] = true
        l.$update && l.$update()
      }
    for (const a of El.toAny(l.attributes) || [])
      if (!r.hasAttribute(a.name)) {
        l.removeAttribute(a.name)
        if (l.constructor.prototype.hasOwnProperty(a.name) && typeof l[a.name] == 'boolean') l[a.name] = false
      }

    while (ls < le || rs < re)
      if (ls == le) l.insertBefore(lc.find(l => key(l) == key(rc[rs])) || rc[rs], lc[ls]) && rs++
      else if (rs == re) l.removeChild(lc[ls++])
      else if (content(lc[ls]) == content(rc[rs])) ls++ & rs++
      else if (content(lc[le - 1]) == content(rc[re - 1])) le-- & re--
      else if (lc[ls] && rc[rs].children && lc[ls].tagName == rc[rs].tagName) El.morph(lc[ls++], rc[rs++])
      else lc[ls++].replaceWith(rc[rs++])
  }
  static async nextTick(f?: Function) {
    await new Promise(r => setTimeout(_ => requestAnimationFrame(_ => { f && f(); r(undefined) })))
  }
  static zcss(...args:any[]) {
    let lines: string[] = [];
    let stack: string[] = [];
    let open;
    let opened;
    let close: number|boolean = false;
    const src = args.join('').replace(/,\n/gs, ',')
    for (let line of src.split(/\n/)) {
      line = line.replace(/(.+,.+){/, ":is($1){")
      if (line.match(/^\s*@[msdk].*\{/))
        opened = open = close = (opened && !lines.push('}')) || lines.push(line) & 0
      else if (line.match(/\{\s*$/)) open = stack.push(line.replace('{','').trim()) | 1
      else if (line.match(/\s*\}\s*$/)) {
        close = ((!stack.pop() && lines.push('}'))||0) | 1;
      }else {
        if (!line.trim()) continue
        if (opened && (open)) opened = close = lines.push('}') & 0
        if (open) opened = !(open = lines.push(stack.join(` `).replace(/ &/g, '') + '{') & 0)
        lines.push(line)
      }
    }
    if(close){
      lines.push('}')
      return lines.join('\n');
    }
    return undefined;
  }
  static escape(v: any) {
    return v instanceof El.Raw ? v : v === 0 ? v : String(v || '').replace(/[<>'"]/g, c => `&#${c.charCodeAt(0)}`)
  }
}