
'use strict';
class RabbitPhrase {
  constructor(template, lang) {
    this._template = `${template}`;
    this._lang = `${lang}`;
  }
  reset(pathIdSeed) {
    (0 <= pathIdSeed && pathIdSeed < 1) || (pathIdSeed = Math.random());
    const replaceOptionParts = (template, callback) => {
      const path = /(\^+)\[([^^]*?)\]/;
      const replacer = (match, p1, p2, offset, string) => {
        const optionNumber = p1.length;
        const optionTexts  = p2.split('|');
        for (let i = 1; i < optionTexts.length; i++) {
          if (optionTexts[i] == '-') {
            optionTexts[i] = optionTexts[i - 1];
          }
        }
        const firstOptionPartOffset = string.indexOf('^');
        const isMainOption = firstOptionPartOffset == offset;
        return callback(optionNumber, optionTexts, isMainOption) || '';
      };
      while (template != (template = template.replace(path, replacer)));
      return template;
    };
    const optionCounts = [];
    replaceOptionParts(this._template, (optionNumber, optionTexts, isMainOption) => {
      const optionCount = optionTexts.length;
      const existingOptionCount = optionCounts[optionNumber] || Infinity;
      optionCounts[optionNumber] = Math.min(optionCount, existingOptionCount);
    });
    let possiblePathCount = 1;
    for (let optionCount of optionCounts) {
      possiblePathCount *= optionCount || 1;
    }
    const pathId = Math.ceil(possiblePathCount * pathIdSeed);
    let tempPathId = pathId;
    const chosenOptionIds = [];
    for (let optionCount of optionCounts) {
      if (optionCount) {
        const chosenOptionId = tempPathId % optionCount;
        chosenOptionIds.push(chosenOptionId);
        tempPathId = Math.ceil(tempPathId / optionCount);
      } else {
        chosenOptionIds.push(undefined);
      }
    }
    const chosenOptionTexts = [];
    const text = replaceOptionParts(this._template, (optionNumber, optionTexts, isMainOption) => {
      const chosenOptionId = chosenOptionIds[optionNumber];
      const chosenOption = optionTexts[chosenOptionId];
      if (isMainOption && chosenOption) {
        const existingValidOption = chosenOptionTexts[optionNumber];
        chosenOptionTexts[optionNumber] = (existingValidOption ? existingValidOption + ' ~ ' : '') + chosenOption;
      }
      return chosenOption;
    });
    const htmlTemplate = this._template;
    const html = replaceOptionParts(htmlTemplate, (optionNumber, optionTexts, isMainOption) => {
      const chosenOptionId = chosenOptionIds[optionNumber];
      const chosenOption = optionTexts[chosenOptionId];
      if (chosenOption && isMainOption) {
        return `<a class="option" data-option-number="${optionNumber}">${chosenOption}</a>`;
      } else {
        return chosenOption;
      }
    });
    this._possiblePathCount = possiblePathCount;
    this._pathId = pathId;
    this._chosenOptionTexts = chosenOptionTexts;
    this._text = text;
    this._html = html;
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
}



/*
'use strict';
class RabbitPhrase {
  constructor(this._template, pathIdSeed) {
    if (typeof this._template != 'string') this._template = '';
    if (! (0 <= pathIdSeed && pathIdSeed < 1)) pathIdSeed = Math.random();
    const replaceOptionParts = (this._template, callback) => {
      const path = /(\^+)\[([^^]*?)\]/;
      const replacer = (match, p1, p2, offset, string) => {
        const optionNumber = p1.length;
        const optionTexts  = p2.split('|');
        for (let i = 1; i < optionTexts.length; i++) {
          if (optionTexts[i] == '-') {
            optionTexts[i] = optionTexts[i - 1];
          }
        }
        const firstOptionPartOffset = string.indexOf('^');
        const isMainOption = firstOptionPartOffset == offset;
        return callback(optionNumber, optionTexts, isMainOption) || '';
      };
      while (this._template != (this._template = this._template.replace(path, replacer)));
      return this._template;
    };
    const optionCounts = [];
    replaceOptionParts(this._template, (optionNumber, optionTexts, isMainOption) => {
      const optionCount = optionTexts.length;
      const existingOptionCount = optionCounts[optionNumber] || Infinity;
      optionCounts[optionNumber] = Math.min(optionCount, existingOptionCount);
    });
    let possiblePathCount = 1;
    for (let optionCount of optionCounts) {
      possiblePathCount *= optionCount || 1;
    }
    const pathId = Math.ceil(possiblePathCount * pathIdSeed);
    let tempPathId = pathId;
    const chosenOptionIds = [];
    for (let optionCount of optionCounts) {
      if (optionCount) {
        const chosenOptionId = tempPathId % optionCount;
        chosenOptionIds.push(chosenOptionId);
        tempPathId = Math.ceil(tempPathId / optionCount);
      } else {
        chosenOptionIds.push(undefined);
      }
    }
    const chosenOptionTexts = [];
    const text = replaceOptionParts(this._template, (optionNumber, optionTexts, isMainOption) => {
      const chosenOptionId = chosenOptionIds[optionNumber];
      const chosenOption = optionTexts[chosenOptionId];
      if (isMainOption && chosenOption) {
        const existingValidOption = chosenOptionTexts[optionNumber];
        chosenOptionTexts[optionNumber] = (existingValidOption ? existingValidOption + ' ~ ' : '') + chosenOption;
      }
      return chosenOption;
    });
    const htmlTemplate = this._template;
    const html = replaceOptionParts(htmlTemplate, (optionNumber, optionTexts, isMainOption) => {
      const chosenOptionId = chosenOptionIds[optionNumber];
      const chosenOption = optionTexts[chosenOptionId];
      if (chosenOption && isMainOption) {
        return `<a class="option" data-option-number="${optionNumber}">${chosenOption}</a>`;
      } else {
        return chosenOption;
      }
    });
    this._possiblePathCount = possiblePathCount;
    this._pathId = pathId;
    this._chosenOptionTexts = chosenOptionTexts;
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
  get chosenOptionTexts() {
    return this._chosenOptionTexts;
  }
  get text() {
    return this._text;
  }
  get html() {
    return this._html;
  }
}
*/
