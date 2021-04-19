class RabbitPhrase {
  constructor({src, variables, seed} = {}) {
    src = typeof src == 'string' ? src : '';
    variables = typeof variables == 'object' ? variables : {};
    seed = Number.isInteger(seed) && seed != 0 ? seed : Math.floor(88675123 * Math.random()) + 1;
    for (const name in variables) {
      src = src.replace(new RegExp(`%${name}%`, 'ig'), variables[name]);
    }
    this._src = src;
    this._seed = seed;
    this._parsePhrase();
  }
  alternate() {
    this._seed = this._xorshift(this._seed, 1);
    this._parsePhrase();
  }
  _xorshift(seed, count) {
    let x = 123456789;
    let y = 362436069;
    let z = 521288629;
    let w = seed;
    for (let i = 0; i < count; i++) {
      let t = x ^ (x << 11);
      x = y;
      y = z;
      z = w;
      w = (w ^ (w >>> 19)) ^ (t ^ (t >>> 8)); 
    }
    return Math.abs(w);
  }
  _parsePhrase() {
    this._branchItems = [];
    let text = '';
    let html = '';
    let totalPatterns = 1;
    this._src.replace(/(.*?)(\^+)\{((\\}|.)*?)\}|(.*)/g, (match, p1, p2, p3, p4, p5, offset, string) => {
      if (p5 === undefined) {
        const branchNumber = p2.length - 1;
        const items = p3.split('|');
        const index = this._xorshift(this._seed, branchNumber) % items.length;
        const branchItem = items[index];
        this._branchItems[branchNumber] = branchItem;
        text += `${p1}${branchItem}`;
        html += `${p1}<span class="branch" id="branch_${branchNumber}">${branchItem}</span>`;
        totalPatterns *= items.length;
      } else {
        text += p5;
        html += p5;
      }
    });
    this._text = text;
    this._html = html;
    this._totalPatterns = totalPatterns;
  }
  get src() {
    return this._src;
  }
  get seed() {
    return this._seed;
  }
  get branchItems() {
    return this._branchItems;
  }
  get text() {
    return this._text;
  }
  get html() {
    return this._html;
  }
  get totalPatterns() {
    return this._totalPatterns;
  }
}
