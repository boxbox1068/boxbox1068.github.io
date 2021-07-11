'use strict';
const homeUrl = 'https://twitter.com/shikaku1068/';
const settingDefaultValues = {
  "enable-swipe-to-right": "true", // true|false => JS
  "enable-variable-highlight": "true", // true|false => CSS
  "enable-hint-balloon": "true", // true|false => CSS
  "animation-duration": "medium", // none|short|medium|long => CSS
  "voice-volume": "medium", // very-small|small|medium => JS
  "question-voice-rate": "medium", // very-slow|slow|medium|fast|very-fast => JS
  "question-voice-pitch": "medium", // very-low|low|medium|high|very-high => JS
  "question-voice-number": "1", // 1-9|0 => JS
  "answer-voice-rate": "medium", // very-slow|slow|medium|fast|very-fast => JS
  "answer-voice-pitch": "medium", // very-low|low|medium|high|very-high => JS
  "answer-voice-number": "1", // 1-9|0 => JS
  "font-size": "medium", // very-small|small|medium|large|very-large => CSS
  "font-family": "sans-serif", // sans-serif|serif => CSS
  "line-height": "medium", // small|medium|large => CSS
  "color-scheme": "light", // light|dark|auto => JS + CSS
  "accent-color": "indigo", // red|pink|purple|deep-purple|indigo|blue|light-blue|cyan|teal|green|light-green|lime|yellow|amber|orange|deep-orange|brown|blue-grey => CSS
  "background-patterns": "horizontal-thin-stripe" // none|(horizontal|vertical)-(thin|medium|thick)-stripe|(small|medium|large)-(checks|dots) => CSS
};
const settingControlChars = {
  "enable-swipe-to-right": "a",
  "enable-variable-highlight": "b",
  "enable-hint-balloon": "c",
  "animation-duration": "d",
  "voice-volume": "e",
  "question-voice-rate": "f",
  "question-voice-pitch": "g",
  "question-voice-number": "h",
  "answer-voice-rate": "i",
  "answer-voice-pitch": "j",
  "answer-voice-number": "k",
  "font-size": "l",
  "font-family": "m",
  "line-height": "n",
  "color-scheme": "o",
  "accent-color": "p",
  "background-patterns": "q"
};
let appLang;
let stringResources;
let questionPhrase;
let answerPhrase;
const main = async () => {
  appLang = {'en': 'en', 'ja': 'ja'}[window.navigator.language] || 'en';
  const urlOfStringResourcesJsonp = `./data/string-resources-${appLang}.jsonp`;
  await new Promise(resolve => {
    requestJsonp(urlOfStringResourcesJsonp, data => {
      stringResources = data;
      resolve();
    });
  });
  document.title = stringResources['app-title'];
  qsa('[data-string-resource-key]').forEach(element => {
    const key = element.getAttribute('data-string-resource-key');
    element.innerHTML = stringResources[key];
  });
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  mql.addEventListener('change', event => {
    if (event.matches) {
      setFlag('prefers-dark-color-scheme', true);
    } else {
      setFlag('prefers-dark-color-scheme', false);
    }
  });
  setFlag('prefers-dark-color-scheme', mql.matches);
  for (const key in settingDefaultValues) {
    loadSetting(key, settingDefaultValues[key]);
  }
  setSetting('enable-automatic-question-speaking', 'false');
  setSetting('enable-automatic-answer-speaking', 'false');
  qs('#fold-lead-button').addEventListener('click', () => {
    toggleFlag('fold-lead');
  });
  qs('#enable-automatic-question-speaking-button').addEventListener('click', () => {
    toggleSetting('enable-automatic-question-speaking');
  });
  qs('#enable-automatic-answer-speaking-button').addEventListener('click', () => {
    toggleSetting('enable-automatic-answer-speaking');
  });
  qs('#speak-button').addEventListener('click', () => {
    if (getFlag('uncover-answer')) {
      speakAnswer();
    } else {
      speakQuestion();
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
  qs('#visit-home-button').addEventListener('click', () => {
    window.location.href = homeUrl;
  });
  qs('#hide-settings-button').addEventListener('click', () => {
    setFlag('show-settings', false);
  });
  qs('#settings-screen').addEventListener('click', event => {
    if (event.currentTarget != event.target) {
      return;
    }
    setFlag('show-settings', false);
  });
  qsa('.setting-radio').forEach(element => {
    element.addEventListener('click', () => {
      const key = element.getAttribute('data-setting-key');
      const value = element.getAttribute('data-setting-value');
      setSetting(key, value);
    });
  });
  addKeyDownListener('Escape', () => {
    if (getFlag('show-settings')) {
      setFlag('show-settings', false);
    } else {
      toggleFlag('fold-lead');
    }
  });
  addKeyDownListener('q', () => {
    if (! getFlag('fold-lead') || getFlag('show-settings')) {
      return;
    }
    toggleSetting('enable-automatic-question-speaking');
  });
  addKeyDownListener('a', () => {
    if (! getFlag('fold-lead') || getFlag('show-settings')) {
      return;
    }
      toggleSetting('enable-automatic-answer-speaking');
  });
  addKeyDownListener('Enter', () => {
    if (! getFlag('fold-lead') || getFlag('show-settings')) {
      return;
    }
    if (getFlag('uncover-answer')) {
      speakAnswer();
    } else {
      speakQuestion();
    }
  });
  addKeyDownListener(' ', () => {
    if (getFlag('show-settings')) {
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
    if (getFlag('show-settings')) {
      return;
    }
    if (! getFlag('fold-lead')) {
      setFlag('fold-lead', true);
    } else {
      resetCard();
    }
  });
  addKeyDownListener('ArrowRight', () => {
    if (! getFlag('fold-lead') || getFlag('show-settings')) {
      return;
    }
    switchActiveVariableElement(false);
  });
  addKeyDownListener('ArrowLeft', () => {
    if (! getFlag('fold-lead') || getFlag('show-settings')) {
      return;
    }
    switchActiveVariableElement(true);
  });
  addKeyDownListener('ArrowDown', () => {
    if (getFlag('show-settings')) {
      qs('#settings-panel').scrollBy(0, 50);
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
    } else if (! getFlag('fold-lead')) {
      qs('#lead-panel').scrollBy(0, -50);
    } else if (getFlag('uncover-answer')) {
      qs('#answer-panel').scrollBy(0, -50);
    } else {
      qs('#question-panel').scrollBy(0, -50);
    }
  });
  addKeyDownListener('/', () => {
    toggleFlag('show-settings');
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
    if (getFlag('show-settings')) {
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
    if (getFlag('show-settings')) {
      return;
    }
    if (! getFlag('fold-lead')) {
      setFlag('fold-lead', true);
    } else {
      resetCard();
    }
  });
  addDoubleTapListener(250, () => {
    if (! getFlag('fold-lead') || getFlag('show-settings')) {
      return;
    }
    if (getFlag('uncover-answer')) {
      speakAnswer();
    } else {
      speakQuestion();
    }
  });
  qs('body').addEventListener('touchend', event => {
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
  const usp = new URLSearchParams(window.location.search.replace(/^\?/, ''));
  if (usp.has('question')) {
    leadText = usp.get('ltext') || '';
    questionTemplate = usp.get('qtemp') || '';
    questionLang = usp.get('qlang') || '';
    answerTemplate = usp.get('atemp') || '';
    answerLang = usp.get('alang') || '';
  } else if (usp.get('iframe') == 'true') {
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
    const urlOfDemoUnitJsonp = `./data/demo-unit-${appLang}.jsonp`;
    await new Promise(resolve => {
      requestJsonp(urlOfDemoUnitJsonp, data => {
        leadText = data['ltext'] || '';
        leadText += `${leadText ? '<br>__<br>' : ''}`
          + `${stringResources['--the-source-of-this-unit']}: `
          + `<a href="${urlOfDemoUnitJsonp}">${urlOfDemoUnitJsonp}</a>`;
        questionTemplate = data['qtemp'] || '';
        questionLang = data['qlang'] || '';
        answerTemplate = data['atemp'] || '';
        answerLang = data['alang'] || '';
        resolve();
      });
    });
  }
  qs('#lead-body').innerHTML = leadText;



  if (! questionTemplate) {
    questionTemplate = 'hogehoge';
  }
  if (! answerTemplate) {
    answerTemplate = 'fugafuga';
  }



  await new Promise(resolve => {
    setFlag.listener = (key, value) => {
      if (key == 'fold-lead' && value) {
        setFlag.listener = null;
        resolve();
      }
    }
    if (! leadText) {
      qs('#fold-lead-button').click();
      qs('#fold-lead-button').disabled = true;
    }
  });
  let templateReplacements;
  await new Promise(resolve => {
    requestJsonp('./data/template-replacements.jsonp', data => {
      templateReplacements = data;
      resolve();
    });
  });
  const processedQuestionTemplate = replaceAll(questionTemplate, templateReplacements);
  questionPhrase = new RabbitPhrase(processedQuestionTemplate, questionLang);
  const processedAnswerTemplate = replaceAll(answerTemplate, templateReplacements);
  answerPhrase = new RabbitPhrase(processedAnswerTemplate, answerLang);
  resetCard();
};
const switchActiveVariableElement = reverse => {
  let variableElements;
  if (getFlag('uncover-answer')) {
    variableElements = qsa('.variable');
  } else {
    variableElements = qsa('#question-panel .variable');
  }
  let currentIndex = reverse ? variableElements.length : -1;
  variableElements.forEach((element, index) => {
    if (element.classList.contains('active')) {
      currentIndex = index;
    }
  });
  const nextIndex = currentIndex + (reverse ? -1 : 1);
  const nextVariableElement = variableElements.item(nextIndex);
  setActiveElement(nextVariableElement);
};
const setActiveElement = targetElement => {
  qsa('.active').forEach(element => {
    element.classList.remove('active');
  });
  if (targetElement) {
    targetElement.classList.add('active');
    setFlag('hasActiveElement', true);
  } else {
    setFlag('hasActiveElement', false);
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
const speakQuestion = interrupt => {
  speak(
    questionPhrase.text,
    questionPhrase.lang,
    getSetting('voice-volume'),
    getSetting('question-voice-rate'),
    getSetting('question-voice-pitch'),
    getSetting('question-voice-number'),
    interrupt
  );
};
const speakAnswer = interrupt => {
  speak(
    answerPhrase.text,
    answerPhrase.lang,
    getSetting('voice-volume'),
    getSetting('answer-voice-rate'),
    getSetting('answer-voice-pitch'),
    getSetting('answer-voice-number'),
    interrupt
  );
}
const resetCard = async () => {
  if (getFlag('disable-operation')) {
    return;
  }
  setFlag('disable-operation', true);
  const _addHintBalloons = (parentPanelElement, hintTextList) => {
    const _setHintBalloonPosition = variableElement => {
      const hintBalloonPanelElement = variableElement.querySelector('.hint-balloon-panel');
      const variableRect = variableElement.getClientRects()[0];
      hintBalloonPanelElement.style.top = `${variableRect.top}px`;
      hintBalloonPanelElement.style.left = `${variableRect.left}px`;
    };
    const _updateHintBalloonPositions = () => {
      const targetVariableElements = parentPanelElement.querySelectorAll('.variable');
      for (const variableElement of targetVariableElements) {
        _setHintBalloonPosition(variableElement);
      }
    };
    const targetVariableElements = parentPanelElement.querySelectorAll('.variable');
    for (const variableElement of targetVariableElements) {
      const variableNumber = Number(variableElement.dataset.variableNumber);
      const hintText = hintTextList[variableNumber];
      const hintBalloonBodyElement = ce('span');
      hintBalloonBodyElement.className = 'hint-balloon-body';
      hintBalloonBodyElement.innerText = hintText;
      const hintBalloonPanelElement = ce('span');
      hintBalloonPanelElement.className = 'hint-balloon-panel';
      hintBalloonPanelElement.append(hintBalloonBodyElement);
      variableElement.append(hintBalloonPanelElement);
      const hintBalloonRight = variableElement.getClientRects()[0].left + hintBalloonPanelElement.offsetWidth;
      const hintBalloonContentMarginLeft = Math.min(0, document.body.offsetWidth - hintBalloonRight);
      hintBalloonBodyElement.style.marginLeft = `${hintBalloonContentMarginLeft}px`;
      _setHintBalloonPosition(variableElement);
    }
    parentPanelElement.addEventListener('scroll', _updateHintBalloonPositions);
    window.addEventListener('resize', _updateHintBalloonPositions);
  }
  speak(null);
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
      '%refill-count%': (questionPhrase.resetCount - 1).toLocaleString()
    }
  );
  qs('#statistics-body').innerHTML = statisticsOutput;
  qs('#question-panel').scrollTop = 0;
  qs('#question-body').innerHTML = questionPhrase.html;
  _addHintBalloons(qs('#question-panel'), answerPhrase.chosenOptionTexts);
  qs('#answer-panel').scrollTop = 0;
  qs('#answer-body').innerHTML = answerPhrase.html;
  _addHintBalloons(qs('#answer-panel'), questionPhrase.chosenOptionTexts);
  if (commonTimeoutDelay) {
    await setTimeout(commonTimeoutDelay / 2);
  } else {
    await setTimeout(500);
  }
  setFlag('uncover-question', true);
  if (commonTimeoutDelay) {
    await setTimeout(commonTimeoutDelay);
  }
  if (getSetting('enable-automatic-question-speaking', 'boolean')) {
    speakQuestion(true);
  }
  setFlag('disable-operation', false);
};
const uncoverAnswer = async () => {
  if (getFlag('disable-operation')) {
    return;
  }
  setFlag('disable-operation', true);
  speak(null);
  setFlag('uncover-answer', true);
  const transitionDuration = window.getComputedStyle(qs('#answer-cover')).transitionDuration;
  const commonTimeoutDelay = Number.parseFloat(transitionDuration) * (/ms$/.test(transitionDuration) ? 1 : 1000);
  if (commonTimeoutDelay) {
    await setTimeout(commonTimeoutDelay);
  }
  if (getSetting('enable-automatic-answer-speaking', 'boolean')) {
    speakAnswer(true);
  }
  setFlag('disable-operation', false);
};
window.addEventListener('DOMContentLoaded', main);
