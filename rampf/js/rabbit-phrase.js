export class RabbitPhrase {
  constructor(template, pathIdSeed) {
    if (typeof template != 'string') template = '';
    if (! (0 <= pathIdSeed && pathIdSeed < 1)) pathIdSeed = Math.random();
    const replaceBranchParts = (template, callback) => {
      const path = /(\^+)\[([^^]*?)\]/;
      const replacer = (match, p1, p2, offset, string) => {
        const branchNumber = p1.length;
        const branchTexts  = p2.split('|');
        const firstBranchPartOffset = string.indexOf('^');
        const isMainBranch = firstBranchPartOffset == offset;
        return callback(branchNumber, branchTexts, isMainBranch) || '';
      };
      while (template != (template = template.replace(path, replacer)));
      return template;
    };
    const branchCounts = [];
    replaceBranchParts(template, (branchNumber, branchTexts, isMainBranch) => {
      const branchCount = branchTexts.length;
      const existingBranchCount = branchCounts[branchNumber] || Infinity;
      branchCounts[branchNumber] = Math.min(branchCount, existingBranchCount);
    });
    let possiblePathCount = 1;
    for (let branchCount of branchCounts) {
      possiblePathCount *= branchCount || 1;
    }
    const pathId = Math.ceil(possiblePathCount * pathIdSeed);
    let tempPathId = pathId;
    const chosenBranchIds = [];
    for (let branchCount of branchCounts) {
      if (branchCount) {
        const chosenBranchId = tempPathId % branchCount;
        chosenBranchIds.push(chosenBranchId);
        tempPathId = Math.ceil(tempPathId / branchCount);
      } else {
        chosenBranchIds.push(undefined);
      }
    }
    const chosenBranchTexts = [];
    const text = replaceBranchParts(template, (branchNumber, branchTexts, isMainBranch) => {
      const chosenBranchId = chosenBranchIds[branchNumber];
      const chosenBranch = branchTexts[chosenBranchId];
      if (isMainBranch && chosenBranch) {
        const existingValidBranch = chosenBranchTexts[branchNumber];
        chosenBranchTexts[branchNumber] = (existingValidBranch ? existingValidBranch + ' ~ ' : '') + chosenBranch;
      }
      return chosenBranch;
    });
//    const htmlTemplate = template.replace(/ /g, '&nbsp;');
const htmlTemplate = template;
    const html = replaceBranchParts(htmlTemplate, (branchNumber, branchTexts, isMainBranch) => {
      const chosenBranchId = chosenBranchIds[branchNumber];
      const chosenBranch = branchTexts[chosenBranchId];
      if (chosenBranch && isMainBranch) {
        return `<span class="branch" data-branch-number="${branchNumber}">${chosenBranch}</span>`;
      } else {
        return chosenBranch;
      }
    });
    this._possiblePathCount = possiblePathCount;
    this._pathId = pathId;
    this._chosenBranchTexts = chosenBranchTexts;
    this._text = text;
    this._html = html;
  }
  get possiblePathCount() {
    return this._possiblePathCount;
  }
  get pathId() {
    return this._pathId;
  }
  get chosenBranchTexts() {
    return this._chosenBranchTexts;
  }
  get text() {
    return this._text;
  }
  get html() {
    return this._html;
  }
}