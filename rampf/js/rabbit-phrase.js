export class RabbitPhrase {
  constructor(template, patternIdSeed) {
    if (typeof template != 'string') template = '';
    if (! (0 <= patternIdSeed && patternIdSeed < 1)) patternIdSeed = Math.random();
    const replaceNodeParts = (template, callback) => {
      const pattern = /(\^+)\[([^^]*?)\]/;
      const replacer = (match, p1, p2, offset, string) => {
        const nodeLevel = p1.length;
        const nodes  = p2.split('|');
        const firstNodePartOffset = string.indexOf('^');
        const isMainNode = firstNodePartOffset == offset;
        return callback(nodeLevel, nodes, isMainNode) || '';
      };
      while (template != (template = template.replace(pattern, replacer)));
      return template;
    };
    const nodeCounts = [];
    replaceNodeParts(template, (nodeLevel, nodes, isMainNode) => {
      const nodeCount = nodes.length;
      const existingNodeCount = nodeCounts[nodeLevel] || Infinity;
      nodeCounts[nodeLevel] = Math.min(nodeCount, existingNodeCount);
    });
    let possiblePatternCount = 1;
    for (let nodeCount of nodeCounts) {
      possiblePatternCount *= nodeCount || 1;
    }
    const patternId = Math.ceil(possiblePatternCount * patternIdSeed);
    let tempPatternId = patternId;
    const validNodeIds = [];
    for (let nodeCount of nodeCounts) {
      if (nodeCount) {
        const validNodeId = tempPatternId % nodeCount;
        validNodeIds.push(validNodeId);
        tempPatternId = Math.ceil(tempPatternId / nodeCount);
      } else {
        validNodeIds.push(undefined);
      }
    }
    const validNodes = [];
    const text = replaceNodeParts(template, (nodeLevel, nodes, isMainNode) => {
      const validNodeId = validNodeIds[nodeLevel];
      const validNode = nodes[validNodeId];
      if (isMainNode && validNode) {
        const existingValidNode = validNodes[nodeLevel];
        validNodes[nodeLevel] = (existingValidNode ? existingValidNode + ' ~ ' : '') + validNode;
      }
      return validNode;
    });
    const htmlTemplate = template.replace(/ /g, '&nbsp;');
    const html = replaceNodeParts(htmlTemplate, (nodeLevel, nodes, isMainNode) => {
      const validNodeId = validNodeIds[nodeLevel];
      const validNode = nodes[validNodeId];
      if (validNode && isMainNode) {
        return `<span class="node" data-node-level="${nodeLevel}">${validNode}</span>`;
      } else {
        return validNode;
      }
    });
    this._possiblePatternCount = possiblePatternCount;
    this._patternId = patternId;
    this._validNodes = validNodes;
    this._text = text;
    this._html = html;
  }
  get possiblePatternCount() {
    return this._possiblePatternCount;
  }
  get patternId() {
    return this._patternId;
  }
  get validNodes() {
    return this._validNodes;
  }
  get text() {
    return this._text;
  }
  get html() {
    return this._html;
  }
}