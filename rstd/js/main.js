'use strict';
const homeUrl = 'https://twitter.com/shikaku1068/';
const settingDefaultValues = {
  "app-theme": "light",
  "enable-variable-highlight": "true",
  "enable-hint-balloon": "true",
  "animation-duration": ".5s",
  "voice-volume": "1",
  "question-voice-number": "1",
  "question-voice-rate": "1",
  "question-voice-pitch": "1",
  "answer-voice-number": "1",
  "answer-voice-rate": "1",
  "answer-voice-pitch": "1",
  "enable-swipe-to-right": "true"
};
const settingControlChars = {
  "app-theme": "a",
  "enable-variable-highlight": "b",
  "enable-hint-balloon": "c",
  "animation-duration": "d",
  "voice-volume": "e",
  "question-voice-number": "f",
  "question-voice-rate": "g",
  "question-voice-pitch": "h",
  "answer-voice-number": "i",
  "answer-voice-rate": "j",
  "answer-voice-pitch": "k",
  "enable-swipe-to-right": "l"
};
let appLang;
let stringResources;
let questionPhrase;
let answerPhrase;
const main = async () => {
  appLang = {'en': 'en', 'ja': 'ja'}[window.navigator.language] || 'en';
  stringResources = {};
  for (const lang of [...new Set(['en', appLang])]) {
    const urlOfStringResourcesJsonp = `./data/string-resources-${lang}.jsonp`;
    await new Promise(resolve => {
      requestJsonp(urlOfStringResourcesJsonp, data => {
        stringResources = {...stringResources, ...data};
        resolve();
      });
    });
  }
  document.title = stringResources['app-title'];
  qsa('[data-string-resource-key]').forEach(element => {
    const key = element.getAttribute('data-string-resource-key');
    element.innerHTML = stringResources[key];
  });
  for (const key in settingDefaultValues) {
    loadSetting(key, settingDefaultValues[key]);
  }
  setSetting('enable-automatic-question-speaking', 'false');
  setSetting('enable-automatic-answer-speaking', 'false');
  qs('#fold-lead-button').addEventListener('click', () => {
    setFlag('fold-lead', ! getFlag('fold-lead'));
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
      showAnswer();
    }
  });
  qs('#skip-button').addEventListener('click', () => {
    resetCard();
  });
  qs('#show-settings-button').addEventListener('click', () => {
    setFlag('show-settings', ! getFlag('show-settings'));
  });
  qs('#visit-home-button').addEventListener('click', () => {
    window.location.href = homeUrl;
  });



  qs('#hide-settings-button').addEventListener('click', event => {
    _hideSettings();
  });
  qs('#settings-background').addEventListener('click', event => {
    if (event.currentTarget != event.target) {
      return;
    }
    _hideSettings();
  });
  qsa('.setting-radio').forEach(element => {
    element.addEventListener('click', event => {
      const key = element.getAttribute('data-setting-key');
      const value = element.getAttribute('data-setting-value');
      setSetting(key, value);
    });
  });
  addKeyDownListener('Escape', () => {
    _switchPanel();
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
    _speakDrill();
  });
  addKeyDownListener(' ', () => {
    _playDrill();
  });
  addKeyDownListener('Tab', () => {
    _skipDrill();
  });
  addKeyDownListener('ArrowRight', () => {
    _showHint(false);
  });
  addKeyDownListener('ArrowLeft', () => {
    _showHint(true);
  });
  addKeyDownListener('ArrowDown', () => {
    _scrollPanel(50);
  });
  addKeyDownListener('ArrowUp', () => {
    _scrollPanel(-50);
  });
  addKeyDownListener('/', () => {
    if (getFlag('show-settings')) {
      _hideSettings();
    } else {
      _showSettings();
    }
  });
  for (const key in settingControlChars) {
    addKeyDownListener(settingControlChars[key], () => {
      if (! getFlag('show-settings')) {
        return;
      }
      _switchSetting(key);
    });
  }






  addSwipeListener(qs('body'), -25, () => {
    _playDrill();
  });
  addSwipeListener(qs('body'), 25, () => {
    if (getSetting('enable-swipe-to-right', 'boolean')) {
      _skipDrill();
    }
  });
  addDoubleTapListener(qs('body'), 250, () => {
    _speakDrill();
  });
  qs('body').addEventListener('touchend', event => {
    _setActiveElement(event.target);
  }, {capture: true});  
  qs('body').addEventListener('mousemove', event => {
    _setActiveElement(event.target);
  }, {capture: true});  
  let leadText;
  let questionTemplate;
  let questionLang;
  let answerTemplate;
  let answerLang;
  const usp = new URLSearchParams(window.location.search.replace(/^\?/, ''));
  if (usp.has('question')) {
    leadText = usp.get('l-text');
    questionTemplate = usp.get('q-temp');
    questionLang = usp.get('q-lang');
    answerTemplate = usp.get('a-temp');
    answerLang = usp.get('a-lang');
  } else if (usp.get('iframe') == 'true') {
    await new Promise(resolve => {
      window.addEventListener('message', event => {
        leadText = event.data['l-text'];
        questionTemplate = event.data['q-temp'];
        questionLang = event.data['q-lang'];
        answerTemplate = event.data['a-temp'];
        answerLang = event.data['a-lang'];
        resolve();
      }, {once: true});
    });
  } else {
    const urlOfDemoUnitJsonp = `./data/demo-unit-${appLang}.jsonp`;
    await new Promise(resolve => {
      requestJsonp(urlOfDemoUnitJsonp, data => {
        leadText = [
          data['l-text'] || '',
          `${data['l-text'] ? '<br>__<br>' : ''}`,
          `${stringResources['--the-source-of-this-unit']}: `,
          `<a href="${urlOfDemoUnitJsonp}">${urlOfDemoUnitJsonp}</a>`
        ].join('');
        questionTemplate = data['q-temp'];
        questionLang = data['q-lang'];
        answerTemplate = data['a-temp'];
        answerLang = data['a-lang'];
        resolve();
      });
    });
  }
  qs('#lead-body').innerHTML = leadText || '';
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

const _scrollPanel = (scrollY) => {
  let targetPanel;
  if (getFlag('show-settings')) {
    targetPanel = qs('#settings-panel');
  } else if (! getFlag('fold-lead')) {
    targetPanel = qs('#lead-panel');
  } else if (getFlag('uncover-answer')) {
    targetPanel = qs('#answer-panel');
  } else if (getFlag('uncover-question')) {
    targetPanel = qs('#question-panel');
  }
  targetPanel.scrollBy(0, scrollY);
};
const _showHint = (goBackwards) => {
  if (! getFlag('fold-lead') || getFlag('show-settings')) {
    return;
  }
  let variableElements;
  if (getFlag('uncover-answer')) {
    variableElements = qsa('.variable');
  } else {
    variableElements = qsa('#question-panel .variable');
  }
  if (! variableElements.length) {
    return;
  }
  let activeVariableElementIndex = (goBackwards ? variableElements.length : -1);
  for (let i = 0; i < variableElements.length; i++) {
    const currentVariableElement = variableElements[i];
    if (currentVariableElement.classList.contains('active')) {
      activeVariableElementIndex = i;
    }
  }
  const targetVariableElement = variableElements[activeVariableElementIndex + (goBackwards ? -1 : 1)];
  _setActiveElement(targetVariableElement);
};
const _switchSetting = (targetSettingKey) => {
  const currentValue = getSetting(targetSettingKey, 'string');
  const settingRadioElements = qsa(`[data-setting-key="${targetSettingKey}"]`);
  let currentIndex = -1;
  settingRadioElements.forEach((element, index) => {
    if (element.getAttribute('data-setting-value') == currentValue) {
      currentIndex = index;
    }
  });
  const nextIndex = (currentIndex + 1) % settingRadioElements.length;
  settingRadioElements.item(nextIndex).click();
}

const _setActiveElement = targetElement => {
  qsa('.active').forEach(element => {
    element.classList.remove('active');
  });
  if (targetElement) {
    targetElement.classList.add('active');
  }
};
const _switchPanel = () => {
  _setActiveElement(null);
  if (getFlag('disable-operation')) {
    return;
  }
  if (getFlag('show-settings')) {
    setFlag('show-settings', false);
  } else {
    setFlag('fold-lead', null);
  }
};
const _enableAutomaticSpeaking = (settingKey, noticeToSpeak) => {
  setSetting(settingKey, (! getSetting(settingKey, 'boolean')).toString());
  if (getSetting(settingKey, 'boolean')) {
    speak(noticeToSpeak, appLang, getSetting('voice-volume', 'number'));
  } else {
    window.speechSynthesis.cancel();
  }
};
const speakQuestion = () => {
  speak(
    questionPhrase.text,
    questionPhrase.lang,
    getSetting('voice-volume', 'number'),
    getSetting('question-voice-rate', 'number'),
    getSetting('question-voice-pitch', 'number'),
    getSetting('question-voice-number', 'number')
  );
};
const speakAnswer = () => {
  speak(
    answerPhrase.text,
    answerPhrase.lang,
    getSetting('voice-volume', 'number'),
    getSetting('answer-voice-rate', 'number'),
    getSetting('answer-voice-pitch', 'number'),
    getSetting('answer-voice-number', 'number')
  );
}


const _speakDrill = () => {
  if (getFlag('disable-operation')) {
    return;
  }
  if (! getFlag('fold-lead') || getFlag('show-settings')) {
    return;
  }
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    return;
  }
  if (getFlag('uncover-answer')) {
    speak(
      answerPhrase.text,
      answerPhrase.lang,
      getSetting('voice-volume', 'number'),
      getSetting('answer-voice-rate', 'number'),
      getSetting('answer-voice-pitch', 'number'),
      getSetting('answer-voice-number', 'number')
    );
  } else {
    speak(
      questionPhrase.text,
      questionPhrase.lang,
      getSetting('voice-volume', 'number'),
      getSetting('question-voice-rate', 'number'),
      getSetting('question-voice-pitch', 'number'),
      getSetting('question-voice-number', 'number')
    );
  }
};
const _playDrill = () => {
  _setActiveElement(null);
  if (getFlag('disable-operation')) {
    return;
  }
  if (getFlag('show-settings')) {
    setFlag('show-settings', false);
  } else if (! getFlag('fold-lead')) {
    setFlag('fold-lead', true);
  } else if (getFlag('uncover-answer')) {
    resetCard();
  } else {
    showAnswer();
  }
};
const _skipDrill = () => {
  _setActiveElement(null);
  if (getFlag('disable-operation')) {
    return;
  }
  if (getFlag('show-settings')) {
    setFlag('show-settings', false);
  } else if (! getFlag('fold-lead')) {
    setFlag('fold-lead', true);
  } else {
    resetCard();
  }
};
const _showSettings = () => {
  _setActiveElement(null);
  setFlag('show-settings', true);
};
const _hideSettings = () => {
  _setActiveElement(null);
  setFlag('show-settings', false);
}





const resetCard = async () => {
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
  setFlag('disable-operation', true);
  window.speechSynthesis.cancel();
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
  _addHintBalloons(qs('#question-panel'), answerPhrase.chosenVariableTexts);
  qs('#answer-panel').scrollTop = 0;
  qs('#answer-body').innerHTML = answerPhrase.html;
  _addHintBalloons(qs('#answer-panel'), questionPhrase.chosenVariableTexts);
  if (commonTimeoutDelay) {
    await setTimeout(commonTimeoutDelay / 2);
  } else {
    await setTimeout(500);
  }
  setFlag('uncover-question', true);
  if (commonTimeoutDelay) {
    await setTimeout(commonTimeoutDelay);
  }
  setFlag('disable-operation', false);
  if (getSetting('enable-automatic-question-speaking', 'boolean')) {
    qs('#speak-button').click();
  }


/*
  if (getFlag('enable-automatic-question-speaking')) {
    qs('#speak-button').click();
  }
*/
};
const showAnswer = async () => {
  setFlag('disable-operation', true);
  window.speechSynthesis.cancel();
  setFlag('uncover-answer', true);
  const transitionDuration = window.getComputedStyle(qs('#answer-cover')).transitionDuration;
  const commonTimeoutDelay = Number.parseFloat(transitionDuration) * (/ms$/.test(transitionDuration) ? 1 : 1000);
  if (commonTimeoutDelay) {
    await setTimeout(commonTimeoutDelay);
  }
  setFlag('disable-operation', false);
  if (getSetting('enable-automatic-answer-speaking', 'boolean')) {
    qs('#speak-button').click();
  }

/*
  if (getFlag('enable-automatic-answer-speaking')) {
    qs('#speak-button').click();
  }

*/

};
window.addEventListener('DOMContentLoaded', main);
