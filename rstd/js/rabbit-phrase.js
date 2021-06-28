
'use strict';
class RabbitPhrase {
  constructor(template, lang) {
    this._template = `${template}`;
    this._lang = `${lang}`;
    this._resetCount = 0;
  }
  reset(pathIdSeed) {
    0 <= pathIdSeed && pathIdSeed < 1 || (pathIdSeed = Math.random());
    const replaceVariableParts = (template, callback) => {
      const path = /(\^+)\[([^^]*?)\]/;
      const replacer = (match, p1, p2, offset, string) => {
        const variableNumber = p1.length;
        const variableTexts  = p2.split('|');
        for (let i = 1; i < variableTexts.length; i++) {
          if (variableTexts[i] == '-') {
            variableTexts[i] = variableTexts[i - 1];
          }
        }
        const firstVariablePartOffset = string.indexOf('^');
        const isMainVariable = firstVariablePartOffset == offset;
        return callback(variableNumber, variableTexts, isMainVariable) || '';
      };
      while (template != (template = template.replace(path, replacer)));
      return template;
    };
    const variableCounts = [];
    replaceVariableParts(this._template, (variableNumber, variableTexts, isMainVariable) => {
      const variableCount = variableTexts.length;
      const existingVariableCount = variableCounts[variableNumber] || Infinity;
      variableCounts[variableNumber] = Math.min(variableCount, existingVariableCount);
    });
    let possiblePathCount = 1;
    for (let variableCount of variableCounts) {
      possiblePathCount *= variableCount || 1;
    }
    const pathId = Math.ceil(possiblePathCount * pathIdSeed);
    let tempPathId = pathId;
    const chosenVariableIds = [];
    for (let variableCount of variableCounts) {
      if (variableCount) {
        const chosenVariableId = tempPathId % variableCount;
        chosenVariableIds.push(chosenVariableId);
        tempPathId = Math.ceil(tempPathId / variableCount);
      } else {
        chosenVariableIds.push(undefined);
      }
    }
    const chosenVariableTexts = [];
    const text = replaceVariableParts(this._template, (variableNumber, variableTexts, isMainVariable) => {
      const chosenVariableId = chosenVariableIds[variableNumber];
      const chosenVariable = variableTexts[chosenVariableId];
      if (isMainVariable && chosenVariable) {
        const existingValidVariable = chosenVariableTexts[variableNumber];
        chosenVariableTexts[variableNumber] = (existingValidVariable ? existingValidVariable + ' ~ ' : '') + chosenVariable;
      }
      return chosenVariable;
    });
    const htmlTemplate = this._template;
    const html = replaceVariableParts(htmlTemplate, (variableNumber, variableTexts, isMainVariable) => {
      const chosenVariableId = chosenVariableIds[variableNumber];
      const chosenVariable = variableTexts[chosenVariableId];
      if (chosenVariable && isMainVariable) {
        return `<a class="variable" data-variable-number="${variableNumber}">${chosenVariable}</a>`;
      } else {
        return chosenVariable;
      }
    });
    this._possiblePathCount = possiblePathCount;
    this._pathId = pathId;
    this._chosenVariableTexts = chosenVariableTexts;
    this._text = text;
    this._html = html;
    this._resetCount++;
  }
  get possiblePathCount() {
    return this._possiblePathCount;
  }
  get pathId() {
    return this._pathId;
  }
  get chosenVariableTexts() {
    return this._chosenVariableTexts;
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



/*
'use strict';
class RabbitPhrase {
  constructor(this._template, pathIdSeed) {
    if (typeof this._template != 'string') this._template = '';
    if (! (0 <= pathIdSeed && pathIdSeed < 1)) pathIdSeed = Math.random();
    const replaceVariableParts = (this._template, callback) => {
      const path = /(\^+)\[([^^]*?)\]/;
      const replacer = (match, p1, p2, offset, string) => {
        const variableNumber = p1.length;
        const variableTexts  = p2.split('|');
        for (let i = 1; i < variableTexts.length; i++) {
          if (variableTexts[i] == '-') {
            variableTexts[i] = variableTexts[i - 1];
          }
        }
        const firstVariablePartOffset = string.indexOf('^');
        const isMainVariable = firstVariablePartOffset == offset;
        return callback(variableNumber, variableTexts, isMainVariable) || '';
      };
      while (this._template != (this._template = this._template.replace(path, replacer)));
      return this._template;
    };
    const variableCounts = [];
    replaceVariableParts(this._template, (variableNumber, variableTexts, isMainVariable) => {
      const variableCount = variableTexts.length;
      const existingVariableCount = variableCounts[variableNumber] || Infinity;
      variableCounts[variableNumber] = Math.min(variableCount, existingVariableCount);
    });
    let possiblePathCount = 1;
    for (let variableCount of variableCounts) {
      possiblePathCount *= variableCount || 1;
    }
    const pathId = Math.ceil(possiblePathCount * pathIdSeed);
    let tempPathId = pathId;
    const chosenVariableIds = [];
    for (let variableCount of variableCounts) {
      if (variableCount) {
        const chosenVariableId = tempPathId % variableCount;
        chosenVariableIds.push(chosenVariableId);
        tempPathId = Math.ceil(tempPathId / variableCount);
      } else {
        chosenVariableIds.push(undefined);
      }
    }
    const chosenVariableTexts = [];
    const text = replaceVariableParts(this._template, (variableNumber, variableTexts, isMainVariable) => {
      const chosenVariableId = chosenVariableIds[variableNumber];
      const chosenVariable = variableTexts[chosenVariableId];
      if (isMainVariable && chosenVariable) {
        const existingValidVariable = chosenVariableTexts[variableNumber];
        chosenVariableTexts[variableNumber] = (existingValidVariable ? existingValidVariable + ' ~ ' : '') + chosenVariable;
      }
      return chosenVariable;
    });
    const htmlTemplate = this._template;
    const html = replaceVariableParts(htmlTemplate, (variableNumber, variableTexts, isMainVariable) => {
      const chosenVariableId = chosenVariableIds[variableNumber];
      const chosenVariable = variableTexts[chosenVariableId];
      if (chosenVariable && isMainVariable) {
        return `<a class="variable" data-variable-number="${variableNumber}">${chosenVariable}</a>`;
      } else {
        return chosenVariable;
      }
    });
    this._possiblePathCount = possiblePathCount;
    this._pathId = pathId;
    this._chosenVariableTexts = chosenVariableTexts;
    this._text = text;
    this._html = html;
  }
  reset(pathIdSeed) {

  }
  get possiblePathCount() {
    return this._possiblePathCount;
  }
  get pathId() {
    return this._pathId;
  }
  get chosenVariableTexts() {
    return this._chosenVariableTexts;
  }
  get text() {
    return this._text;
  }
  get html() {
    return this._html;
  }
}
*/
