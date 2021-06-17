'use strict';
const $d = (key, value, defaultValue) => {
  if (value !== undefined) {
    $d[key] = value;
  } else if (defaultValue !== undefined) {
    $d[key] = defaultValue;
  }
  return $d[key];
};
const $e = (selectors, returnMultiple) => {
  if (returnMultiple) {
    return document.querySelectorAll(selectors);
  } else {
    return document.querySelector(selectors);
  }
};
const $q = (field, toLowerCase) => {
  let value = undefined;
  const queryString = window.location.search.replace(/^\?/, '');
  const parameters = queryString.split('&');
  for (const parameter of parameters) {
    const currentField = parameter.replace(/=.*/, '').trim().toLowerCase();
    if (currentField == field) {
      value = decodeURIComponent(parameter.replace(/.*?=|.*/, '')).trim();
      if (toLowerCase) value = value.toLowerCase();
      break;
    }
  }
  return value;
};
const main = () => {
  const lang = {'ja': 'ja'}[window.navigator.language] || 'en';
  document.title = {'en': 'Rabbity Phrases Flashcards', 'ja': '鼠算式フレーズ練習帳'}[lang];
  for (const element of $e('[lang]', true)) {
    if (element.lang != lang) {
      element.remove();
    }
  }
  $d('app-lang', lang);
  if ($q('iframe') == 'true') {
    window.addEventListener('message', event => {
      if (typeof event.data != 'object') {
        return;
      }
      initializeScreen(
        event.data['lead'],
        event.data['question'],
        event.data['answer'],
        event.data['q-lang'],
        event.data['a-lang'],
        event.data['animation'],
        event.data['reading-delay'],
        event.data['enable-skip-by-swipe'],
        event.data['disable-option-marking']
      );
    }, {once: true});
  } else if ($q('question')) {
    initializeScreen(
      $q('lead'),
      $q('question'),
      $q('answer'),
      $q('q-lang'),
      $q('a-lang'),
      $q('animation'),
      $q('reading-delay'),
      $q('enable-skip-by-swipe'),
      $q('disable-option-marking')
    );
  } else {
    const demoJsonpSrc = {'en': './data/demo.en.jsonp', 'ja': './data/demo.ja.jsonp'}[lang];
    const jsonpSrc = $q('jsonp') || demoJsonpSrc;
    const jsonpCallbackScriptElement = document.createElement('script');
    jsonpCallbackScriptElement.innerHTML = `
      const jsonpCallback = jsonData => {
        initializeScreen(
          jsonData['lead'],
          jsonData['question'],
          jsonData['answer'],
          jsonData['q-lang'],
          jsonData['a-lang'],
          jsonData['animation'],
          jsonData['reading-delay'],
          jsonData['enable-skip-by-swipe'],
          jsonData['disable-option-marking']
        );
      };
    `;
    document.head.append(jsonpCallbackScriptElement);
    const jsonpDataScriptElement = document.createElement('script');
    jsonpDataScriptElement.src = jsonpSrc;
    document.head.append(jsonpDataScriptElement);
  }
  $e('#scroll-down-lead-button').addEventListener('click', event => {
    $e('#lead-panel').scrollBy(0, 50);
  });
  $e('#scroll-up-lead-button').addEventListener('click', event => {
    $e('#lead-panel').scrollBy(0, -50);
  });
  $e('#scroll-down-question-button').addEventListener('click', event => {
    $e('#question-panel').scrollBy(0, 50);
  });
  $e('#scroll-up-question-button').addEventListener('click', event => {
    $e('#question-panel').scrollBy(0, -50);
  });
  $e('#scroll-down-answer-button').addEventListener('click', event => {
    $e('#answer-panel').scrollBy(0, 50);
  });
  $e('#scroll-up-answer-button').addEventListener('click', event => {
    $e('#answer-panel').scrollBy(0, -50);
  });
  addKeyDownListener({
    ' ': () => {
      document.querySelector('#play-button').click();
    },
    'Tab': () => {
      document.querySelector('#skip-button').click();
    },
    'Enter': () => {
      document.querySelector('#read-aloud-button').click();
    },
    'Escape': () => {
      document.querySelector('#fold-lead-checkbox').click();
    },
    'l': () => {
      document.querySelector('#scroll-down-lead-button').click();
    },
    'L': () => {
      document.querySelector('#scroll-up-lead-button').click();
    },
    'q': () => {
      document.querySelector('#scroll-down-question-button').click();
    },
    'Q': () => {
      document.querySelector('#scroll-up-question-button').click();
    },
    'a': () => {
      document.querySelector('#scroll-down-answer-button').click();
    },
    'A': () => {
      document.querySelector('#scroll-up-answer-button').click();
    }
  });
  addSwipeListener(document.body, 25, () => {
    if ($e('#fold-lead-checkbox').checked) {
      $e('#play-button').click();
    } else {
      $e('#fold-lead-checkbox').checked = true;
      $e('#fold-lead-checkbox').dispatchEvent(new Event('change'));
    }
  });
  addSwipeListener(document.body, -25, () => {
    if (! $e(':root.enable-skip-by-swipe')) {
      return;
    }
    if ($e('#fold-lead-checkbox').checked) {
      $e('#skip-button').click();
    } else {
      $e('#fold-lead-checkbox').checked = true;
      $e('#fold-lead-checkbox').dispatchEvent(new Event('change'));
    }
  });
  addDoubleTapListener(document.body, 300, () => {
    $e('#read-aloud-button').click();
  });
};
const initializeScreen = (leadText, questionTemplate, answerTemplate, questionLang, answerLang, animation, readingDelay, enableSkipBySwipe, disableOptionMarking) => {
  const expandVariables = template => {
    for (const key in $templateVariables) {
      template = template.replace(new RegExp(`%${key}%`, 'ig'), $templateVariables[key]);
    }
    return template;
  };
  $d('lead-text', leadText, '');
  $d('question-template', expandVariables(questionTemplate), '');
  $d('answer-template', expandVariables(answerTemplate), '');
  $d('question-lang', questionLang, 'en');
  $d('answer-lang', answerLang, 'en');
  $d('animation', animation, 'slide');
  if ($d('animation') == 'none') {
    $e(':root').classList.add('disable-animation');
  }
  $d('reading-delay', readingDelay, 250);
  if (/^\s*true\s*$/i.test(enableSkipBySwipe)) {
    $e(':root').classList.add('enable-skip-by-swipe');
  }
  if (/^\s*true\s*$/i.test(disableOptionMarking)) {
    $e(':root').classList.add('disable-option-marking');
  }
  $e('#fold-lead-checkbox').addEventListener('change', event => {
    $d('refill-count', 0);
    $d('current-step', 'startup');
    $e('#enable-automatic-question-reading-checkbox').addEventListener('change', event => {
      if (event.target.checked) {
        const lang = $d('app-lang');
        const text = {
          'en': 'Automatic question reading enabled.',
          'ja': '問題の自動読み上げ、オン。'
        }[lang];
        readAloud(text, lang);
      } else {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }
      }
    });
    $e('#enable-automatic-answer-reading-checkbox').addEventListener('change', event => {
      if (event.target.checked) {
        const lang = $d('app-lang');
        const text = {
          'en': 'Automatic answer reading enabled.',
          'ja': '答えの自動読み上げ、オン。'
        }[lang];
        readAloud(text, lang);
      } else {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }
      }
    });
    $e('#read-aloud-button').addEventListener('click', event => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      } else {
        const text = {
          'question': $d('question-phrase').text,
          'answer': $d('answer-phrase').text
        }[$d('current-step')];
        const lang = {
          'question': $d('question-lang'),
          'answer': $d('answer-lang')
        }[$d('current-step')];
        readAloud(text, lang);
      }
    });
    $e('#play-button').addEventListener('click', event => {
      if ($d('current-step') == 'question') {
        showAnswer();
      } else {
        resetCard();
      }
    });
    $e('#skip-button').addEventListener('click', event => {
      resetCard();
    });
    resetCard();
  }, {once: true});
  $e('#lead-body').innerHTML = $d('lead-text');
  if (! $d('lead-text')) {
    $e('#fold-lead-checkbox').checked = true;
    $e('#fold-lead-checkbox').dispatchEvent(new Event('change'));
    $e('#fold-lead-checkbox').disabled = true;
  }
}
const resetCard = () => {
  const pathIdSeed = Math.random();
  $d('question-phrase', new RabbitPhrase($d('question-template'), pathIdSeed));
  $d('answer-phrase', new RabbitPhrase($d('answer-template'), pathIdSeed));
  $e('.pattern-count').innerHTML = $d('question-phrase').possiblePathCount.toLocaleString();
  $e('.pattern-id').innerHTML = $d('question-phrase').pathId.toLocaleString();
  $e('.refill-count').innerHTML = ($d('refill-count')).toLocaleString();
  $d('refill-count', $d('refill-count') + 1);
  showQuestion();
};
const showQuestion = () => {
  const resetQuestionPanel = () => {
    $e('#question-panel').scrollTop = 0;
    $e('#question-body').innerHTML = $d('question-phrase').html;
    addHintBalloons($e('#question-panel'), $d('answer-phrase').chosenOptionTexts, $d('answer-lang'));
  };
  disableButtons();
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
  if ($e('#enable-automatic-question-reading-checkbox').checked) {
    window.setTimeout(() => {
      readAloud($d('question-phrase').text, $d('question-lang'));
    }, $d('reading-delay'));
  }
  if ($d('animation') == 'slide') {
    $e('#question-cover').addEventListener('animationend', event => {
      resetQuestionPanel();
      $e('#question-cover').style.animation = 'slideOutToRight 500ms ease-in-out forwards';
      $e('#question-cover').addEventListener('animationend', event => {
        $d('current-step', 'question');
        enableButtons();
      }, {once: true});
    }, {once: true});
    if ($d('current-step') == 'startup') {
      $e('#question-cover').style.animation =  'slideInFromLeft 0ms forwards';
    } else {
      $e('#question-cover').style.animation =  'slideInFromLeft 500ms forwards';
    }
    if ($d('current-step') == 'answer') {
      $e('#answer-cover').style.animation =  'slideInFromLeft 500ms forwards';
    } else {
      $e('#answer-cover').style.animation =  'slideInFromLeft 0ms forwards';
    }
  } else if ($d('animation') == 'flip') {
    $e('#question-cell').addEventListener('animationend', event => {
      resetQuestionPanel();
      $e('#question-cover').style.visibility = 'hidden';
      $e('#question-cell').addEventListener('animationend', event => {
        $d('current-step', 'question');
        enableButtons();
      }, {once: true});
      $e('#question-cell').style.animation = 'flipB 250ms forwards';
    }, {once: true});
    $e('#question-cell').style.animation = 'flipA 250ms forwards';
    $e('#answer-cell').addEventListener('animationend', event => {
      $e('#answer-cover').style.visibility = 'visible';
      $e('#answer-cell').style.animation = 'flipB 250ms forwards';
    }, {once: true});
    $e('#answer-cell').style.animation = 'flipA 250ms forwards';
  } else {
    resetQuestionPanel();
    $e('#question-cover').style.visibility = 'hidden';
    $e('#answer-cover').style.visibility = 'visible';
    $d('current-step', 'question');
    enableButtons();
  }
};
const showAnswer = () => {
  disableButtons();
  $e('#answer-panel').scrollTop = 0;
  $e('#answer-body').innerHTML = $d('answer-phrase').html;
  addHintBalloons($e('#answer-panel'), $d('question-phrase').chosenOptionTexts, $d('question-lang'));
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
  if ($e('#enable-automatic-answer-reading-checkbox').checked) {
    window.setTimeout(() => {
      readAloud($d('answer-phrase').text, $d('answer-lang'));
    }, $d('reading-delay'));
  }
  if ($d('animation') == 'slide') {
    $e('#answer-cover').addEventListener('animationend', event => {
      $d('current-step', 'answer');
      enableButtons();
    }, {once: true});
    $e('#answer-cover').style.animation = 'slideOutToRight 500ms forwards';
  } else if ($d('animation') == 'flip') {
    $e('#answer-cell').addEventListener('animationend', event => {
      $e('#answer-cover').style.visibility = 'hidden';
      $e('#answer-cell').addEventListener('animationend', event => {
        $d('current-step', 'answer');
        enableButtons();
      }, {once: true});
      $e('#answer-cell').style.animation = 'flipB 250ms forwards';  
    }, {once: true});
    $e('#answer-cell').style.animation = 'flipA 250ms forwards';
  } else {
    $e('#answer-cover').style.visibility = 'hidden';
    $d('current-step', 'answer');
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
const disableButtons = () => {
  $e('#read-aloud-button').disabled = true;
  $e('#play-button').disabled = true;
  $e('#skip-button').disabled = true;
};
const enableButtons = () => {
  $e('#read-aloud-button').disabled = false;
  $e('#play-button').disabled = false;
  $e('#skip-button').disabled = false;
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
