'use strict';
let appLang;
let questionPhrase;
let answerPhrase;
let rabbitVariables;
const main = () => {
  appLang = {'ja': 'ja'}[window.navigator.language] || 'en';
  document.title = {
    'en': 'Rabbity Phrase Drills',
    'ja': '鼠算式フレーズ練習帳'
  }[appLang];
  dqsa('[lang]').forEach(element => {
    element.lang != appLang && element.remove();
  });
  setSetting('animation-type', getSetting('animation-type') || 'flip');
  setSetting('disable-animation', getSetting('disable-animation') || 'false');
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
  dqs('#visit-home-button').addEventListener('click', event => {
    const message = 'サイトを移動します。';
    if (! window.confirm(message)) {
      return;
    }
    window.location.href = 'https://twitter.com/shikaku1068/';
  });
  dqs('#show-settings-button').addEventListener('click', event => {
    dqs(':root').classList.add('is-settings-shown');
  });
  requestJsonp('./data/rabbit-variables.jsonp', 'jsonpCallback', jsonData => {
    rabbitVariables = jsonData;
    acceptInput();
  });
};
const acceptInput = () => {
  const usp = new URLSearchParams(window.location.search.replace(/^\?/, ''));
  if (usp.get('iframe') == 'true') {
    window.addEventListener('message', event => {
      if (typeof event.data != 'object') {
        return;
      }
      processInput(
        event.data['l-text'],
        event.data['q-temp'],
        event.data['q-lang'],
        event.data['a-temp'],
        event.data['a-lang']
      );
    }, {once: true});
  } else if (usp.has('question')) {
    processInput(
      usp.get('l-text'),
      usp.get('q-temp'),
      usp.get('q-lang'),
      usp.get('a-temp'),
      usp.get('a-lang')
    );
  } else {
    const jsonpSrc = usp.get('jsonp') || {
      'en': './data/demo.en.jsonp',
      'ja': './data/demo.ja.jsonp'
    }[appLang];
    requestJsonp(jsonpSrc, 'jsonpCallback', jsonData => {
      processInput(
        jsonData['l-text'],
        jsonData['q-temp'],
        jsonData['q-lang'],
        jsonData['a-temp'],
        jsonData['a-lang']
      );
    });
  }
}
const processInput = (leadText, questionTemplate, questionLang, answerTemplate, answerLang) => {
  const preprocessRabbitTemplate = rabbitTemplate => {
    for (const key in rabbitVariables) {
      rabbitTemplate = rabbitTemplate.replace(new RegExp(`%${key}%`, 'ig'), rabbitVariables[key]);
    }
    return rabbitTemplate;
  };
  const preprocessedQuestionTemplate = preprocessRabbitTemplate(questionTemplate);
  questionPhrase = new RabbitPhrase(preprocessedQuestionTemplate, questionLang);
  const preprocessedAnswerTemplate = preprocessRabbitTemplate(answerTemplate);
  answerPhrase = new RabbitPhrase(preprocessedAnswerTemplate, answerLang);
  dqs('#lead-body').innerHTML = leadText;
  arrangeBehaviors(leadText != '');
};
const arrangeBehaviors = hasLead => {
  dqs('#fold-lead-button').addEventListener('click', event => {
    dqs(':root').classList.toggle('is-lead-folded');
  });
  dqs('#fold-lead-button').addEventListener('click', event => {
    $dt('current-step', 'startup');
    dqs('#enable-automatic-question-reading-checkbox').addEventListener('change', event => {
      if (event.target.checked) {
        const text = {
          'en': 'Automatic question reading enabled.',
          'ja': '問題の自動読み上げ、オン。'
        }[appLang];
        readAloud(text, lang);
      } else {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }
      }
    });
    dqs('#enable-automatic-answer-reading-checkbox').addEventListener('change', event => {
      if (event.target.checked) {
        const text = {
          'en': 'Automatic answer reading enabled.',
          'ja': '答えの自動読み上げ、オン。'
        }[appLang];
        readAloud(text, lang);
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
        const text = {
          'question': questionPhrase.text,
          'answer': answerPhrase.text
        }[$dt('current-step')];
        const lang = {
          'question': questionPhrase.lang,
          'answer': answerPhrase.lang
        }[$dt('current-step')];
        readAloud(text, lang);
      }
    });
    dqs('#play-button').addEventListener('click', event => {
      if ($dt('current-step') == 'question') {
        showAnswer();
      } else {
        resetCard();
      }
    });
    dqs('#skip-button').addEventListener('click', event => {
      resetCard();
    });
    resetCard();
  }, {once: true});
  if (! hasLead) {
    dqs('#fold-lead-button').click();
    dqs('#fold-lead-button').disabled = true;
  }
}
const initializeOperation = () => {
  ['mousemove', 'touchstart'].forEach(eventType => {
    dqs('body').addEventListener(eventType, event => {
      dqsa('.active').forEach(element => element.classList.remove('active'));
      event.target.classList.add('active');
    }, {capture: true});  
  });
  addSwipeListener(dqs('body'), 25, () => {
    if (dqs(':root.is-lead-folded')) {
      dqs('#play-button').click();
    } else {
      dqs('#fold-lead-button').click();
    }
  });
  addSwipeListener(dqs('body'), -25, () => {
    if (! dqs(':root.enable-skip-by-swipe')) {
      return;
    }
    if (dqs(':root.is-lead-folded')) {
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


const resetCard = () => {
  const pathIdSeed = Math.random();
  questionPhrase.reset(pathIdSeed);
  answerPhrase.reset(pathIdSeed);
  dqs('#pattern-count').innerHTML = questionPhrase.possiblePathCount.toLocaleString();
  dqs('#pattern-id').innerHTML = questionPhrase.pathId.toLocaleString();
  dqs('#refill-count').innerHTML = (questionPhrase.resetCount - 1).toLocaleString();
  showQuestion();
};
const showQuestion = () => {
  const resetQuestionPanel = () => {
    dqs('#question-panel').scrollTop = 0;
    dqs('#question-body').innerHTML = questionPhrase.html;
    addHintBalloons(dqs('#question-panel'), answerPhrase.chosenOptionTexts, answerPhrase.lang);
  };
  disableButtons();
  window.speechSynthesis.speaking && window.speechSynthesis.cancel();
  if (dqs('#enable-automatic-question-reading-checkbox').checked) {
    readAloud(questionPhrase.text, questionPhrase.lang);
  }
  if (getSetting('animation-type') == 'slide') {
    dqs('#question-cover').addEventListener('animationend', event => {
      resetQuestionPanel();
      dqs('#question-cover').style.animation = 'slideOutToRight 500ms ease-in-out forwards';
      dqs('#question-cover').addEventListener('animationend', event => {
        $dt('current-step', 'question');
        enableButtons();
      }, {once: true});
    }, {once: true});
    if ($dt('current-step') == 'startup') {
      dqs('#question-cover').style.animation =  'slideInFromLeft 0ms forwards';
    } else {
      dqs('#question-cover').style.animation =  'slideInFromLeft 500ms forwards';
    }
    if ($dt('current-step') == 'answer') {
      dqs('#answer-cover').style.animation =  'slideInFromLeft 500ms forwards';
    } else {
      dqs('#answer-cover').style.animation =  'slideInFromLeft 0ms forwards';
    }
  } else if (getSetting('animation-type') == 'flip') {
    dqs('#question-cell').addEventListener('animationend', event => {
      resetQuestionPanel();
      dqs('#question-cover').style.visibility = 'hidden';
      dqs('#question-cell').addEventListener('animationend', event => {
        $dt('current-step', 'question');
        enableButtons();
      }, {once: true});
      dqs('#question-cell').style.animation = 'flipB 250ms forwards';
    }, {once: true});
    dqs('#question-cell').style.animation = 'flipA 250ms forwards';
    dqs('#answer-cell').addEventListener('animationend', event => {
      dqs('#answer-cover').style.visibility = 'visible';
      dqs('#answer-cell').style.animation = 'flipB 250ms forwards';
    }, {once: true});
    dqs('#answer-cell').style.animation = 'flipA 250ms forwards';
  } else {
    resetQuestionPanel();
    dqs('#question-cover').style.visibility = 'hidden';
    dqs('#answer-cover').style.visibility = 'visible';
    $dt('current-step', 'question');
    enableButtons();
  }
};
const showAnswer = () => {
  disableButtons();
  dqs('#answer-panel').scrollTop = 0;
  dqs('#answer-body').innerHTML = answerPhrase.html;
  addHintBalloons(dqs('#answer-panel'), questionPhrase.chosenOptionTexts, questionPhrase.lang);
  window.speechSynthesis.speaking && window.speechSynthesis.cancel();
  if (dqs('#enable-automatic-answer-reading-checkbox').checked) {
    readAloud(answerPhrase.text, answerPhrase.lang);
  }
  if (getSetting('animation-type') == 'slide') {
    dqs('#answer-cover').addEventListener('animationend', event => {
      $dt('current-step', 'answer');
      enableButtons();
    }, {once: true});
    dqs('#answer-cover').style.animation = 'slideOutToRight 500ms forwards';
  } else if (getSetting('animation-type') == 'flip') {
    dqs('#answer-cell').addEventListener('animationend', event => {
      dqs('#answer-cover').style.visibility = 'hidden';
      dqs('#answer-cell').addEventListener('animationend', event => {
        $dt('current-step', 'answer');
        enableButtons();
      }, {once: true});
      dqs('#answer-cell').style.animation = 'flipB 250ms forwards';  
    }, {once: true});
    dqs('#answer-cell').style.animation = 'flipA 250ms forwards';
  } else {
    dqs('#answer-cover').style.visibility = 'hidden';
    $dt('current-step', 'answer');
    enableButtons();
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
