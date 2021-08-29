'use strict';
class DrillPhrase {
  constructor(template, lang) {
    template = template.replace(/</g, '&lt;');
    template = template.replace(/>/g, '&gt;');
    this._template = `${template}`;
    this._lang = `${lang}`;
    this.reset();
  }
  reset(pathIdSeed) {
    if (! (0 <= pathIdSeed && pathIdSeed < 1)) {
      pathIdSeed = Math.random();
    };
    const _replaceOptionTags = (template, replacer) => {
      while (true) {
        const lastTemplate = template;
        template = template.replace(/\[(?:(-?)(\d):)?([^\[]*?)\]/, (match, p1, p2, p3, offset, string) => {
          const isMainOptionPart = ! p1;
          const optionPartNumber = Math.max(0, Math.min(9, parseInt(p2) || 0));
          const options  = p3.split(',').map(element => {
            return element.trim();
          });
          for (let i = 1; i < options.length; i++) {
            if (options[i] == '-') {
              options[i] = options[i - 1];
            }
          }
          const firstOptionPartOffset = string.match(/^[^\[]*/)[0].length;
          const isTopLevelOptionPart = firstOptionPartOffset == offset;
          return replacer(optionPartNumber, options, isTopLevelOptionPart, isMainOptionPart) || '';
        });
        if (template == lastTemplate) {
          break;
        }
      }
      return template;
    };
    const optionCounts = [];
    _replaceOptionTags(this._template, (optionPartNumber, optionTexts) => {
      if (optionPartNumber == 0) {
        return;
      }
      const optionCount = optionTexts.length;
      const existingOptionCount = optionCounts[optionPartNumber];
      if (isNaN(existingOptionCount) || optionCount < existingOptionCount) {
        optionCounts[optionPartNumber] = optionCount;
      }
    });
    let possiblePathCount = 1;
    for (let optionCount of optionCounts) {
      possiblePathCount *= optionCount || 1;
    }
    const pathId = Math.ceil(possiblePathCount * pathIdSeed);
    let temporaryPathId = pathId;
    const selectedOptionIds = [];
    for (let optionCount of optionCounts) {
      if (optionCount) {
        const selectedOptionId = (temporaryPathId - 1) % optionCount;
        selectedOptionIds.push(selectedOptionId);
        temporaryPathId = Math.ceil(temporaryPathId / optionCount);
      } else {
        selectedOptionIds.push(undefined);
      }
    }
    const selectedOptionTexts = [];
    const phraseHtml = _replaceOptionTags(this._template, (optionPartNumber, optionTexts, isTopLevelOptionPart, isMainOptionPart) => {
      if (optionPartNumber == 0) {
        const selectedOptionId = Math.floor(optionTexts.length * Math.random());
        return optionTexts[selectedOptionId];
      }
      const selectedOptionId = selectedOptionIds[optionPartNumber];
      const selectedOptionText = optionTexts[selectedOptionId];
      if (! selectedOptionText) {
        return '';
      }
      if (isTopLevelOptionPart) {
        if (selectedOptionTexts[optionPartNumber]) {
          selectedOptionTexts[optionPartNumber] += ' ~ ';
        } else {
          selectedOptionTexts[optionPartNumber] = '';
        }
        selectedOptionTexts[optionPartNumber] += isMainOptionPart ? selectedOptionText : `(${selectedOptionText})`;
        return `<span class="option-part ${isMainOptionPart ? 'main' : 'sub'}" data-option-part-number="${optionPartNumber}">${selectedOptionText}</span>`;
      } else {
        return selectedOptionText;
      }
    });
    this._optionCounts = optionCounts;
    this._possiblePathCount = possiblePathCount;
    this._pathId = pathId;
    this._selectedOptionTexts = selectedOptionTexts;
    this._html = phraseHtml;
    this._resetCount = this._resetCount + 1 || 0;
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
  get selectedOptionTexts() {
    return this._selectedOptionTexts;
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
