'use strict';
let appLang;
let stringResouces;
let templateVariableValues;
let questionPhrase;
let answerPhrase;
const main = async () => {
  appLang = {'en': 'en', 'ja': 'ja'}[window.navigator.language] || 'en';
  const urlOfStringResoucesJsonp = `./data/string-resouces-${appLang}.jsonp`;
  await requestJsonp(urlOfStringResoucesJsonp).then(data => {
    stringResouces = data;
  });
  document.title = stringResouces['app-title'];
  qsa('[lang]').forEach(element => {
    element.lang != appLang && element.remove();
  });
  qs('#visit-home-button').addEventListener('click', event => {
    window.location.href = 'https://twitter.com/shikaku1068/';
  });
  qs('#show-settings-button').addEventListener('click', event => {
    setFlag('is-settings-shown', true);
  });
  setSetting('disable-animation', getSetting('disable-animation') || 'false');
  setSetting('animation-duration', getSetting('animation-duration') || '500');
  setSetting('disable-option-highlight', getSetting('disable-option-highlight') || 'false');
  setSetting('disable-hint-balloon', getSetting('disable-hint-balloon') || 'false');
  setSetting('disable-swipe-to-left', getSetting('disable-swipe-to-left') || 'false');
  setSetting('voice-volume', getSetting('voice-volume') || '1');
  setSetting('app-voice-number', getSetting('app-voice-number') || '1');
  setSetting('question-voice-number', getSetting('question-voice-number') || '1');
  setSetting('question-voice-rate', getSetting('question-voice-rate') || '1');
  setSetting('question-voice-pitch', getSetting('question-voice-pitch') || '1');
  setSetting('answer-voice-number', getSetting('answer-voice-number') || '1');
  setSetting('answer-voice-rate', getSetting('answer-voice-rate') || '1');
  setSetting('answer-voice-pitch', getSetting('answer-voice-pitch') || '1');
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
  const preprocessedQuestionTemplate = expandVariables(questionTemplate, templateVariableValues);
  questionPhrase = new RabbitPhrase(preprocessedQuestionTemplate, questionLang);
  const preprocessedAnswerTemplate = expandVariables(answerTemplate, templateVariableValues);
  answerPhrase = new RabbitPhrase(preprocessedAnswerTemplate, answerLang);
  qs('#lead-body').innerHTML = leadText || '';
  qs('#fold-lead-button').addEventListener('click', event => {
    setFlag('is-lead-folded', null);
  });
  await new Promise((resolve, reject) => {
    qs('#fold-lead-button').addEventListener('click', event => {
      resolve();
    }, {once: true});
    if (! leadText) {
      qs('#fold-lead-button').click();
      qs('#fold-lead-button').disabled = true;
    }
  });
  qs('#enable-automatic-question-reading-button').addEventListener('click', event => {
    setFlag('is-automatic-question-reading-enabled', null);
    if (getFlag('is-automatic-question-reading-enabled')) {
      const text = {
        'en': 'Automatic question reading enabled.',
        'ja': '問題の自動読み上げ、オン。'
      }[appLang];
      readAloud(text, appLang, getSetting('voice-volume', 'number'), 1, 1);
    } else {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    }
  });
  qs('#enable-automatic-answer-reading-button').addEventListener('click', event => {
    setFlag('is-automatic-answer-reading-enabled', null);
    if (getFlag('is-automatic-answer-reading-enabled')) {
      const text = {
        'en': 'Automatic answer reading enabled.',
        'ja': '答えの自動読み上げ、オン。'
      }[appLang];
      readAloud(text, appLang, getSetting('voice-volume', 'number'), 1, 1);
    } else {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    }
  });
  qs('#read-aloud-button').addEventListener('click', event => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    } else {
      if (getFlag('is-answer-shown')) {
        readAloud(
          answerPhrase.text,
          answerPhrase.lang,
          getSetting('voice-volume', 'number'),
          getSetting('answer-voice-rate', 'number'),
          getSetting('answer-voice-pitch', 'number')
        );
      } else {
        readAloud(
          questionPhrase.text,
          questionPhrase.lang,
          getSetting('voice-volume', 'number'),
          getSetting('question-voice-rate', 'number'),
          getSetting('question-voice-pitch', 'number')
        );
      }
    }
  });
  qs('#play-button').addEventListener('click', event => {
    if (getFlag('is-answer-shown')) {
      resetCard();
    } else {
      showAnswer();
    }
  });
  qs('#skip-button').addEventListener('click', event => {
    resetCard();
  });
  setFlag('is-lead-folded', true);
  resetCard();
};
const initializeOperation = () => {
  ['mousemove', 'touchstart'].forEach(eventType => {
    qs('body').addEventListener(eventType, event => {
      qsa('.active').forEach(element => element.classList.remove('active'));
      event.target.classList.add('active');
    }, {capture: true});  
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
    qs('#read-aloud-button').click();
  });
  addKeyDownListener(qs('body'), ' ', targetKey => {
    qs('#play-button').click();
  });
  addKeyDownListener(qs('body'), 'Tab', targetKey => {
    qs('#skip-button').click();
  });
  addKeyDownListener(qs('body'), 'Enter', targetKey => {
    qs('#read-aloud-button').click();
  });
  addKeyDownListener(qs('body'), 'Escape', targetKey => {
    qs('#fold-lead-button').click();
  });
  ['l', 'L'].forEach(targetKey => {
    const scrollY = {'l': 50, 'L': -50}[targetKey];
    addKeyDownListener(qs('body'), targetKey, targetKey => {
      qs('#lead-panel').scrollBy(0, scrollY);
    });
  });
  ['q', 'Q'].forEach(targetKey => {
    const scrollY = {'q': 50, 'Q': -50}[targetKey];
    addKeyDownListener(qs('body'), targetKey, targetKey => {
      qs('#question-panel').scrollBy(0, scrollY);
    });
  });
  ['a', 'A'].forEach(targetKey => {
    const scrollY = {'a': 50, 'A': -50}[targetKey];
    addKeyDownListener(qs('body'), targetKey, targetKey => {
      qs('#answer-panel').scrollBy(0, scrollY);
    });
  });
  ['h', 'H'].forEach(targetKey => {
    const reverse = {'h': false, 'H': true}[targetKey];
    addKeyDownListener(qs('body'), targetKey, targetKey => {
      const optionElements = qsa('.option');
      if (! optionElements.length) {
        return;
      }
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
  });
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
  const statisticsText = expandVariables(stringResouces['statistics-text'], statisticVariableValues);
  qs('#statistics-body').innerHTML = statisticsText;
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
  if (getFlag('is-automatic-question-reading-enabled')) {
    qs('#read-aloud-button').click();
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
  if (getFlag('is-automatic-answer-reading-enabled')) {
    qs('#read-aloud-button').click();
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
  qs('#read-aloud-button').disabled = true;
  qs('#play-button').disabled = true;
  qs('#skip-button').disabled = true;
};
const enableButtons = () => {
  qs('#read-aloud-button').disabled = false;
  qs('#play-button').disabled = false;
  qs('#skip-button').disabled = false;
};
const readAloud = (text, lang, volume, rate, pitch) => {
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
    const index = Math.floor(candidateVoices.length * Math.random());
    utterance.voice = candidateVoices[index];
  }
  window.speechSynthesis.speak(utterance);
};
window.addEventListener('DOMContentLoaded', main);
