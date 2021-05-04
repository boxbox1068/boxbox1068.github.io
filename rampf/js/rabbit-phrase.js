export class RabbitPhrase {
  constructor(template, pathIdSeed) {
    if (typeof template != 'string') template = '';
    if (! (0 <= pathIdSeed && pathIdSeed < 1)) pathIdSeed = Math.random();
    const replaceNodeParts = (template, callback) => {
      const pattern = /(\^*)\[([^[]*?)\]/;
      const replacer = (match, p1, p2, offset, string) => {
        const nodeLevel = p1.length;
        const nodes  = p2.split('|');
        const firstNodePartOffset = string.indexOf('[') - nodeLevel;
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
    let possiblePathCount = 1;
    for (let nodeCount of nodeCounts) {
      possiblePathCount *= nodeCount || 1;
    }
    const pathId = Math.ceil(possiblePathCount * pathIdSeed);
    let tempPathId = pathId;
    const validNodeIds = [];
    for (let nodeCount of nodeCounts) {
      if (nodeCount) {
        const validNodeId = tempPathId % nodeCount;
        validNodeIds.push(validNodeId);
        tempPathId = Math.ceil(tempPathId / nodeCount);
      } else {
        validNodeIds.push(undefined);
      }
    }
    const validNodes = [];
    const text = replaceNodeParts(template, (nodeLevel, nodes, isMainNode) => {
      const validNodeId = validNodeIds[nodeLevel];
      const validNode = nodes[validNodeId];
      if (isMainNode) {
        const existingValidNode = validNodes[nodeLevel];
        validNodes[nodeLevel] = (existingValidNode ? existingValidNode + '/' : '') + validNode;
      }
      return validNode;
    });
    const htmlTemplate = template.replace(/ /g, '&nbsp;');
    const html = replaceNodeParts(htmlTemplate, (nodeLevel, nodes, isMainNode) => {
      const validNodeId = validNodeIds[nodeLevel];
      const validNode = nodes[validNodeId];
      return `<span class="node" data-node-level="${nodeLevel}">${validNode}</span>`;
    });
    this._possiblePathCount = possiblePathCount;
    this._pathId = pathId;
    this._validNodes = validNodes;
    this._text = text;
    this._html = html;
  }
  get possiblePathCount() {
    return this._possiblePathCount;
  }
  get pathId() {
    return this._pathId;
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