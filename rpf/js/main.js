'use strict';
const main = () => {
  const lang = {'en': 'en', 'ja': 'ja'}[window.navigator.language] || 'en';
  document.title = {'en': 'Rabbity Phrases Flashcards', 'ja': '鼠算式フレーズ練習帳'}[lang];
  for (const element of $E('[lang]', true)) {
    if (element.lang != lang) {
      element.remove();
    }
  }
  $E('#auto-read-aloud-checkbox').addEventListener('change', event => {
    $D('is-auto-read-aloud-enabled', event.target.checked);
  });
  $E('#read-aloud-button').addEventListener('click', readAloud);
  $E('#play-button').addEventListener('click', event => {
    if ($D('is-answer-shown')) {
      resetCard();
    } else {
      showAnswer();
    }
  });
  $E('#skip-button').addEventListener('click', resetCard);
  $D('refill-count', 0);
  if ($Q('iframe', true) == 'true') {
    window.addEventListener('message', event => {
      const postedData = event.data;
      if (typeof postedData != 'object') return;
      $D('question-template', expandVariables(postedData['question']));
      $D('answer-template', expandVariables(postedData['answer']));
      $D('answer-lang', postedData['lang']);
      $D('description-text', postedData['description']);
      $D('animation', postedData['animation']);
      initializeScreen();
    });
  } else if ($Q('question')) {
    $D('question-template', expandVariables($Q('question')));
    $D('answer-template', expandVariables($Q('answer')));
    $D('answer-lang', $Q('lang', true));
    $D('description-text', $Q('description'));
    $D('animation', $Q('animation', true));
    initializeScreen();
  } else {
    const jsonpUrl = $Q('jsonp') || './data/demo.jsonp';
    const jsonpCallbackScriptElement = document.createElement('script');
    jsonpCallbackScriptElement.innerHTML = `
      const jsonpCallback = jsonData => {
        $D('question-template', expandVariables(jsonData['question']));
        $D('answer-template', expandVariables(jsonData['answer']));
        $D('answer-lang', jsonData['lang']);
        $D('description-text', jsonData['description']);
        $D('animation', jsonData['animation']);
        initializeScreen();
      };
    `;
    document.head.append(jsonpCallbackScriptElement);
    const jsonpFileScriptElement = document.createElement('script');
    jsonpFileScriptElement.src = jsonpUrl;
    document.head.append(jsonpFileScriptElement);
  }
};
const expandVariables = template => {
  for (const key in $templateVariables) {
    template = template.replace(new RegExp(`%${key}%`, 'ig'), $templateVariables[key]);
  }
  return template;
};
const initializeScreen = () => {
  window.setTimeout(() => {
    $E(':root').classList.add('enable-animation');
    if ($D('description-text')) {
      $E('#description-body').innerHTML = $D('description-text');
    } else {
      $E('#fold-description-checkbox').checked = true;
//      $E('[for="fold-description-checkbox"]').style.display = 'none';
      $E('[for="fold-description-checkbox"]').classList.add('hidden');
    }
    resetCard();
  }, 100);
}
const resetCard = () => {
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
  const pathIdSeed = Math.random();
  $D('question-phrase', new RabbitPhrase($D('question-template'), pathIdSeed));
  $D('answer-phrase', new RabbitPhrase($D('answer-template'), pathIdSeed));
  $E('.pattern-count').innerHTML = $D('question-phrase').possiblePathCount.toLocaleString();
  $E('.pattern-id').innerHTML = $D('question-phrase').pathId.toLocaleString();
  $E('.refill-count').innerHTML = ($D('refill-count')).toLocaleString();
  $D('refill-count', $D('refill-count') + 1);
  $D('is-answer-shown', true);
  showQuestion();
};
const showQuestion = () => {
  disableButtons();
  if ($D('animation') == 'flip') {
    addAnimation($E('#question-cell'), 'flipA 200ms', target => {
      resetQuestion();
      $E('#question-cover').style.visibility = 'hidden';
      addAnimation($E('#question-cell'), 'flipB 200ms', target => {
        enableButtons();
      });
    });
    if ($D('is-answer-shown')) {
      addAnimation($E('#answer-cell'), 'flipA 200ms', target => {
        resetAnswer();
        $E('#answer-cover').style.visibility = 'visible';
        addAnimation($E('#answer-cell'), 'flipB 200ms', null);
      });
    } else {
      resetAnswer();
    }
  } else if ($D('animation') == 'slide') {
    addAnimation(
      $E('#question-cover'),
//      $E('#question-cover').style.visibility == 'hidden' ? 'slideInFromLeft 400ms' : 'dummyAnimation 0',
$E('#question-cover').style.visibility == 'hidden' ? 'slideInFromLeft 400ms ease-in-out' : 'slideInFromLeft 400ms ease-in-out',
      target => {
        resetQuestion();
        addAnimation($E('#question-cover'), 'slideOutToRight 400ms ease-in-out', target => {
          $E('#question-cover').style.visibility = 'hidden';
          enableButtons();
        });
      }
    );
    addAnimation(
      $E('#answer-cover'),
      $E('#answer-cover').style.visibility == 'hidden' ? 'slideInFromLeft 400ms ease-in-out' : 'dummyAnimation 0',
      target => {
        resetAnswer();
        $E('#answer-cover').style.visibility = 'visible';
      }
    );
  } else {
    resetQuestion();
    $E('#question-cover').style.visibility = 'hidden';
    resetAnswer();
    $E('#answer-cover').style.visibility = 'visible';
    enableButtons();
  }
  $D('is-answer-shown', false);
};
const resetQuestion = () => {
  $E('#question-cell').scrollTop = 0;
  $E('#question-body').innerHTML = $D('question-phrase').html;
  addHintBalloons($E('#question-body'), $D('answer-phrase').chosenBranchTexts);
};
const resetAnswer = () => {
  $E('#answer-cell').scrollTop = 0;
  $E('#answer-body').innerHTML = $D('answer-phrase').html;
  addHintBalloons($E('#answer-body'), $D('question-phrase').chosenBranchTexts);
}
const addHintBalloons = (targetContent, hintTextList) => {
  const branchElements = targetContent.querySelectorAll('.branch');
  for (const branchElement of branchElements) {
    const branchNumber = Number(branchElement.dataset.branchNumber);
    const hintBalloonContentElement = document.createElement('span');
    hintBalloonContentElement.className = 'hint-balloon-body';
    hintBalloonContentElement.innerText = hintTextList[branchNumber];
    const hintBalloonPanelElement = document.createElement('span');
    hintBalloonPanelElement.className = 'hint-balloon-panel';
    hintBalloonPanelElement.append(hintBalloonContentElement);
    branchElement.append(hintBalloonPanelElement);
    const hintBalloonRight = branchElement.getClientRects()[0].left + hintBalloonPanelElement.offsetWidth;
    const hintBalloonContentMarginLeft = Math.min(0, document.body.offsetWidth - hintBalloonRight);
    hintBalloonContentElement.style.marginLeft = `${hintBalloonContentMarginLeft}px`;


    branchElement.addEventListener('mouseenter', event => {
      const branchElement = event.target;
      const hintBalloonPanelElement = branchElement.querySelector('.hint-balloon-panel');
      const branchRect = branchElement.getClientRects()[0];
      hintBalloonPanelElement.style.top = `${branchRect.top}px`;
      hintBalloonPanelElement.style.left = `${branchRect.left}px`;
      hintBalloonPanelElement.style.animation = 'fadeIn 400ms forwards';
    });
    branchElement.addEventListener('mouseleave', event => {
      const branchElement = event.target;
      const hintBalloonPanelElement = branchElement.querySelector('.hint-balloon-panel');
      hintBalloonPanelElement.style.animation = 'fadeOut 400ms forwards';
    });
  }
}
const showAnswer = () => {
  disableButtons();
  if ($D('animation') == 'flip') {
    addAnimation($E('#answer-cell'), 'flipA 200ms', target => {
      $E('#answer-cover').style.visibility = 'hidden';
      addAnimation($E('#answer-cell'), 'flipB 200ms', target => {
        enableButtons();
        if ($D('is-auto-read-aloud-enabled')) readAloud();
      });
    });
  } else if ($D('animation') == 'slide') {
    addAnimation($E('#answer-cover'), 'slideOutToRight 400ms', target => {
      $E('#answer-cover').style.visibility = 'hidden';
      enableButtons();
      if ($D('is-auto-read-aloud-enabled')) readAloud();
    });
  } else {
    $E('#answer-cover').style.visibility = 'hidden';
    enableButtons();
    if ($D('is-auto-read-aloud-enabled')) readAloud();
  }
  $D('is-answer-shown', true);
};
const addAnimation = (target, animation, callback) => {
  const eventHandler = event => {
    target.removeEventListener('animationend', eventHandler);
    target.style.animation = '';
    callback && callback(target);
  }
  target.addEventListener('animationend', eventHandler);
  target.style.animation = animation;
};
const readAloud = () => {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance();
  utterance.text = $D('answer-phrase').text;
  utterance.lang = 'en-US';
  utterance.volume = 1;
  utterance.rate = 1;
  utterance.pitch = 1;
  const candidateVoices = [];
  for (const voice of window.speechSynthesis.getVoices()) {
    if (new RegExp(`^${$D('answer-lang')}`, 'i').test(voice.lang)) {
      candidateVoices.push(voice);
    }
  }
  if (candidateVoices.length) {
    const index = Math.floor(candidateVoices.length * Math.random());
    utterance.voice = candidateVoices[index];
  }
  window.speechSynthesis.speak(utterance);
};
const disableButtons = () => {
  $E('#read-aloud-button').disabled = true;
  $E('#play-button').disabled = true;
  $E('#skip-button').disabled = true;
};
const enableButtons = () => {
  $E('#read-aloud-button').disabled = false;
  $E('#play-button').disabled = false;
  $E('#skip-button').disabled = false;
};
window.addEventListener('DOMContentLoaded', main);
