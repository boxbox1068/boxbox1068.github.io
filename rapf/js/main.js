'use strict';
const main = () => {
  const lang = {'ja': 'ja'}[window.navigator.language] || 'en';
  document.title = {'en': 'Rabbity Phrases Flashcards', 'ja': '鼠算式フレーズ練習帳'}[lang];
  for (const element of $e('[lang]', true)) {
    if (element.lang != lang) {
      element.remove();
    }
  }
  if ($q('iframe') == 'true') {
    window.addEventListener('message', event => {
      if (typeof event.data != 'object') {
        return;
      }
      initializeScreen(
        event.data['lead'],
        event.data['question'],
        event.data['answer'],
        event.data['lang'],
        event.data['animation']
      );
    }, {once: true});
  } else if ($q('question')) {
    initializeScreen(
      $q('lead'),
      $q('question'),
      $q('answer'),
      $q('lang'),
      $q('animation')
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
          jsonData['lang'],
          jsonData['animation']
        );
      };
    `;
    document.head.append(jsonpCallbackScriptElement);
    const jsonpDataScriptElement = document.createElement('script');
    jsonpDataScriptElement.src = jsonpSrc;
    document.head.append(jsonpDataScriptElement);
  }
};
const initializeScreen = (leadText, questionTemplate, answerTemplate, answerLang, animation) => {
  const expandVariables = template => {
    for (const key in $templateVariables) {
      template = template.replace(new RegExp(`%${key}%`, 'ig'), $templateVariables[key]);
    }
    return template;
  };
  $d('lead-text', leadText, '');
  $d('question-template', expandVariables(questionTemplate), '');
  $d('answer-template', expandVariables(answerTemplate), '');
  $d('answer-lang', answerLang, 'en');
  $d('animation', animation, 'slide');
  $d('refill-count', 0);
  $d('current-step', 'startup');
  if ($d('animation') == 'none') {
    $e('#disable-animation-checkbox').checked = true;
  }
  $e('#fold-lead-checkbox').addEventListener('change', event => {
    $e('#speak-button').addEventListener('click', event => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      } else {
        speak();
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
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
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
    addHintBalloons($e('#question-panel'), $d('answer-phrase').chosenBranchTexts);
  };
  disableButtons();
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
  addHintBalloons($e('#answer-panel'), $d('question-phrase').chosenBranchTexts);
  if ($d('animation') == 'slide') {
    $e('#answer-cover').addEventListener('animationend', event => {
      $d('current-step', 'answer');
      enableButtons();
      if ($e('#auto-speak-checkbox').checked) speak();
    }, {once: true});
    $e('#answer-cover').style.animation = 'slideOutToRight 500ms forwards';
  } else if ($d('animation') == 'flip') {
    $e('#answer-cell').addEventListener('animationend', event => {
      $e('#answer-cover').style.visibility = 'hidden';
      $e('#answer-cell').addEventListener('animationend', event => {
        $d('current-step', 'answer');
        enableButtons();
        if ($e('#auto-speak-checkbox').checked) speak();
      }, {once: true});
      $e('#answer-cell').style.animation = 'flipB 250ms forwards';  
    }, {once: true});
    $e('#answer-cell').style.animation = 'flipA 250ms forwards';
  } else {
    $e('#answer-cover').style.visibility = 'hidden';
    $d('current-step', 'answer');
    enableButtons();
    if ($e('#auto-speak-checkbox').checked) speak();
  }
};
const addHintBalloons = (parentPanelElement, hintTextList) => {
  const adjustHintBalloonPosition = branchElement => {
    const hintBalloonPanelElement = branchElement.querySelector('.hint-balloon-panel');
    const branchRect = branchElement.getClientRects()[0];
    hintBalloonPanelElement.style.top = `${branchRect.top}px`;
    hintBalloonPanelElement.style.left = `${branchRect.left}px`;
  };
  const targetBranchElements = parentPanelElement.querySelectorAll('.branch');
  for (const branchElement of targetBranchElements) {
    const branchNumber = Number(branchElement.dataset.branchNumber);
    const hintBalloonBodyElement = document.createElement('span');
    hintBalloonBodyElement.className = 'hint-balloon-body';
    hintBalloonBodyElement.innerText = hintTextList[branchNumber];
    const hintBalloonPanelElement = document.createElement('span');
    hintBalloonPanelElement.className = 'hint-balloon-panel';
    hintBalloonPanelElement.append(hintBalloonBodyElement);
    branchElement.append(hintBalloonPanelElement);
    const hintBalloonRight = branchElement.getClientRects()[0].left + hintBalloonPanelElement.offsetWidth;
    const hintBalloonContentMarginLeft = Math.min(0, document.body.offsetWidth - hintBalloonRight);
    hintBalloonBodyElement.style.marginLeft = `${hintBalloonContentMarginLeft}px`;
    adjustHintBalloonPosition(branchElement);
  }
  parentPanelElement.addEventListener('scroll', event => {
    const targetBranchElements = parentPanelElement.querySelectorAll('.branch');
    for (const branchElement of targetBranchElements) {
      adjustHintBalloonPosition(branchElement);
    }
  });
}
const disableButtons = () => {
  $e('#speak-button').disabled = true;
  $e('#play-button').disabled = true;
  $e('#skip-button').disabled = true;
};
const enableButtons = () => {
  $e('#speak-button').disabled = false;
  $e('#play-button').disabled = false;
  $e('#skip-button').disabled = false;
};
const speak = () => {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance();
  utterance.text = $d('answer-phrase').text;
  utterance.lang = 'en-US';
  utterance.volume = 1;
  utterance.rate = 1;
  utterance.pitch = 1;
  const candidateVoices = [];
  for (const voice of window.speechSynthesis.getVoices()) {
    if (new RegExp(`^${$d('answer-lang')}`, 'i').test(voice.lang)) {
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
