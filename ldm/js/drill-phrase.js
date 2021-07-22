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
    const _replaceOptionTags = (template, replacer) => {
      template = template.replace(/</g, '&lt;');
      template = template.replace(/>/g, '&gt;');
      while (true) {
        const lastTemplate = template;
        template = template.replace(/\[(\d):((?:(?!\[\d:).)*?)\]/, (match, p1, p2, offset, string) => {
          const optionPartNumber = Number(p1);
          const options  = p2.split(',').map(element => {
            return element.trim();
          });
          for (let i = 1; i < options.length; i++) {
            if (options[i] == '-') {
              options[i] = options[i - 1];
            }
          }
          const firstOptionPartOffset = string.match(/^.*?(?=\[\d:)/)[0].length;
          const isTopLevelOptionPart = firstOptionPartOffset == offset;
          return replacer(optionPartNumber, options, isTopLevelOptionPart) || '';
        });
        if (template == lastTemplate) {
          break;
        }
      }
      return template;
    };
    const optionCounts = [];
    _replaceOptionTags(this._template, (optionPartNumber, optionTexts) => {
      const optionCount = optionTexts.length;
      if (optionCount < (optionCounts[optionPartNumber] || Infinity)) {
        optionCounts[optionPartNumber] = optionCount;
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
    const phraseHtml = _replaceOptionTags(this._template, (optionPartNumber, optionTexts, isTopLevelOptionPart) => {
      const chosenOptionId = chosenOptionIds[optionPartNumber];
      const chosenOptionText = optionTexts[chosenOptionId];
      if (chosenOptionText && isTopLevelOptionPart) {
        const existingText = chosenOptionTexts[optionPartNumber];
        chosenOptionTexts[optionPartNumber] = (existingText ? existingText + ' ~ ' : '') + chosenOptionText;
        return `<span class="option-part" data-option-part-number="${optionPartNumber}">${chosenOptionText}</span>`;
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
