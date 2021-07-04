'use strict';
class RabbitPhrase {
  constructor(template, lang) {
    this._template = `${template}`;
    this._lang = `${lang}`;
    this._resetCount = 0;
  }
  reset(pathIdSeed) {
    0 <= pathIdSeed && pathIdSeed < 1 || (pathIdSeed = Math.random());
    const _replaceVariableTags = (template, replacer) => {
      while (true) {
        const lastTemplate = template;
        template = template.replace(/(\^+)\[([^^]*?)\]/, (match, p1, p2, offset, string) => {
          const variableNumber = p1.length;
          const optionTexts  = p2.split('|');
          for (let i = 1; i < optionTexts.length; i++) {
            if (optionTexts[i] == '-') {
              optionTexts[i] = optionTexts[i - 1];
            }
          }
          const firstVariablePartOffset = string.indexOf('^');
          const isTopLevelVariable = firstVariablePartOffset == offset;
          return replacer(variableNumber, optionTexts, isTopLevelVariable) || '';
        });
        if (template == lastTemplate) {
          break;
        }
      }
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
        const chosenOptionId = temporaryPathId % optionCount;
        chosenOptionIds.push(chosenOptionId);
        temporaryPathId = Math.ceil(temporaryPathId / optionCount);
      } else {
        chosenOptionIds.push(undefined);
      }
    }
    const chosenOptionTexts = [];
    const phraseText = _replaceVariableTags(this._template, (variableNumber, optionTexts, isTopLevelVariable) => {
      const chosenOptionId = chosenOptionIds[variableNumber];
      const chosenOptionText = optionTexts[chosenOptionId];
      if (isTopLevelVariable && chosenOptionText) {
        const existingText = chosenOptionTexts[variableNumber];
        chosenOptionTexts[variableNumber] = (existingText ? existingText + ' ~ ' : '') + chosenOptionText;
      }
      return chosenOptionText;
    });
    const htmlTemplate = this._template;
    const phraseHtml = _replaceVariableTags(htmlTemplate, (variableNumber, optionTexts, isTopLevelVariable) => {
      const chosenOptionId = chosenOptionIds[variableNumber];
      const chosenOptionText = optionTexts[chosenOptionId];
      if (chosenOptionText && isTopLevelVariable) {
        return `<span class="variable" data-variable-number="${variableNumber}">${chosenOptionText}</span>`;
      } else {
        return chosenOptionText;
      }
    });
    this._possiblePathCount = possiblePathCount;
    this._pathId = pathId;
    this._chosenOptionTexts = chosenOptionTexts;
    this._text = phraseText;
    this._html = phraseHtml;
    this._resetCount++;
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
    return this._text;
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
