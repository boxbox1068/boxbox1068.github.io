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
  dqsa('[lang]').forEach(element => {
    element.lang != appLang && element.remove();
  });
  dqs('#visit-home-button').addEventListener('click', event => {
    window.location.href = 'https://twitter.com/shikaku1068/';
  });
  dqs('#show-settings-button').addEventListener('click', event => {
    setFlag('is-settings-shown', true);
  });
  setSetting('disable-animation', getSetting('disable-animation') || 'false');
  setSetting('animation-duration', getSetting('animation-duration') || '500');
  setSetting('disable-option-highlight', getSetting('disable-option-highlight') || 'false');
  setSetting('disable-hint-balloon', getSetting('disable-hint-balloon') || 'false');
  setSetting('disable-swipe-to-left', getSetting('disable-swipe-to-left') || 'false');
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
  const preprocessedQuestionTemplate = expandVariablesInString(questionTemplate, templateVariableValues);
  questionPhrase = new RabbitPhrase(preprocessedQuestionTemplate, questionLang);
  const preprocessedAnswerTemplate = expandVariablesInString(answerTemplate, templateVariableValues);
  answerPhrase = new RabbitPhrase(preprocessedAnswerTemplate, answerLang);
  dqs('#lead-body').innerHTML = leadText || '';
  dqs('#fold-lead-button').addEventListener('click', event => {
    dqs('#fold-lead-button').addEventListener('click', event => {
      setFlag('is-lead-folded', null);
    });
    dqs('#enable-automatic-question-reading-button').addEventListener('click', event => {
      setFlag('is-automatic-question-reading-enabled', null);
      if (getFlag('is-automatic-question-reading-enabled')) {
        const text = {
          'en': 'Automatic question reading enabled.',
          'ja': '問題の自動読み上げ、オン。'
        }[appLang];
        readAloud(text, appLang);
      } else {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }
      }
    });
    dqs('#enable-automatic-answer-reading-button').addEventListener('click', event => {
      setFlag('is-automatic-answer-reading-enabled', null);
      if (getFlag('is-automatic-answer-reading-enabled')) {
        const text = {
          'en': 'Automatic answer reading enabled.',
          'ja': '答えの自動読み上げ、オン。'
        }[appLang];
        readAloud(text, appLang);
      } else {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }
      }
    });
    dqs('#read-aloud-button').addEventListener('click', event => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      } else {
        if (getFlag('is-answer-shown')) {
          readAloud(answerPhrase.text, answerPhrase.lang);
        } else {
          readAloud(questionPhrase.text, questionPhrase.lang);
        }
      }
    });
    dqs('#play-button').addEventListener('click', event => {
      if (getFlag('is-answer-shown')) {
        resetCard();
      } else {
        showAnswer();
      }
    });
    dqs('#skip-button').addEventListener('click', event => {
      resetCard();
    });
    setFlag('is-lead-folded', true);
//    resetCard();
    window.setTimeout(() => {resetCard();}, 500);
    //    window.setTimeout(() => resetCard(), 500);
  }, {once: true});
  if (! leadText) {
    dqs('#fold-lead-button').click();
    dqs('#fold-lead-button').disabled = true;
  }
};
const initializeOperation = () => {
  ['mousemove', 'touchstart'].forEach(eventType => {
    dqs('body').addEventListener(eventType, event => {
      dqsa('.active').forEach(element => element.classList.remove('active'));
      event.target.classList.add('active');
    }, {capture: true});  
  });
  addSwipeListener(dqs('body'), 25, () => {
    if (getFlag('is-lead-folded')) {
      dqs('#play-button').click();
    } else {
      dqs('#fold-lead-button').click();
    }
  });
  addSwipeListener(dqs('body'), -25, () => {
    if (! getFlag('enable-skip-by-swipe')) {
      return;
    }
    if (getFlag('is-lead-folded')) {
      dqs('#skip-button').click();
    } else {
      dqs('#fold-lead-button').click();
    }
  });
  addDoubleTapListener(dqs('body'), 250, () => {
    dqs('#read-aloud-button').click();
  });
  addKeyDownListener(dqs('body'), ' ', targetKey => {
    dqs('#play-button').click();
  });
  addKeyDownListener(dqs('body'), 'Tab', targetKey => {
    dqs('#skip-button').click();
  });
  addKeyDownListener(dqs('body'), 'Enter', targetKey => {
    dqs('#read-aloud-button').click();
  });
  addKeyDownListener(dqs('body'), 'Escape', targetKey => {
    dqs('#fold-lead-button').click();
  });
  ['l', 'L'].forEach(targetKey => {
    const scrollY = {'l': 50, 'L': -50}[targetKey];
    addKeyDownListener(dqs('body'), targetKey, targetKey => {
      dqs('#lead-panel').scrollBy(0, scrollY);
    });
  });
  ['q', 'Q'].forEach(targetKey => {
    const scrollY = {'q': 50, 'Q': -50}[targetKey];
    addKeyDownListener(dqs('body'), targetKey, targetKey => {
      dqs('#question-panel').scrollBy(0, scrollY);
    });
  });
  ['a', 'A'].forEach(targetKey => {
    const scrollY = {'a': 50, 'A': -50}[targetKey];
    addKeyDownListener(dqs('body'), targetKey, targetKey => {
      dqs('#answer-panel').scrollBy(0, scrollY);
    });
  });
  ['h', 'H'].forEach(targetKey => {
    const reverse = {'h': false, 'H': true}[targetKey];
    addKeyDownListener(dqs('body'), targetKey, targetKey => {
      const optionElements = dqsa('.option');
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
  window.speechSynthesis.speaking && window.speechSynthesis.cancel();
  const pathIdSeed = Math.random();
  questionPhrase.reset(pathIdSeed);
  answerPhrase.reset(pathIdSeed);
  const variableValues = {
    'pattern-count': questionPhrase.possiblePathCount.toLocaleString(),
    'pattern-id': questionPhrase.pathId.toLocaleString(),
    'refill-count': (questionPhrase.resetCount - 1).toLocaleString()
  };
  const statisticsText = expandVariablesInString(stringResouces['statistics-text'], variableValues);
  dqs('#statistics-body').innerHTML = statisticsText;
  setFlag('is-answer-shown', false);
  if (getFlag('is-question-shown')) {
    setFlag('is-question-shown', false);
    await setTimeout(getSetting('animation-duration', 'number'));
  }
  dqs('#question-panel').scrollTop = 0;
  dqs('#question-body').innerHTML = questionPhrase.html;
  addHintBalloons(dqs('#question-panel'), answerPhrase.chosenOptionTexts, answerPhrase.lang);
  dqs('#answer-panel').scrollTop = 0;
  dqs('#answer-body').innerHTML = answerPhrase.html;
  addHintBalloons(dqs('#answer-panel'), questionPhrase.chosenOptionTexts, questionPhrase.lang);
  setFlag('is-question-shown', true);
  await setTimeout(getSetting('animation-duration', 'number'));
  if (getFlag('is-automatic-question-reading-enabled')) {
    readAloud(questionPhrase.text, questionPhrase.lang);
  }
  enableButtons();
};
const showAnswer = async () => {
  disableButtons();
  window.speechSynthesis.speaking && window.speechSynthesis.cancel();
  setFlag('is-answer-shown', true);
  await setTimeout(getSetting('animation-duration', 'number'));
  if (getFlag('is-automatic-answer-reading-enabled')) {
    readAloud(answerPhrase.text, answerPhrase.lang);
  }
  enableButtons();
};


/*
const showAnswer = () => {
  disableButtons();
  dqs('#answer-panel').scrollTop = 0;
  dqs('#answer-body').innerHTML = answerPhrase.html;
  addHintBalloons(dqs('#answer-panel'), questionPhrase.chosenOptionTexts, questionPhrase.lang);
  window.speechSynthesis.speaking && window.speechSynthesis.cancel();
  if (getFlag('is-automatic-answer-reading-enabled')) {
    readAloud(answerPhrase.text, answerPhrase.lang);
  }
  if (getSetting('animation-type') == 'slide') {
    dqs('#answer-cover').addEventListener('animationend', event => {
      setFlag('is-answer-shown', true);
      enableButtons();
    }, {once: true});
    dqs('#answer-cover').style.animation = 'slideOutToRight 500ms forwards';
  } else if (getSetting('animation-type') == 'flip') {
    dqs('#answer-cell').addEventListener('animationend', event => {
      dqs('#answer-cover').style.visibility = 'hidden';
      dqs('#answer-cell').addEventListener('animationend', event => {
        setFlag('is-answer-shown', true);
        enableButtons();
      }, {once: true});
      dqs('#answer-cell').style.animation = 'flipB 250ms forwards';  
    }, {once: true});
    dqs('#answer-cell').style.animation = 'flipA 250ms forwards';
  } else {
    dqs('#answer-cover').style.visibility = 'hidden';
    setFlag('is-answer-shown', true);
    enableButtons();
  }
};
*/

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
  dqsa('.active').forEach(element => {
    element.classList.remove('active');
  });
  if (! targetElement) {
    return;
  }
  targetElement.classList.add('active');
};
const disableButtons = () => {
  dqs('#read-aloud-button').disabled = true;
  dqs('#play-button').disabled = true;
  dqs('#skip-button').disabled = true;
};
const enableButtons = () => {
  dqs('#read-aloud-button').disabled = false;
  dqs('#play-button').disabled = false;
  dqs('#skip-button').disabled = false;
};
const readAloud = (text, lang) => {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance();
  utterance.text = text;
  utterance.lang = lang;
  utterance.volume = 1;
  utterance.rate = 1;
  utterance.pitch = 1;
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
