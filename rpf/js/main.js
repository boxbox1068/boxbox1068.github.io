'use strict';
const $Q = (field, trim, toLowerCase) => {
  let value = undefined;
  const queryString = window.location.search.replace(/^\?/, '');
  const parameters = queryString.split('&');
  for (const parameter of parameters) {
    const currentField = parameter.replace(/=.*/, '').trim().toLowerCase();
    if (currentField == field) {
      value = decodeURIComponent(parameter.replace(/.*?=|.*/, ''));
      if (trim) value = value.trim();
      if (toLowerCase) value = value.toLowerCase();
      break;
    }
  }
  return value;
};
const $E = (selectors, returnMultiple) => {
  if (returnMultiple) {
    return document.querySelectorAll(selectors);
  } else {
    return document.querySelector(selectors);
  }
};
const $D = (key, value) => {
  if (value !== undefined) {
    $D[key] = value;
  }
  return $D[key];
};
const main = () => {
  const lang = {'en': 'en', 'ja': 'ja'}[window.navigator.language] || 'en';
  document.title = {'en': 'Rabbity Phrases Flashcards', 'ja': '鼠算式フレーズ練習帳'}[lang];
  for (const element of $E('[lang]', true)) {
    if (element.lang != lang) {
      element.remove();
    }
  }
  $E('#read-aloud-button').addEventListener('click', readAloud);
  $E('#auto-read-aloud-checkbox').addEventListener('change', event => {
    $D('is-auto-read-aloud-enabled', event.target.checked);
  });
  $E('#play-button').addEventListener('click', event => {
    if ($D('is-answer-shown')) {
      resetCard();
    } else {
      showAnswer();
    }
  });
  $E('#skip-button').addEventListener('click', resetCard);
  $D('refill-count', 0);
  if ($Q('iframe')) {
    window.addEventListener('message', event => {
      const postedData = event.data;
      if (typeof postedData != 'object') return;
      $D('question-template', expandVariables(postedData['question']));
      $D('answer-template', expandVariables(postedData['answer']));
      $D('answer-lang', postedData['lang']);
      $D('caption-text', postedData['caption']);
      $D('animation', postedData['animation']);
      resetCard();
    });
  } else if ($Q('question')) {
    $D('question-template', expandVariables($Q('question', true)));
    $D('answer-template', expandVariables($Q('answer', true)));
    $D('answer-lang', $Q('lang', true, true));
    $D('caption-text', $Q('caption', true));
    $D('animation', $Q('animation', true, true));
    resetCard();
  } else {
    const jsonpUrl = $Q('jsonp') || './data/demo.jsonp';
    const jsonpCallbackScriptElement = document.createElement('script');
    jsonpCallbackScriptElement.innerHTML = `
      const jsonpCallback = jsonData => {
        $D('question-template', expandVariables(jsonData['question']));
        $D('answer-template', expandVariables(jsonData['answer']));
        $D('answer-lang', jsonData['lang']);
        $D('caption-text', jsonData['caption']);
        $D('animation', jsonData['animation']);
        resetCard();
      };
    `;
    document.head.append(jsonpCallbackScriptElement);
    const jsonpFileScriptElement = document.createElement('script');
    jsonpFileScriptElement.src = jsonpUrl;
    document.head.append(jsonpFileScriptElement);
  }
//  $E('#caption-content').style.animation = 'hoge 400ms';
};
const expandVariables = template => {
  for (const key in $templateVariables) {
    template = template.replace(new RegExp(`%${key}%`, 'ig'), $templateVariables[key]);
  }
  return template;
};
const resetCard = () => {
  window.speechSynthesis.cancel();
  const pathIdSeed = Math.random();
  $D('question-phrase', new RabbitPhrase($D('question-template'), pathIdSeed));
  $D('answer-phrase', new RabbitPhrase($D('answer-template'), pathIdSeed));
  $E('#caption-content').innerHTML = $D('caption-text') || '';
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
    addAnimation($E('#question-container'), 'flipA 200ms', target => {
      resetQuestion();
      $E('#question-cover').style.visibility = 'hidden';
      addAnimation($E('#question-container'), 'flipB 200ms', target => {
        enableButtons();
      });
    });
    if ($D('is-answer-shown')) {
      addAnimation($E('#answer-container'), 'flipA 200ms', target => {
        resetAnswer();
        $E('#answer-cover').style.visibility = 'visible';
        addAnimation($E('#answer-container'), 'flipB 200ms', null);
      });
    } else {
      resetAnswer();
    }
  } else if ($D('animation') == 'slide') {
    addAnimation(
      $E('#question-cover'),
      $E('#question-cover').style.visibility == 'hidden' ? 'slideInFromLeft 400ms' : 'dummySlide 0',
      target => {
        resetQuestion();
        addAnimation($E('#question-cover'), 'slideOutToRight 400ms', target => {
          $E('#question-cover').style.visibility = 'hidden';
          enableButtons();
        });
      }
    );
    addAnimation(
      $E('#answer-cover'),
      $E('#answer-cover').style.visibility == 'hidden' ? 'slideInFromLeft 400ms' : 'dummySlide 0',
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
  $E('#question-container').scrollTop = 0;
  $E('#question-content').innerHTML = $D('question-phrase').html;
  addHintBalloons($E('#question-content'), $D('answer-phrase').chosenBranchTexts);
};
const resetAnswer = () => {
  $E('#answer-container').scrollTop = 0;
  $E('#answer-content').innerHTML = $D('answer-phrase').html;
  addHintBalloons($E('#answer-content'), $D('question-phrase').chosenBranchTexts);
}
const addHintBalloons = (targetContent, hintTextList) => {
  const branchElements = targetContent.querySelectorAll('.branch');
  for (const branchElement of branchElements) {
    const branchNumber = Number(branchElement.dataset.branchNumber);
    const hintBalloonContentElement = document.createElement('span');
    hintBalloonContentElement.className = 'hint-balloon-content';
    hintBalloonContentElement.innerText = hintTextList[branchNumber];
    const hintBalloonContainerElement = document.createElement('span');
    hintBalloonContainerElement.className = 'hint-balloon-container';
    hintBalloonContainerElement.append(hintBalloonContentElement);
    branchElement.append(hintBalloonContainerElement);
    const hintBalloonRight = branchElement.getClientRects()[0].left + hintBalloonContainerElement.offsetWidth;
    const hintBalloonContentMarginLeft = Math.min(0, document.body.offsetWidth - hintBalloonRight);
    hintBalloonContentElement.style.marginLeft = `${hintBalloonContentMarginLeft}px`;
    branchElement.addEventListener('mouseenter', event => {
      const branchElement = event.target;
      const hintBalloonContainerElement = branchElement.querySelector('.hint-balloon-container');
      const branchRect = branchElement.getClientRects()[0];
      hintBalloonContainerElement.style.top = `${branchRect.top}px`;
      hintBalloonContainerElement.style.left = `${branchRect.left}px`;
      hintBalloonContainerElement.style.animation = 'fadeIn 400ms';
    });
    branchElement.addEventListener('mouseleave', event => {
      const branchElement = event.target;
      const hintBalloonContainerElement = branchElement.querySelector('.hint-balloon-container');
      hintBalloonContainerElement.style.animation = 'fadeOut 400ms';
    });
  }
}
const showAnswer = () => {
  disableButtons();
  if ($D('animation') == 'flip') {
    addAnimation($E('#answer-container'), 'flipA 200ms', target => {
      $E('#answer-cover').style.visibility = 'hidden';
      addAnimation($E('#answer-container'), 'flipB 200ms', target => {
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
