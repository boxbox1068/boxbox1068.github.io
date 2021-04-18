class RabbitSentence {
  constructor({src, variables, randomSeed} = {}) {
    src = typeof src == 'string' ? src : '';
    variables = typeof variables == 'object' ? variables : {};
    randomSeed = Number.isInteger(randomSeed) && randomSeed != 0 ? randomSeed : 886751;
    for (const name in variables) {
      src = src.replace(new RegExp(`%${name}%`, 'ig'), variables[name]);
    }
    this._src = src;
    this._randomSeed = randomSeed;
    this._parseSentence();
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
  _parseSentence() {
    this._branchItems = [];
    let text = '';
    let html = '';
    this._src.replace(/(.*?)(\^+)\{((\\}|.)*?)\}|(.*)/g, (match, p1, p2, p3, p4, p5, offset, string) => {
      if (p5 === undefined) {
        const branchNumber = p2.length - 1;
        const items = p3.trim().split('|');
        const index = this._xorshift(this._randomSeed, branchNumber) % items.length;
        const branchItem = items[index];
        this._branchItems[branchNumber] = branchItem;
        text += `${p1}${branchItem}`;
        html += `${p1}<span class="branch" id="branch_${branchNumber}">${branchItem}</span>`;
      } else {
        text += p5;
        html += p5;
      }
    });
    this._text = text;
    this._html = html;
  }
  get randomSeed() {
    return this._randomSeed;
  }
  get branchItems() {
    return this._branchItems;
  }
  get src() {
    return this._src;
  }
  get text() {
    return this._text;
  }
  get html() {
    return this._html;
  }
}
