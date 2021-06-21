'use strict';
const $dic = {};
let questionPhrase;
let answerPhrase;
const main = () => {
  $dic.appLang = {'ja': 'ja'}[window.navigator.language] || 'en';
  document.title = {
    'en': 'Rabbity Phrases Flashcards',
    'ja': '鼠算式フレーズ練習帳'
  }[$dic.appLang];
  $qsa('[lang]').forEach(element => {
    (element.lang != $dic.appLang) && element.remove();
  });
  $dt('disable-animation', $ck('disable-animation') == 'true', (key, value) => {
    $fl(key, value);
    $ck(key, value);
  });
  if ($qr('iframe') == 'true') {
    window.addEventListener('message', event => {
      if (typeof event.data != 'object') {
        return;
      }
      readInput(
        event.data['lead'],
        event.data['question'],
        event.data['q-lang'],
        event.data['answer'],
        event.data['a-lang'],
        event.data['animation'],
        event.data['reading-delay'],
        event.data['enable-skip-by-swipe'],
        event.data['disable-option-marking']
      );
    }, {once: true});
  } else if ($qr('question')) {
    readInput(
      $qr('lead'),
      $qr('question'),
      $qr('q-lang'),
      $qr('answer'),
      $qr('a-lang'),
      $qr('animation'),
      $qr('reading-delay'),
      $qr('enable-skip-by-swipe'),
      $qr('disable-option-marking')
    );
  } else {
    const jsonpSrc = $qr('jsonp') || {
      'en': './data/demo.en.jsonp',
      'ja': './data/demo.ja.jsonp'
    }[$dic.appLang];
    const jsonpDataScriptElement = document.createElement('script');
    jsonpDataScriptElement.src = jsonpSrc;
    document.head.append(jsonpDataScriptElement);
  }
};
const jsonpCallback = jsonData => {
  readInput(
    jsonData['lead'],
    jsonData['question'],
    jsonData['q-lang'],
    jsonData['answer'],
    jsonData['a-lang'],
    jsonData['animation'],
    jsonData['reading-delay'],
    jsonData['enable-skip-by-swipe'],
    jsonData['disable-option-marking']
  );
};



const readInput = (leadText, questionTemplate, questionLang, answerTemplate, answerLang, animation, readingDelay, enableSkipBySwipe, disableOptionMarking) => {
  const expandVariables = template => {
    for (const key in $templateVariables) {
      template = template.replace(new RegExp(`%${key}%`, 'ig'), $templateVariables[key]);
    }
    return template;
  };
  questionPhrase = new RabbitPhrase(questionTemplate, questionLang);
  answerPhrase = new RabbitPhrase(answerTemplate, answerLang);

  $dt('animation', animation || 'slide');
/*
  if ($dt('animation') == 'none') {
    $fl('disable-animation', true);
  }
*/
  $dt('reading-delay', readingDelay !== undefined ? readingDelay : 250);
  if (/^\s*true\s*$/i.test(enableSkipBySwipe)) {
    $fl('enable-skip-by-swipe', true);
  }
  if (/^\s*true\s*$/i.test(disableOptionMarking)) {
    $fl('disable-option-marking', true);
  }



  $el('#fold-lead-button').addEventListener('click', event => {
    $el(':root').classList.toggle('is-lead-folded');
  });
  $el('#fold-lead-button').addEventListener('click', event => {
    $dt('refill-count', 0);
    $dt('current-step', 'startup');
    $el('#enable-automatic-question-reading-checkbox').addEventListener('change', event => {
      if (event.target.checked) {
        const text = {
          'en': 'Automatic question reading enabled.',
          'ja': '問題の自動読み上げ、オン。'
        }[$dic.appLang];
        readAloud(text, lang);
      } else {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }
      }
    });
    $el('#enable-automatic-answer-reading-checkbox').addEventListener('change', event => {
      if (event.target.checked) {
        const text = {
          'en': 'Automatic answer reading enabled.',
          'ja': '答えの自動読み上げ、オン。'
        }[$dic.appLang];
        readAloud(text, lang);
      } else {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }
      }
    });
    $el('#read-aloud-button').addEventListener('click', event => {
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
    $el('#play-button').addEventListener('click', event => {
      if ($dt('current-step') == 'question') {
        showAnswer();
      } else {
        resetCard();
      }
    });
    $el('#skip-button').addEventListener('click', event => {
      resetCard();
    });
    $el('#visit-home-button').addEventListener('click', event => {
      const message = 'サイトを移動します。';
      if (! window.confirm(message)) {
        return;
      }
      window.location.href = 'https://twitter.com/shikaku1068/';
    });
    $el('#show-settings-button').addEventListener('click', event => {
      $el(':root').classList.add('is-settings-shown');
    });
    resetCard();
  }, {once: true});
  $el('#lead-body').innerHTML = leadText;
  if (! leadText) {
    $el('#fold-lead-button').click();
    $el('#fold-lead-button').disabled = true;
  }
}
const initializeOperation = () => {
  ['mousemove', 'touchstart'].forEach(eventType => {
    $el('body').addEventListener(eventType, event => {
      $qsa('.active').forEach(element => element.classList.remove('active'));
      event.target.classList.add('active');
    }, {capture: true});  
  });
  addSwipeListener($el('body'), 25, () => {
    if ($el(':root.is-lead-folded')) {
      $el('#play-button').click();
    } else {
      $el('#fold-lead-button').click();
    }
  });
  addSwipeListener($el('body'), -25, () => {
    if (! $el(':root.enable-skip-by-swipe')) {
      return;
    }
    if ($el(':root.is-lead-folded')) {
      $el('#skip-button').click();
    } else {
      $el('#fold-lead-button').click();
    }
  });
  addDoubleTapListener($el('body'), 250, () => {
    $el('#read-aloud-button').click();
  });
  addKeyDownListener($el('body'), ' ', targetKey => {
    $el('#play-button').click();
  });
  addKeyDownListener($el('body'), 'Tab', targetKey => {
    $el('#skip-button').click();
  });
  addKeyDownListener($el('body'), 'Enter', targetKey => {
    $el('#read-aloud-button').click();
  });
  addKeyDownListener($el('body'), 'Escape', targetKey => {
    $el('#fold-lead-button').click();
  });
  ['l', 'L'].forEach(targetKey => {
    const scrollY = {'l': 50, 'L': -50}[targetKey];
    addKeyDownListener($el('body'), targetKey, targetKey => {
      $el('#lead-panel').scrollBy(0, scrollY);
    });
  });
  ['q', 'Q'].forEach(targetKey => {
    const scrollY = {'q': 50, 'Q': -50}[targetKey];
    addKeyDownListener($el('body'), targetKey, targetKey => {
      $el('#question-panel').scrollBy(0, scrollY);
    });
  });
  ['a', 'A'].forEach(targetKey => {
    const scrollY = {'a': 50, 'A': -50}[targetKey];
    addKeyDownListener($el('body'), targetKey, targetKey => {
      $el('#answer-panel').scrollBy(0, scrollY);
    });
  });
  ['h', 'H'].forEach(targetKey => {
    const reverse = {'h': false, 'H': true}[targetKey];
    addKeyDownListener($el('body'), targetKey, targetKey => {
      const optionElements = $qsa('.option');
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

  $el('#pattern-count').innerHTML = questionPhrase.possiblePathCount.toLocaleString();
  $el('#pattern-id').innerHTML = questionPhrase.pathId.toLocaleString();
  $el('#refill-count').innerHTML = ($dt('refill-count')).toLocaleString();
  $dt('refill-count', $dt('refill-count') + 1);
  showQuestion();
};
const showQuestion = () => {
  const resetQuestionPanel = () => {
    $el('#question-panel').scrollTop = 0;
    $el('#question-body').innerHTML = questionPhrase.html;
    addHintBalloons($el('#question-panel'), answerPhrase.chosenOptionTexts, answerPhrase.lang);
  };
  disableButtons();
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
  if ($el('#enable-automatic-question-reading-checkbox').checked) {
    window.setTimeout(() => {
      readAloud(questionPhrase.text, questionPhrase.lang);
    }, $dt('reading-delay'));
  }
  if ($dt('animation') == 'slide') {
    $el('#question-cover').addEventListener('animationend', event => {
      resetQuestionPanel();
      $el('#question-cover').style.animation = 'slideOutToRight 500ms ease-in-out forwards';
      $el('#question-cover').addEventListener('animationend', event => {
        $dt('current-step', 'question');
        enableButtons();
      }, {once: true});
    }, {once: true});
    if ($dt('current-step') == 'startup') {
      $el('#question-cover').style.animation =  'slideInFromLeft 0ms forwards';
    } else {
      $el('#question-cover').style.animation =  'slideInFromLeft 500ms forwards';
    }
    if ($dt('current-step') == 'answer') {
      $el('#answer-cover').style.animation =  'slideInFromLeft 500ms forwards';
    } else {
      $el('#answer-cover').style.animation =  'slideInFromLeft 0ms forwards';
    }
  } else if ($dt('animation') == 'flip') {
    $el('#question-cell').addEventListener('animationend', event => {
      resetQuestionPanel();
      $el('#question-cover').style.visibility = 'hidden';
      $el('#question-cell').addEventListener('animationend', event => {
        $dt('current-step', 'question');
        enableButtons();
      }, {once: true});
      $el('#question-cell').style.animation = 'flipB 250ms forwards';
    }, {once: true});
    $el('#question-cell').style.animation = 'flipA 250ms forwards';
    $el('#answer-cell').addEventListener('animationend', event => {
      $el('#answer-cover').style.visibility = 'visible';
      $el('#answer-cell').style.animation = 'flipB 250ms forwards';
    }, {once: true});
    $el('#answer-cell').style.animation = 'flipA 250ms forwards';
  } else {
    resetQuestionPanel();
    $el('#question-cover').style.visibility = 'hidden';
    $el('#answer-cover').style.visibility = 'visible';
    $dt('current-step', 'question');
    enableButtons();
  }
};
const showAnswer = () => {
  disableButtons();
  $el('#answer-panel').scrollTop = 0;
  $el('#answer-body').innerHTML = answerPhrase.html;
  addHintBalloons($el('#answer-panel'), questionPhrase.chosenOptionTexts, questionPhrase.lang);
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
  if ($el('#enable-automatic-answer-reading-checkbox').checked) {
    window.setTimeout(() => {
      readAloud(answerPhrase.text, answerPhrase.lang);
    }, $dt('reading-delay'));
  }
  if ($dt('animation') == 'slide') {
    $el('#answer-cover').addEventListener('animationend', event => {
      $dt('current-step', 'answer');
      enableButtons();
    }, {once: true});
    $el('#answer-cover').style.animation = 'slideOutToRight 500ms forwards';
  } else if ($dt('animation') == 'flip') {
    $el('#answer-cell').addEventListener('animationend', event => {
      $el('#answer-cover').style.visibility = 'hidden';
      $el('#answer-cell').addEventListener('animationend', event => {
        $dt('current-step', 'answer');
        enableButtons();
      }, {once: true});
      $el('#answer-cell').style.animation = 'flipB 250ms forwards';  
    }, {once: true});
    $el('#answer-cell').style.animation = 'flipA 250ms forwards';
  } else {
    $el('#answer-cover').style.visibility = 'hidden';
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
    const hintBalloonBodyElement = document.createElement('span');
    hintBalloonBodyElement.className = 'hint-balloon-body';
    hintBalloonBodyElement.innerText = hintText;
    const hintBalloonPanelElement = document.createElement('span');
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
  $qsa('.active').forEach(element => {
    element.classList.remove('active');
  });
  if (! targetElement) {
    return;
  }
  targetElement.classList.add('active');
};
const disableButtons = () => {
  $el('#read-aloud-button').disabled = true;
  $el('#play-button').disabled = true;
  $el('#skip-button').disabled = true;
};
const enableButtons = () => {
  $el('#read-aloud-button').disabled = false;
  $el('#play-button').disabled = false;
  $el('#skip-button').disabled = false;
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
