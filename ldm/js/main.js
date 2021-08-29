'use strict';
const homeUrl = 'https://twitter.com/shikaku1068/';
const settingDefaultValues = {
  "enable-swipe-to-right": "true", // true|false => JS
  "enable-automatic-drill-starting": "false", // true|false => JS
  "enable-option-part-highlight": "true", // true|false => CSS
  "enable-option-part-emphasis": "false", // true|false => CSS
  "enable-hint-balloon": "true", // true|false => CSS
  "animation-duration": "medium", // none|short|medium|long => CSS
  "voice-volume": "medium", // extra-small|small|medium => JS
  "question-voice-rate": "medium", // extra-slow|slow|medium|fast|extra-fast => JS
  "question-voice-pitch": "medium", // extra-low|low|medium|high|extra-high => JS
  "question-voice-number": "1", // 1-9|0 => JS
  "answer-voice-rate": "medium", // extra-slow|slow|medium|fast|extra-fast => JS
  "answer-voice-pitch": "medium", // extra-low|low|medium|high|extra-high => JS
  "answer-voice-number": "1", // 1-9|0 => JS
  "font-size": "medium", // extra-small|small|medium|large|extra-large => CSS
  "font-family": "sans-serif", // sans-serif|serif => CSS
  "line-height": "medium", // small|medium|large => CSS
  "color-scheme": "light", // light|dark|auto => JS + CSS
  "accent-color": "indigo", // red|pink|purple|deep-purple|indigo|blue|light-blue|cyan|teal|green|light-green|lime|yellow|amber|orange|deep-orange|brown|blue-grey => CSS
  "background-pattern": "none" // none|(horizontal|vertical)-(thin|medium|thick)-stripe|(small|medium|large)-(checks|dots) => CSS
};
const settingControlChars = {
  "enable-swipe-to-right": "a",
  "enable-automatic-drill-starting": "b",
  "enable-option-part-highlight": "c",
  "enable-option-part-emphasis": "d",
  "enable-hint-balloon": "e",
  "animation-duration": "f",
  "voice-volume": "g",
  "question-voice-rate": "h",
  "question-voice-pitch": "i",
  "question-voice-number": "j",
  "answer-voice-rate": "k",
  "answer-voice-pitch": "l",
  "answer-voice-number": "m",
  "font-size": "n",
  "font-family": "o",
  "line-height": "p",
  "color-scheme": "q",
  "accent-color": "r",
  "background-pattern": "s"
};
let appLang;
let stringResources;
let questionPhrase;
let answerPhrase;
const main = async () => {
  appLang = {'ja': 'ja', 'ja-jp': 'ja'}[window.navigator.language.toLowerCase()] || 'en';
  qs('#lead-body').innerHTML = 'Loading the data of string resouces...';
  await new Promise(resolve => {
    const urlOfStringResourcesJsonp = `./data/string-resources-${appLang}.jsonp`;
    requestJsonp(urlOfStringResourcesJsonp, data => {
      stringResources = data;
      resolve();
    });
  });
  document.title = stringResources['app-title'];
  qsa('[data-string-resource-key]').forEach(element => {
    const key = element.getAttribute('data-string-resource-key');
    element.innerHTML = stringResources[key];
    element.removeAttribute('data-string-resource-key');
  });
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  if (mql.addEventListener) {
    mql.addEventListener('change', event => {
      if (event.matches) {
        setFlag('prefers-dark-color-scheme', true);
      } else {
        setFlag('prefers-dark-color-scheme', false);
      }
    });
  }
  setFlag('prefers-dark-color-scheme', mql.matches);
  for (const key in settingDefaultValues) {
    loadSetting(key, settingDefaultValues[key]);
  }
  setSetting('enable-automatic-question-reading-aloud', 'false');
  setSetting('enable-automatic-answer-reading-aloud', 'false');
  qs('#fold-lead-button').addEventListener('click', () => {
    toggleFlag('fold-lead');
  });
  qs('#enable-automatic-question-reading-aloud-button').addEventListener('click', () => {
    toggleSetting('enable-automatic-question-reading-aloud');
    if (getSetting('enable-automatic-question-reading-aloud', 'boolean')) {
      readNotice(stringResources['--each-question-will-be-automatically-read-aloud']);
    } else {
      read(null);
    }
  });
  qs('#enable-automatic-answer-reading-aloud-button').addEventListener('click', () => {
    toggleSetting('enable-automatic-answer-reading-aloud');
    if (getSetting('enable-automatic-answer-reading-aloud', 'boolean')) {
      readNotice(stringResources['--each-answer-will-be-automatically-read-aloud']);
    } else {
      read(null);
    }
  });
  qs('#read-aloud-button').addEventListener('click', () => {
    if (getFlag('uncover-answer')) {
      readAnswer();
    } else {
      readQuestion();
    }
  });
  qs('#play-button').addEventListener('click', () => {
    if (getFlag('uncover-answer')) {
      resetCard();
    } else {
      uncoverAnswer();
    }
  });
  qs('#skip-button').addEventListener('click', () => {
    resetCard();
  });
  qs('#show-settings-button').addEventListener('click', () => {
    setFlag('show-settings', true);
  });
  qs('#show-help-button').addEventListener('click', () => {
    setFlag('show-help', true);
  });
  qs('#visit-home-button').addEventListener('click', () => {
    const ret = window.confirm(stringResources['--you-will-be-transferred-to-an-external-website']);
    if (! ret) {
      return;
    }
    window.location.href = homeUrl;
  });
  qs('#hide-settings-button').addEventListener('click', () => {
    setFlag('show-settings', false);
  });
  qs('#settings-modal').addEventListener('click', event => {
    if (event.currentTarget != event.target) {
      return;
    }
    setFlag('show-settings', false);
  });
  qs('#hide-help-button').addEventListener('click', () => {
    setFlag('show-help', false);
  });
  qs('#help-modal').addEventListener('click', event => {
    if (event.currentTarget != event.target) {
      return;
    }
    setFlag('show-help', false);
  });
  qsa('[data-setting-key]').forEach(element => {
    element.addEventListener('click', () => {
      const key = element.getAttribute('data-setting-key');
      const value = element.getAttribute('data-setting-value');
      setSetting(key, value);
    });
  });
  addKeyDownListener('Escape', () => {
    if (getFlag('show-settings')) {
      setFlag('show-settings', false);
    } else if (getFlag('show-help')) {
      setFlag('show-help', false);
    } else {
      toggleFlag('fold-lead');
    }
  });
  addKeyDownListener('/', () => {
    if (getFlag('show-help')) {
      return;
    }
    toggleFlag('show-settings');
  });
  addKeyDownListener('?', () => {
    if (getFlag('show-settings')) {
      return;
    }
    toggleFlag('show-help');
  });
  addKeyDownListener('ArrowDown', () => {
    if (getFlag('show-settings')) {
      qs('#settings-panel').scrollBy(0, 50);
    } else if (getFlag('show-help')) {
      qs('#help-panel').scrollBy(0, 50);
    } else if (! getFlag('fold-lead')) {
      qs('#lead-panel').scrollBy(0, 50);
    } else if (getFlag('uncover-answer')) {
      qs('#answer-panel').scrollBy(0, 50);
    } else {
      qs('#question-panel').scrollBy(0, 50);
    }
  });
  addKeyDownListener('ArrowUp', () => {
    if (getFlag('show-settings')) {
      qs('#settings-panel').scrollBy(0, -50);
    } else if (getFlag('show-help')) {
      qs('#help-panel').scrollBy(0, -50);
    } else if (! getFlag('fold-lead')) {
      qs('#lead-panel').scrollBy(0, -50);
    } else if (getFlag('uncover-answer')) {
      qs('#answer-panel').scrollBy(0, -50);
    } else {
      qs('#question-panel').scrollBy(0, -50);
    }
  });
  addKeyDownListener('ArrowRight', () => {
    if (! getFlag('fold-lead') || getFlag('show-settings') || getFlag('show-help')) {
      return;
    }
    switchActiveOptionPartElement(false);
  });
  addKeyDownListener('ArrowLeft', () => {
    if (! getFlag('fold-lead') || getFlag('show-settings' || getFlag('show-help'))) {
      return;
    }
    switchActiveOptionPartElement(true);
  });
  addKeyDownListener('q', () => {
    if (! getFlag('fold-lead') || getFlag('show-settings') || getFlag('show-help')) {
      return;
    }
    toggleSetting('enable-automatic-question-reading-aloud');
  });
  addKeyDownListener('a', () => {
    if (! getFlag('fold-lead') || getFlag('show-settings') || getFlag('show-help')) {
      return;
    }
      toggleSetting('enable-automatic-answer-reading-aloud');
  });
  addKeyDownListener('Enter', () => {
    if (! getFlag('fold-lead') || getFlag('show-settings') || getFlag('show-help')) {
      return;
    }
    if (getFlag('uncover-answer')) {
      readAnswer();
    } else {
      readQuestion();
    }
  });
  addKeyDownListener(' ', () => {
    if (getFlag('show-settings') || getFlag('show-help')) {
      return;
    }
    if (! getFlag('fold-lead')) {
      setFlag('fold-lead', true);
    } else if (getFlag('uncover-answer')) {
      resetCard();
    } else {
      uncoverAnswer();
    }
  });
  addKeyDownListener('Tab', () => {
    if (getFlag('show-settings') || getFlag('show-help')) {
      return;
    }
    if (! getFlag('fold-lead')) {
      setFlag('fold-lead', true);
    } else {
      resetCard();
    }
  });
  for (const key in settingControlChars) {
    const settingControlChar = settingControlChars[key];
    addKeyDownListener(settingControlChar, () => {
      if (! getFlag('show-settings')) {
        return;
      }
      switchSettingRadio(key, false);
    });
    addKeyDownListener(settingControlChar.toUpperCase(), () => {
      if (! getFlag('show-settings')) {
        return;
      }
      switchSettingRadio(key, true);
    });
  }
  addSwipeListener(-25, () => {
    if (getFlag('show-settings') || getFlag('show-help')) {
      return;
    }
    if (! getFlag('fold-lead')) {
      setFlag('fold-lead', true);
    } else if (getFlag('uncover-answer')) {
      resetCard();
    } else {
      uncoverAnswer();
    }
  });
  addSwipeListener(25, () => {
    if (! getSetting('enable-swipe-to-right', 'boolean')) {
      return;
    }
    if (getFlag('show-settings') || getFlag('show-help')) {
      return;
    }
    if (! getFlag('fold-lead')) {
      setFlag('fold-lead', true);
    } else {
      resetCard();
    }
  });
  addDoubleTapListener(250, () => {
    if (! getFlag('fold-lead') || getFlag('show-settings') || getFlag('show-help')) {
      return;
    }
    if (getFlag('uncover-answer')) {
      readAnswer();
    } else {
      readQuestion();
    }
  });
  qs('body').addEventListener('touchstart', event => {
    setActiveElement(event.target);
  });
  qs('body').addEventListener('mousemove', () => {
    setActiveElement(null);
  });
  let leadText;
  let questionTemplate;
  let questionLang;
  let answerTemplate;
  let answerLang;
  let drillDataJsonpUrl;
  const usp = new URLSearchParams(window.location.search);
  if (usp.has('qtemp')) {
    leadText = usp.get('ltext') || '';
    questionTemplate = usp.get('qtemp') || '';
    questionLang = usp.get('qlang') || '';
    answerTemplate = usp.get('atemp') || '';
    answerLang = usp.get('alang') || '';
  } else if (usp.get('iframe') == 'true') {
    qs('#lead-body').innerHTML = 'Waiting the messages from the parent window...';
    await new Promise(resolve => {
      window.addEventListener('message', event => {
        leadText = event.data['ltext'] || '';
        questionTemplate = event.data['qtemp'] || '';
        questionLang = event.data['qlang'] || '';
        answerTemplate = event.data['atemp'] || '';
        answerLang = event.data['alang'] || '';
        resolve();
      }, {once: true});
    });
  } else {
    qs('#lead-body').innerHTML = 'Loading the drill data...';
    await new Promise(resolve => {
      drillDataJsonpUrl = usp.get('jsonp') || `./data/sample-drill-data-${appLang}.jsonp`;
      requestJsonp(drillDataJsonpUrl, data => {
        leadText = data['ltext'] || '';
        questionTemplate = data['qtemp'] || '';
        questionLang = data['qlang'] || '';
        answerTemplate = data['atemp'] || '';
        answerLang = data['alang'] || '';
        resolve();
      });
    });
  }
  let templateReplacements;
  qs('#lead-body').innerHTML = 'Loading the data of template replacements...';
  await new Promise(resolve => {
    requestJsonp('./data/template-replacements.jsonp', data => {
      templateReplacements = data;
      resolve();
    });
  });
  leadText = leadText.replace(/</g, '&lt;');
  leadText = leadText.replace(/>/g, '&gt;');
  leadText = leadText.replace(/\*\*([^\n]*)\*\*/g, '<b>$1</b>');
  leadText = leadText.replace(/\n/g, '<br>');
  if (drillDataJsonpUrl) {
    leadText += leadText ? '<br>____<br>' : '';
    leadText += `${stringResources['--the-data-of-this-drill']}: <a href="${drillDataJsonpUrl}">${drillDataJsonpUrl}</a>`;
  }
  qs('#lead-body').innerHTML = leadText;
  await new Promise(resolve => {
    setFlag.listener = (key, value) => {
      if (key == 'fold-lead' && value) {
        setFlag.listener = null;
        resolve();
      }
    }
    if (! leadText || getSetting('enable-automatic-drill-starting', 'boolean')) {
      qs('#fold-lead-button').click();
    }
  });
  let errorMessages = [];
  if (! questionTemplate) {
    questionTemplate = 'undefined';
    errorMessages.push(stringResources['--error--the-template-of-question-is-undefined']);
  }
  if (! answerTemplate) {
    answerTemplate = 'undefined';
    errorMessages.push(stringResources['--error--the-template-of-answer-is-undefined']);
  }
  const processedQuestionTemplate = replaceAll(questionTemplate, templateReplacements);
  questionPhrase = new DrillPhrase(processedQuestionTemplate, questionLang);
  const processedAnswerTemplate = replaceAll(answerTemplate, templateReplacements);
  answerPhrase = new DrillPhrase(processedAnswerTemplate, answerLang);
  if (questionPhrase.optionCounts.toString() != answerPhrase.optionCounts.toString()) {
    errorMessages.push(stringResources['--error--the-templates-of-question-and-answer-do-not-match-in-structure']);
  }
  if (errorMessages.length) {
    qs('#error-body').innerHTML = `${stringResources['--error']}: ${errorMessages.join(' / ')}`;
    setFlag('hasError', true);
  }
  resetCard();
};
const switchActiveOptionPartElement = reverse => {
  let optionPartElements;
  if (getFlag('uncover-answer')) {
    optionPartElements = qsa('.option-part.main');
  } else {
    optionPartElements = qsa('#question-panel .option-part.main');
  }
  let currentIndex = reverse ? optionPartElements.length : -1;
  optionPartElements.forEach((element, index) => {
    if (element.classList.contains('active')) {
      currentIndex = index;
    }
  });
  const nextIndex = currentIndex + (reverse ? -1 : 1);
  const nextOptionPartElement = optionPartElements.item(nextIndex);
  setActiveElement(nextOptionPartElement);
};
const setActiveElement = targetElement => {
  qsa('.active').forEach(element => {
    element.classList.remove('active');
  });
  if (targetElement) {
    targetElement.classList.add('active');
    setFlag('has-active-element', true);
  } else {
    setFlag('has-active-element', false);
  }
};
const switchSettingRadio = (targetSettingKey, reverse) => {
  const currentValue = getSetting(targetSettingKey);
  const settingRadioElements = qsa(`[data-setting-key="${targetSettingKey}"]`);
  let currentIndex = reverse ? settingRadioElements.length : -1;
  settingRadioElements.forEach((element, index) => {
    if (element.getAttribute('data-setting-value') == currentValue) {
      currentIndex = index;
    }
  });
  const nextIndex = (settingRadioElements.length + currentIndex + (reverse ? -1 : 1)) % settingRadioElements.length;
  settingRadioElements.item(nextIndex).click();
}
const readNotice = notice => {
  read(notice, appLang, getSetting('voice-volume'), 'fast', 'medium', 1);
};
const readQuestion = () => {
  read(
    questionPhrase.text,
    questionPhrase.lang,
    getSetting('voice-volume'),
    getSetting('question-voice-rate'),
    getSetting('question-voice-pitch'),
    getSetting('question-voice-number', 'integer'),
  );
};
const readAnswer = () => {
  read(
    answerPhrase.text,
    answerPhrase.lang,
    getSetting('voice-volume'),
    getSetting('answer-voice-rate'),
    getSetting('answer-voice-pitch'),
    getSetting('answer-voice-number', 'integer'),
  );
}
const resetCard = async () => {
  if (getFlag('disable-control')) {
    return;
  }
  setFlag('disable-control', true);
  const _addHintBalloons = (parentPanelElement, hintTextList) => {
    const _setHintBalloonPosition = optionPartElement => {
      const hintBalloonPanelElement = optionPartElement.querySelector('.hint-balloon-chip');
      const optionPartRect = optionPartElement.getClientRects()[0];
      hintBalloonPanelElement.style.top = `${optionPartRect.top}px`;
      hintBalloonPanelElement.style.left = `${optionPartRect.left}px`;
    };
    const _updateHintBalloonPositions = () => {
      const targetOptionPartElements = parentPanelElement.querySelectorAll('.option-part.main');
      for (const optionPartElement of targetOptionPartElements) {
        _setHintBalloonPosition(optionPartElement);
      }
    };
    const targetOptionPartElements = parentPanelElement.querySelectorAll('.option-part.main');
    for (const optionPartElement of targetOptionPartElements) {
      const optionPartNumber = Number(optionPartElement.getAttribute('data-option-part-number'));
      const hintText = hintTextList[optionPartNumber];
      const hintBalloonBodyElement = ce('span');
      hintBalloonBodyElement.className = 'hint-balloon-body';
      hintBalloonBodyElement.innerText = hintText;
      const hintBalloonPanelElement = ce('span');
      hintBalloonPanelElement.className = 'hint-balloon-chip';
      hintBalloonPanelElement.append(hintBalloonBodyElement);
      optionPartElement.append(hintBalloonPanelElement);
      const hintBalloonRight = optionPartElement.getClientRects()[0].left + hintBalloonPanelElement.offsetWidth;
      const hintBalloonContentMarginLeft = Math.min(0, document.body.offsetWidth - hintBalloonRight);
      hintBalloonBodyElement.style.marginLeft = `${hintBalloonContentMarginLeft}px`;
      _setHintBalloonPosition(optionPartElement);
    }
    parentPanelElement.addEventListener('scroll', _updateHintBalloonPositions);
    window.addEventListener('resize', _updateHintBalloonPositions);
  }
  read(null);
  setFlag('uncover-question', false);
  setFlag('uncover-answer', false);
  const transitionDuration = window.getComputedStyle(qs('#question-cover')).transitionDuration;
  const commonTimeoutDelay = Number.parseFloat(transitionDuration) * (/ms$/.test(transitionDuration) ? 1 : 1000);
  if (commonTimeoutDelay) {
    await setTimeout(commonTimeoutDelay);
  }
  const pathIdSeed = Math.random();
  questionPhrase.reset(pathIdSeed);
  answerPhrase.reset(pathIdSeed);
  const statisticsOutput = replaceAll(
    stringResources['statistics-output-template'],
    {
      '%pattern-count%': questionPhrase.possiblePathCount.toLocaleString(),
      '%pattern-id%': questionPhrase.pathId.toLocaleString(),
      '%question-number%': questionPhrase.resetCount.toLocaleString()
    }
  );
  qs('#statistics-body').innerHTML = statisticsOutput;
  qs('#question-panel').scrollTop = 0;
  qs('#question-body').innerHTML = questionPhrase.html;
  _addHintBalloons(qs('#question-panel'), answerPhrase.selectedOptionTexts);
  qs('#answer-panel').scrollTop = 0;
  qs('#answer-body').innerHTML = answerPhrase.html;
  _addHintBalloons(qs('#answer-panel'), questionPhrase.selectedOptionTexts);
  if (commonTimeoutDelay) {
    await setTimeout(commonTimeoutDelay / 2);
  } else {
    await setTimeout(500);
  }
  setFlag('uncover-question', true);
  if (commonTimeoutDelay) {
    await setTimeout(commonTimeoutDelay);
  }
  if (getSetting('enable-automatic-question-reading-aloud', 'boolean')) {
    readQuestion();
  }
  setFlag('disable-control', false);
};
const uncoverAnswer = async () => {
  if (getFlag('disable-control')) {
    return;
  }
  setFlag('disable-control', true);
  read(null);
  setFlag('uncover-answer', true);
  const transitionDuration = window.getComputedStyle(qs('#answer-cover')).transitionDuration;
  const commonTimeoutDelay = Number.parseFloat(transitionDuration) * (/ms$/.test(transitionDuration) ? 1 : 1000);
  if (commonTimeoutDelay) {
    await setTimeout(commonTimeoutDelay);
  }
  if (getSetting('enable-automatic-answer-reading-aloud', 'boolean')) {
    readAnswer();
  }
  setFlag('disable-control', false);
};
window.addEventListener('DOMContentLoaded', main);
