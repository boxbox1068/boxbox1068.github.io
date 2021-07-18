'use strict';
class DrillPhrase {
  constructor(template, lang) {
    this._template = `${template}`;
    this._lang = `${lang}`;
    this._resetCount = 0;
    this.reset();
  }
  reset(pathIdSeed) {
    if (pathIdSeed < 0 || 1 <= pathIdSeed) {
      pathIdSeed = Math.random();
    };
    const _replaceVariableTags = (template, replacer) => {
      template = template.replace(/(?!<\/?v[01-9]>)<.*?>/g, '');
      template = template.replace(/<v0>([^<]*)<\/v0>/ig, (match, p1, offset, string) => {
        const options = p1.split('|');
        const index = Math.floor(options.length * Math.random());
        return options[index];
      });
      while (true) {
        const lastTemplate = template;
        template = template.replace(/<v([1-9])>([^<]*)<\/v\1>/i, (match, p1, p2, offset, string) => {
          const variableNumber = Number(p1);
          const optionTexts  = p2.split('|');
          for (let i = 1; i < optionTexts.length; i++) {
            if (optionTexts[i] == '-') {
              optionTexts[i] = optionTexts[i - 1];
            }
          }
          const firstVariablePartOffset = string.match(/^.*?(?=<v[1-9]>)/i)[0].length;
          const isTopLevelVariable = firstVariablePartOffset == offset;
          return replacer(variableNumber, optionTexts, isTopLevelVariable) || '';
        });
        if (template == lastTemplate) {
          break;
        }
      }
      template = template.replace(/<\/?v[01-9]>/ig, '');
      return template;
    };
    const optionCounts = [];
    _replaceVariableTags(this._template, (variableNumber, optionTexts) => {
      const optionCount = optionTexts.length;
      if (optionCount < (optionCounts[variableNumber] || Infinity)) {
        optionCounts[variableNumber] = optionCount;
      }
    });
    let possiblePathCount = 1;
    for (let optionCount of optionCounts) {
      possiblePathCount *= optionCount || 1;
    }
    const pathId = Math.ceil(possiblePathCount * pathIdSeed);
    let temporaryPathId = pathId;
    const chosenOptionIds = [];
    for (let optionCount of optionCounts) {
      if (optionCount) {
        const chosenOptionId = (temporaryPathId - 1) % optionCount;
        chosenOptionIds.push(chosenOptionId);
        temporaryPathId = Math.ceil(temporaryPathId / optionCount);
      } else {
        chosenOptionIds.push(undefined);
      }
    }
    const chosenOptionTexts = [];
    const phraseHtml = _replaceVariableTags(this._template, (variableNumber, optionTexts, isTopLevelVariable) => {
      const chosenOptionId = chosenOptionIds[variableNumber];
      const chosenOptionText = optionTexts[chosenOptionId];
      if (chosenOptionText && isTopLevelVariable) {
        const existingText = chosenOptionTexts[variableNumber];
        chosenOptionTexts[variableNumber] = (existingText ? existingText + ' ~ ' : '') + chosenOptionText;
        return `<span class="variable" data-variable-number="${variableNumber}">${chosenOptionText}</span>`;
      } else {
        return chosenOptionText;
      }
    });
    this._optionCounts = optionCounts;
    this._possiblePathCount = possiblePathCount;
    this._pathId = pathId;
    this._chosenOptionTexts = chosenOptionTexts;
    this._html = phraseHtml;
    this._resetCount++;
  }
  get optionCounts() {
    return this._optionCounts;
  }
  get possiblePathCount() {
    return this._possiblePathCount;
  }
  get pathId() {
    return this._pathId;
  }
  get chosenOptionTexts() {
    return this._chosenOptionTexts;
  }
  get text() {
    return this._html.replace(/<.*?>/g, '');
  }
  get html() {
    return this._html;
  }
  get lang() {
    return this._lang;
  }
  get resetCount() {
    return this._resetCount;
  }
}
