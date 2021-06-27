'use strict';
let appLang;
let stringResources;
let templateVariableValues;
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
  qsa('.placeholder').forEach(element => {
    const resourceKey = element.dataset.resourceKey;
    element.innerHTML = stringResources[resourceKey];
  });
  loadSetting('animation-duration', '500');
  loadSetting('disable-option-highlight', 'false');
  loadSetting('disable-hint-balloon', 'false');
  loadSetting('enable-swipe-to-right', 'true');
  loadSetting('common-voice-volume', '1');
  loadSetting('app-voice-number', '1');
  loadSetting('question-voice-number', '1');
  loadSetting('question-voice-rate', '1');
  loadSetting('question-voice-pitch', '1');
  loadSetting('answer-voice-number', '1');
  loadSetting('answer-voice-rate', '1');
  loadSetting('answer-voice-pitch', '1');
  const _setActiveElement = targetElement => {
    qsa('.active').forEach(element => {
      element.classList.remove('active');
    });
    if (targetElement) {
      targetElement.classList.add('active');
    }
  };
  const _switch = () => {
    _setActiveElement(null);
    if (getFlag('are-controls-disabled')) {
      return;
    }
    if (getFlag('is-setings-shown')) {
      setFlag('is-settings-shown', false);
    } else {
      setFlag('is-lead-folded', null);
    }
  };
  const _speak = () => {
    if (getFlag('are-controls-disabled')) {
      return;
    }
    if (! getFlag('is-lead-folded') || getFlag('is-settings-shown')) {
      return;
    }
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      return;
    }
    if (getFlag('is-answer-shown')) {
      speak(
        answerPhrase.text,
        answerPhrase.lang,
        getSetting('common-voice-volume', 'number'),
        getSetting('answer-voice-rate', 'number'),
        getSetting('answer-voice-pitch', 'number'),
        getSetting('answer-voice-number', 'number')
      );
    } else {
      speak(
        questionPhrase.text,
        questionPhrase.lang,
        getSetting('common-voice-volume', 'number'),
        getSetting('question-voice-rate', 'number'),
        getSetting('question-voice-pitch', 'number'),
        getSetting('question-voice-number', 'number')
      );
    }
  };
  const _play = () => {
    _setActiveElement(null);
    if (getFlag('are-controls-disabled')) {
      return;
    }
    if (getFlag('is-settings-shown')) {
      setFlag('is-settings-shown', false);
    } else if (! getFlag('is-lead-folded')) {
      setFlag('is-lead-folded', true);
    } else if (getFlag('is-answer-shown')) {
      resetCard();
    } else {
      showAnswer();
    }
  };
  const _skip = () => {
    _setActiveElement(null);
    if (getFlag('are-controls-disabled')) {
      return;
    }
    if (getFlag('is-settings-shown')) {
      setFlag('is-settings-shown', false);
    } else if (! getFlag('is-lead-folded')) {
      setFlag('is-lead-folded', true);
    } else {
      resetCard();
    }
  };
  const _showSettings = () => {
    _setActiveElement(null);
    setFlag('is-settings-shown', true);
  };
  const _visitHome = () => {
    window.location.href = 'https://twitter.com/shikaku1068/';
  };
  const _scrollPanel = (targetPanel, scrollY) => {
    if (! isForefrontElement(targetPanel)) {
      return;
    }
    targetPanel.scrollBy(0, scrollY);
  };
  const _showHint = (goBackwards) => {
    if (! getFlag('is-lead-folded') || getFlag('is-settings-shown')) {
      return;
    }
    let optionElements;
    if (getFlag('is-answer-shown')) {
      optionElements = qsa('.option');
    } else {
      optionElements = qsa('#question-panel .option');
    }
    if (! optionElements.length) {
      return;
    }
    let activeOptionElementIndex = (goBackwards ? optionElements.length : -1);
    for (let i = 0; i < optionElements.length; i++) {
      const currentOptionElement = optionElements[i];
      if (currentOptionElement.classList.contains('active')) {
        activeOptionElementIndex = i;
      }
    }
    const targetOptionElement = optionElements[activeOptionElementIndex + (goBackwards ? -1 : 1)];
    _setActiveElement(targetOptionElement);
  };
  qs('#fold-lead-button').addEventListener('click', event => {
    _switch();
  });
  qs('#enable-automatic-question-speaking-button').addEventListener('click', event => {
    if (! getFlag('is-lead-folded') || getFlag('is-settings-shown')) {
      return;
    }
    setFlag('is-automatic-question-speaking-enabled', null);
    if (getFlag('is-automatic-question-speaking-enabled')) {
      speak(
        stringResources['-automatic-question-speaking-enabled'],
        appLang,
        getSetting('common-voice-volume', 'number'),
        1,
        1,
        getSetting('app-voice-number', 'number')
      );
    } else {
      window.speechSynthesis.cancel();
    }
  });
  qs('#enable-automatic-answer-speaking-button').addEventListener('click', event => {
    if (! getFlag('is-lead-folded') || getFlag('is-settings-shown')) {
      return;
    }
    setFlag('is-automatic-answer-speaking-enabled', null);
    if (getFlag('is-automatic-answer-speaking-enabled')) {
      speak(
        stringResources['-automatic-answer-speaking-enabled'],
        appLang,
        1,
        1,
        getSetting('app-voice-number', 'number'),
        getSetting('common-voice-volume', 'number')
      );
    } else {
      window.speechSynthesis.cancel();
    }
  });
  qs('#speak-button').addEventListener('click', event => {
    _speak();
  });
  qs('#play-button').addEventListener('click', event => {
    _play();
  });
  qs('#skip-button').addEventListener('click', event => {
    _skip();
  });
  qs('#show-settings-button').addEventListener('click', event => {
    _showSettings();
  });
  qs('#visit-home-button').addEventListener('click', event => {
    _visitHome();
  });
  addKeyDownListener(qs('body'), 'Escape', targetKey => {
    _switch();
  });
  addKeyDownListener(qs('body'), 'ArrowUp', targetKey => {
    _switch();
  });
  addKeyDownListener(qs('body'), 'Enter', targetKey => {
    _speak();
  });
  addKeyDownListener(qs('body'), 'ArrowLeft', targetKey => {
    _speak();
  });
  addKeyDownListener(qs('body'), ' ', targetKey => {
    _play();
  });
  addKeyDownListener(qs('body'), 'ArrowRight', targetKey => {
    _play();
  });
  addKeyDownListener(qs('body'), 'Tab', targetKey => {
    _skip();
  });
  addKeyDownListener(qs('body'), 'ArrowDown', targetKey => {
    _skip();
  });
  addKeyDownListener(qs('body'), 'l', targetKey => {
    _scrollPanel(qs('#lead-panel'), getFlag('is-lead-folded') ? 25 : 50);
  });
  addKeyDownListener(qs('body'), 'L', targetKey => {
    _scrollPanel(qs('#lead-panel'), getFlag('is-lead-folded') ? -25 : -50);
  });
  addKeyDownListener(qs('body'), 'q', targetKey => {
    _scrollPanel(qs('#question-panel'), 50);
  });
  addKeyDownListener(qs('body'), 'Q', targetKey => {
    _scrollPanel(qs('#question-panel'), -50);
  });
  addKeyDownListener(qs('body'), 'a', targetKey => {
    _scrollPanel(qs('#answer-panel'), 50);
  });
  addKeyDownListener(qs('body'), 'A', targetKey => {
    _scrollPanel(qs('#answer-panel'), -50);
  });
  addKeyDownListener(qs('body'), 'h', targetKey => {
    _showHint(false);
  });
  addKeyDownListener(qs('body'), 'H', targetKey => {
    _showHint(true);
  });
  addSwipeListener(qs('body'), -25, () => {
    _play();
  });
  addSwipeListener(qs('body'), 25, () => {
    _skip();
  });
  addDoubleTapListener(qs('body'), 250, () => {
    _speak();
  });
  qs('body').addEventListener('mousemove', event => {
    _setActiveElement(event.target);
  }, {capture: true});  
  qs('body').addEventListener('touchstart', event => {
    _setActiveElement(event.target);
  }, {capture: true});  
  await new Promise(resolve => {
    requestJsonp('./data/rabbit-variables.jsonp', data => {
      templateVariableValues = data;
      resolve();
    });
  });
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
    const urlOfDrillsDemoJsonp = `./data/drills-demo-${appLang}.jsonp`;
    await new Promise(resolve => {
      requestJsonp(urlOfDrillsDemoJsonp, data => {
        leadText = [
          data['l-text'] || '',
          `${data['l-text'] ? '<br>__<br>' : ''}`,
          `${stringResources['-the-source-of-this-session']}: `,
          `<a href="${urlOfDrillsDemoJsonp}">${urlOfDrillsDemoJsonp}</a>`
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
      if (key == 'is-lead-folded' && value) {
        setFlag.listener = null;
        resolve();
      }
    }
    if (! leadText) {
      qs('#fold-lead-button').click();
      qs('#fold-lead-button').disabled = true;
    }
  });
  const preprocessedQuestionTemplate = expandVariables(questionTemplate, templateVariableValues);
  questionPhrase = new RabbitPhrase(preprocessedQuestionTemplate, questionLang);
  const preprocessedAnswerTemplate = expandVariables(answerTemplate, templateVariableValues);
  answerPhrase = new RabbitPhrase(preprocessedAnswerTemplate, answerLang);
  resetCard();
};
const resetCard = async () => {
  setFlag('are-controls-disabled', true);
  window.speechSynthesis.cancel();
  qs('#question-cover').style.left = '0';
  qs('#answer-cover').style.left = '0';
  const transitionDuration = window.getComputedStyle(qs('#question-cover')).transitionDuration;
  const commonTimeoutDelay = Number.parseFloat(transitionDuration) * (/ms$/.test(transitionDuration) ? 1 : 1000);
  if (commonTimeoutDelay) {
    await setTimeout(commonTimeoutDelay);
  }
  const pathIdSeed = Math.random();
  questionPhrase.reset(pathIdSeed);
  answerPhrase.reset(pathIdSeed);
  const statisticVariableValues = {
    'pattern-count': questionPhrase.possiblePathCount.toLocaleString(),
    'pattern-id': questionPhrase.pathId.toLocaleString(),
    'refill-count': (questionPhrase.resetCount - 1).toLocaleString()
  };
  const statisticsOutput = expandVariables(stringResources['statistics-output'], statisticVariableValues);
  qs('#statistics-body').innerHTML = statisticsOutput;
  qs('#question-panel').scrollTop = 0;
  qs('#question-body').innerHTML = questionPhrase.html;
  addHintBalloons(qs('#question-panel'), answerPhrase.chosenOptionTexts);
  qs('#answer-panel').scrollTop = 0;
  qs('#answer-body').innerHTML = answerPhrase.html;
  addHintBalloons(qs('#answer-panel'), questionPhrase.chosenOptionTexts);
  if (commonTimeoutDelay) {
    await setTimeout(commonTimeoutDelay / 2);
  } else {
    await setTimeout(500);
  }
  qs('#question-cover').style.left = '-100%';
  if (commonTimeoutDelay) {
    await setTimeout(commonTimeoutDelay);
  }
  setFlag('is-question-shown', true);
  setFlag('is-answer-shown', false);
  setFlag('are-controls-disabled', false);
  if (getFlag('is-automatic-question-speaking-enabled')) {
    qs('#speak-button').click();
  }
};
const showAnswer = async () => {
  setFlag('are-controls-disabled', true);
  window.speechSynthesis.cancel();
  qs('#answer-cover').style.left = '100%';
  const transitionDuration = window.getComputedStyle(qs('#answer-cover')).transitionDuration;
  const commonTimeoutDelay = Number.parseFloat(transitionDuration) * (/ms$/.test(transitionDuration) ? 1 : 1000);
  if (commonTimeoutDelay) {
    await setTimeout(commonTimeoutDelay);
  }
  setFlag('is-answer-shown', true);
  setFlag('are-controls-disabled', false);
  if (getFlag('is-automatic-answer-speaking-enabled')) {
    qs('#speak-button').click();
  }
};
const addHintBalloons = (parentPanelElement, hintTextList) => {
  const setHintBalloonPosition = optionElement => {
    const hintBalloonPanelElement = optionElement.querySelector('.hint-balloon-panel');
    const optionRect = optionElement.getClientRects()[0];
    hintBalloonPanelElement.style.top = `${optionRect.top}px`;
    hintBalloonPanelElement.style.left = `${optionRect.left}px`;
  };
  const updateHintBalloonPositions = () => {
    const targetOptionElements = parentPanelElement.querySelectorAll('.option');
    for (const optionElement of targetOptionElements) {
      setHintBalloonPosition(optionElement);
    }
  };
  const targetOptionElements = parentPanelElement.querySelectorAll('.option');
  for (const optionElement of targetOptionElements) {
    const optionNumber = Number(optionElement.dataset.optionNumber);
    const hintText = hintTextList[optionNumber];
    const hintBalloonBodyElement = ce('span');
    hintBalloonBodyElement.className = 'hint-balloon-body';
    hintBalloonBodyElement.innerText = hintText;
    const hintBalloonPanelElement = ce('span');
    hintBalloonPanelElement.className = 'hint-balloon-panel';
    hintBalloonPanelElement.append(hintBalloonBodyElement);
    optionElement.append(hintBalloonPanelElement);
    const hintBalloonRight = optionElement.getClientRects()[0].left + hintBalloonPanelElement.offsetWidth;
    const hintBalloonContentMarginLeft = Math.min(0, document.body.offsetWidth - hintBalloonRight);
    hintBalloonBodyElement.style.marginLeft = `${hintBalloonContentMarginLeft}px`;
    setHintBalloonPosition(optionElement);
  }
  parentPanelElement.addEventListener('scroll', updateHintBalloonPositions);
  window.addEventListener('resize', updateHintBalloonPositions);
}
const disableButtons = () => {
  qs('#speak-button').disabled = true;
  qs('#play-button').disabled = true;
  qs('#skip-button').disabled = true;
};
const enableButtons = () => {
  qs('#speak-button').disabled = false;
  qs('#play-button').disabled = false;
  qs('#skip-button').disabled = false;
};
const speak = (text, lang, volume, rate, pitch, voiceNumber) => {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance();
  utterance.text = text || '';
  utterance.lang = lang || 'en';
  utterance.volume = volume || 1;
  utterance.rate = rate || 1;
  utterance.pitch = pitch || 1;
  const candidateVoices = [];
  for (const voice of window.speechSynthesis.getVoices()) {
    if (new RegExp(`^${lang}`, 'i').test(voice.lang)) {
      candidateVoices.push(voice);
    }
  }
  if (candidateVoices.length) {
    let index;
    if (voiceNumber) {
      index = (voiceNumber - 1) % candidateVoices.length;
    } else {
      index = Math.floor(candidateVoices.length * Math.random());
    }
    utterance.voice = candidateVoices[index];
  }
  window.speechSynthesis.speak(utterance);
};
window.addEventListener('DOMContentLoaded', main);
