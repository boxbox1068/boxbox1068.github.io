class RabbitPhrase {
  constructor({template, variableDictionary, combinationIdSeed} = {}) {
    if (typeof template != 'string') template = '';
    if (typeof variableDictionary != 'object') variableDictionary = {};
    if (! Number.isFinite(combinationIdSeed) || combinationIdSeed < 0 || 1 <= combinationIdSeed) combinationIdSeed = Math.random();
    for (const variableName in variableDictionary) {
      template = template.replace(new RegExp(`%${variableName}%`, 'ig'), variableDictionary[variableName]);
    }
    const nodePartRegExp = /(\^+)\[(.*?)\]/g;
    const nodeCounts = [];
    template.replace(nodePartRegExp, (match, p1, p2, offset, string) => {
      const nodeLevel = p1.length;
      const nodes  = p2.split('|');
      nodeCounts[nodeLevel] = Math.min(nodes.length, nodeCounts[nodeLevel] || Infinity);
    });
    let possibleCombinationCount = 1;
    for (let nodeLevel = 0; nodeLevel < nodeCounts.length; nodeLevel++) {
      possibleCombinationCount *= nodeCounts[nodeLevel] || 1;
    }
    const combinationId = Math.ceil(possibleCombinationCount * combinationIdSeed);
    let currentPath = combinationId;
    const nodeIds = [];
    for (let nodeLevel = 0; nodeLevel < nodeCounts.length; nodeLevel++) {
      const nodeCount = nodeCounts[nodeLevel] || 1;
      const nodeId = currentPath % nodeCount;
      nodeIds[nodeLevel] = nodeId;
      currentPath = Math.ceil(currentPath / nodeCount);
    }
    const text = template.replace(nodePartRegExp, (match, p1, p2, offset, string) => {
      const nodeLevel = p1.length;
      const nodeId = nodeIds[nodeLevel];
      const nodeContent = p2.split('|')[nodeId];
      return nodeContent;
    });
    const html = template.replace(nodePartRegExp, (match, p1, p2, offset, string) => {
      const nodeLevel = p1.length;
      const nodeId = nodeIds[nodeLevel];
      const nodeContent = p2.split('|')[nodeId];
      return `<span class="node" id="node_nodeLevel_${nodeLevel}">${nodeContent}</span>`;
    });
    this._text = text;
    this._html = html;
    this._possibleCombinationCount = possibleCombinationCount;
    this._combinationId = combinationId;
  }
  get text() {
    return this._text;
  }
  get html() {
    return this._html;
  }
  get possibleCombinationCount() {
    return this._possibleCombinationCount;
  }
  get combinationId() {
    return this._combinationId;
  }
}


const test = () => {
  const data = {};
  for (let i = 0; i < 120000; i++) {
    const rp = new RabbitPhrase({template: '^[私|私たち|あなた|たけし君]は^^[オペラ|ニンジン|散歩|いじわる|社長|飛行機旅行|LAMY]が^^^[好き|嫌い|どちらでもない]です。', combinationIdSeed: 11});
    const key = rp.text;
    data[key] = (data[key] ? data[key] : 0) + 1;
  }
  const div = document.createElement('div');
//  div.innerText = rp.combinationIdSeed;
//  document.body.append(div);
  let length = 0;
  const dl = document.createElement('dl');
  for (const key in data) {
    length++;
    const dt = document.createElement('dt');
    dt.innerText = key;
    const dd = document.createElement('dd');
    dd.innerText = data[key];
    dl.append(dt);
    dl.append(dd);
  }
  const div2 = document.createElement('div');
  div2.innerText = length;
  document.body.append(div2);
  document.body.append(dl);
}

window.addEventListener('load', test);