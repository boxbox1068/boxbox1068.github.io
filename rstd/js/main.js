'use strict';
let appLang;
let stringResources;
let templateVariableValues;
let questionPhrase;
let answerPhrase;
const main = async () => {
  appLang = {'en': 'en', 'ja': 'ja'}[window.navigator.language] || 'en';
  const urlOfStringResourcesJsonp = `./data/string-resources-${appLang}.jsonp`;
  await requestJsonp(urlOfStringResourcesJsonp).then(data => {
    stringResources = data;
  });
  document.title = stringResources['app-title'];
  qsa('.placeholder').forEach(element => {
    const resourceKey = element.dataset.resourceKey;
    element.innerHTML = stringResources[resourceKey];
  });
  setSetting('disable-animation', getSetting('disable-animation') || 'false');
  setSetting('animation-duration', getSetting('animation-duration') || '500');
  setSetting('disable-option-highlight', getSetting('disable-option-highlight') || 'false');
  setSetting('disable-hint-balloon', getSetting('disable-hint-balloon') || 'false');
  setSetting('disable-swipe-to-left', getSetting('disable-swipe-to-left') || 'false');
  setSetting('common-voice-volume', getSetting('common-voice-volume') || '1');
  setSetting('app-voice-number', getSetting('app-voice-number') || '1');
  setSetting('question-voice-number', getSetting('question-voice-number') || '1');
  setSetting('question-voice-rate', getSetting('question-voice-rate') || '1');
  setSetting('question-voice-pitch', getSetting('question-voice-pitch') || '1');
  setSetting('answer-voice-number', getSetting('answer-voice-number') || '1');
  setSetting('answer-voice-rate', getSetting('answer-voice-rate') || '1');
  setSetting('answer-voice-pitch', getSetting('answer-voice-pitch') || '1');
  qs('#fold-lead-button').addEventListener('click', event => {
    if (getFlag('is-setings-shown')) {
      return;
    }
    setFlag('is-lead-folded', null);
  });
  qs('#enable-automatic-question-speaking-button').addEventListener('click', event => {
    if (! getFlag('is-lead-folded') || getFlag('is-settings-shown')) {
      return;
    }
    setFlag('is-automatic-question-speaking-enabled', null);
    if (getFlag('is-automatic-question-speaking-enabled')) {
      speak(
        stringResources['automatic-question-speaking-enabled-notice'],
        appLang,
        getSetting('common-voice-volume', 'number'),
        getSetting('app-voice-number', 'number')
      );
    } else {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    }
  });
  qs('#enable-automatic-answer-speaking-button').addEventListener('click', event => {
    if (! getFlag('is-lead-folded') || getFlag('is-settings-shown')) {
      return;
    }
    setFlag('is-automatic-answer-speaking-enabled', null);
    if (getFlag('is-automatic-answer-speaking-enabled')) {
      speak(
        stringResources['automatic-answer-speaking-enabled-notice'],
        appLang,
        getSetting('common-voice-volume', 'number'),
        getSetting('app-voice-number', 'number')
      );
    } else {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    }
  });
  qs('#speak-button').addEventListener('click', event => {
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
        getSetting('answer-voice-number', 'number'),
        getSetting('answer-voice-rate', 'number'),
        getSetting('answer-voice-pitch', 'number')
      );
    } else {
      speak(
        questionPhrase.text,
        questionPhrase.lang,
        getSetting('common-voice-volume', 'number'),
        getSetting('question-voice-number', 'number'),
        getSetting('question-voice-rate', 'number'),
        getSetting('question-voice-pitch', 'number')
      );
    }
  });
  qs('#play-button').addEventListener('click', event => {
    if (! getFlag('is-lead-folded') || getFlag('is-settings-shown')) {
      return;
    }
    if (getFlag('is-answer-shown')) {
      resetCard();
    } else {
      showAnswer();
    }
  });
  qs('#skip-button').addEventListener('click', event => {
    if (! getFlag('is-lead-folded') || getFlag('is-settings-shown')) {
      return;
    }
    resetCard();
  });
  qs('#show-settings-button').addEventListener('click', event => {
    setFlag('is-settings-shown', true);
  });
  qs('#visit-home-button').addEventListener('click', event => {
    window.location.href = 'https://twitter.com/shikaku1068/';
  });
  addKeyDownListener(qs('body'), 'Escape', targetKey => {
    qs('#fold-lead-button').click();
  });
  addKeyDownListener(qs('body'), 'Enter', targetKey => {
    qs('#speak-button').click();
  });
  addKeyDownListener(qs('body'), ' ', targetKey => {
    if (getFlag('is-lead-folded')) {
      qs('#play-button').click();
    } else {
      qs('#fold-lead-button').click();
    }
  });
  addKeyDownListener(qs('body'), 'Tab', targetKey => {
    if (getFlag('is-lead-folded')) {
      qs('#skip-button').click();
    } else {
      qs('#fold-lead-button').click();
    }
  });
  addKeyDownListener(qs('body'), ['l', 'L'], targetKey => {
    if (getFlag('is-setting-shown')) {
      return;
    }
    let scrollY;
    if (getFlag('is-lead-folded')) {
      scrollY = {'l': 25, 'L': -25}[targetKey];
    } else {
      scrollY = {'l': 50, 'L': -50}[targetKey];
    }
    qs('#lead-panel').scrollBy(0, scrollY);
  });
  addKeyDownListener(qs('body'), ['q', 'Q'], targetKey => {
    if (! getFlag('is-lead-folded') || getFlag('is-setting-shown')) {
      return;
    }
    const scrollY = {'q': 50, 'Q': -50}[targetKey];
    qs('#question-panel').scrollBy(0, scrollY);
  });
  addKeyDownListener(qs('body'), ['a', 'A'], targetKey => {
    if (! getFlag('is-lead-folded') || getFlag('is-setting-shown')) {
      return;
    }
    const scrollY = {'a': 50, 'A': -50}[targetKey];
    qs('#answer-panel').scrollBy(0, scrollY);
  });
  addKeyDownListener(qs('body'), ['h', 'H'], targetKey => {
    if (! getFlag('is-lead-folded') || getFlag('is-setting-shown')) {
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
    const reverse = {'h': false, 'H': true}[targetKey];
    let activeOptionElementIndex = (reverse ? optionElements.length : -1);
    for (let i = 0; i < optionElements.length; i++) {
      const currentOptionElement = optionElements[i];
      if (currentOptionElement.classList.contains('active')) {
        activeOptionElementIndex = i;
      }
    }
    const targetOptionElement = optionElements[activeOptionElementIndex + (reverse ? -1 : 1)];
    setActiveElement(targetOptionElement);
  });
  addSwipeListener(qs('body'), 25, () => {
    if (getFlag('is-lead-folded')) {
      qs('#play-button').click();
    } else {
      qs('#fold-lead-button').click();
    }
  });
  addSwipeListener(qs('body'), -25, () => {
    if (! getFlag('enable-skip-by-swipe')) {
      return;
    }
    if (getFlag('is-lead-folded')) {
      qs('#skip-button').click();
    } else {
      qs('#fold-lead-button').click();
    }
  });
  addDoubleTapListener(qs('body'), 250, () => {
    qs('#speak-button').click();
  });





  ['mousemove', 'touchstart'].forEach(eventType => {
    qs('body').addEventListener(eventType, event => {
      qsa('.active').forEach(element => element.classList.remove('active'));
      event.target.classList.add('active');
    }, {capture: true});  
  });


  await requestJsonp('./data/rabbit-variables.jsonp').then(data => {
    templateVariableValues = data;
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
    await waitMessage().then(data => {
      leadText = data['l-text'];
      questionTemplate = data['q-temp'];
      questionLang = data['q-lang'];
      answerTemplate = data['a-temp'];
      answerLang = data['a-lang'];
    });
  } else {
    const urlOfDrillsDemoJsonp = `./data/drills-demo-${appLang}.jsonp`;
    await requestJsonp(urlOfDrillsDemoJsonp).then(data => {
      leadText = data['l-text'];
      questionTemplate = data['q-temp'];
      questionLang = data['q-lang'];
      answerTemplate = data['a-temp'];
      answerLang = data['a-lang'];
    });
  }
  qs('#lead-body').innerHTML = leadText || '';
  await new Promise((resolve, reject) => {
    qs('#fold-lead-button').addEventListener('click', event => {
      resolve();
    }, {once: true});
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
  disableButtons();
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
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
  addHintBalloons(qs('#question-panel'), answerPhrase.chosenOptionTexts, answerPhrase.lang);
  qs('#answer-panel').scrollTop = 0;
  qs('#answer-body').innerHTML = answerPhrase.html;
  addHintBalloons(qs('#answer-panel'), questionPhrase.chosenOptionTexts, questionPhrase.lang);
  if (commonTimeoutDelay) {
    await setTimeout(commonTimeoutDelay / 2);
  }
  qs('#question-cover').style.left = '-100%';
  if (commonTimeoutDelay) {
    await setTimeout(commonTimeoutDelay);
  }
  setFlag('is-question-shown', true);
  setFlag('is-answer-shown', false);
  enableButtons();
  if (getFlag('is-automatic-question-speaking-enabled')) {
    qs('#speak-button').click();
  }
};
const showAnswer = async () => {
  disableButtons();
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
  qs('#answer-cover').style.left = '100%';
  const transitionDuration = window.getComputedStyle(qs('#answer-cover')).transitionDuration;
  const commonTimeoutDelay = Number.parseFloat(transitionDuration) * (/ms$/.test(transitionDuration) ? 1 : 1000);
  if (commonTimeoutDelay) {
    await setTimeout(commonTimeoutDelay);
  }
  setFlag('is-answer-shown', true);
  enableButtons();
  if (getFlag('is-automatic-answer-speaking-enabled')) {
    qs('#speak-button').click();
  }
};
const addHintBalloons = (parentPanelElement, hintTextList, hintLang) => {
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
    const hintBalloonBodyElement = dce('span');
    hintBalloonBodyElement.className = 'hint-balloon-body';
    hintBalloonBodyElement.innerText = hintText;
    const hintBalloonPanelElement = dce('span');
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
const setActiveElement = targetElement => {
  qsa('.active').forEach(element => {
    element.classList.remove('active');
  });
  if (! targetElement) {
    return;
  }
  targetElement.classList.add('active');
};
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
const speak = (text, lang, volume, number, rate, pitch) => {
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
    if (number) {
      index = number % candidateVoices.length;
    } else {
      index = Math.floor(candidateVoices.length * Math.random());
    }
    utterance.voice = candidateVoices[index];
  }
  window.speechSynthesis.speak(utterance);
};
window.addEventListener('DOMContentLoaded', main);
