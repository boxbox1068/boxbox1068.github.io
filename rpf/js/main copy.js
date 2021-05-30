'use strict';
const $q = (field, trim, toLowerCase) => {
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
const $e = selectors => {
  if (/^\s*#/.test(selectors)) {
    return document.querySelector(selectors);
  } else {
    return document.querySelectorAll(selectors);
  }
};
const $d = {};
const main = () => {
  // dummy
  {
    //^[1月|2|3|4|5|6|7|8|9|10|11|12月]^[1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29-30-31|1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29|1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29-30-31|1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29-30|1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29-30-31|1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29-30|1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29-30-31|1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29-30-31|1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29-30|1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29-30-31|1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29-30|1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29-30-31]


    /*
^[1|2|3|4|5|6|7|8|9|10|11|12]月^[1+2+3+4+5+6+7+8+9+10+11+12+13+14+15+16+17+18+19+20+21+22+23+24+25+26+27+28+29+30+31|||||||||||]日

^[1|2|3|4|5|6|7|8|9|10|11|12]月^^[1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|^[|!||||||||||]30|^[|!||!||!|||!||!|]31]


*/

    $d.animation = 'slide';
  }
  $e('#read-aloud-button').addEventListener('click', readAloud);
  $e('#auto-read-aloud-checkbox').addEventListener('change', event => {
    $d.isAutoReadAloudEnabled = event.target.checked;
  });
  $e('#play-button').addEventListener('click', event => {
    if ($d.isAnswerShown) {
      resetCard();
    } else {
      showAnswer();
    }
  });
  $e('#skip-button').addEventListener('click', resetCard);

  $d.trainingCount = 0;
  if ($q('jsonp')) {
    const jsonpCallbackScriptElement = document.createElement('script');
    jsonpCallbackScriptElement.innerHTML = `
      const jsonpCallback = jsonData => {
        $d.questionTemplate = expandVariables(jsonData['question']);
        $d.answerTemplate = expandVariables(jsonData['answer']);
        $d.answerLang = jsonData['lang'];
        $d.captionText = jsonData['caption'];
        $d.animation = jsonData['animation'];
        resetCard();
      };
    `;
    document.head.append(jsonpCallbackScriptElement);
    const jsonpFileScriptElement = document.createElement('script');
    jsonpFileScriptElement.src = $q('jsonp');
    document.head.append(jsonpFileScriptElement);
  } else if ($q('question')) {
    $d.questionTemplate = expandVariables($q('question', true));
    $d.answerTemplate = expandVariables($q('answer', true));
    $d.answerLang = $q('lang', true, true);
    $d.captionText = $q('caption', true);
    $d.animation = $q('animation', true, true);
    resetCard();
  } else {
    if (window.parent != window) {
      window.addEventListener('message', event => {
        const postedData = event.data;
        if (typeof postedData != 'object') return;
        $d.questionTemplate = expandVariables(postedData['question']);
        $d.answerTemplate = expandVariables(postedData['answer']);
        $d.answerLang = postedData['lang'];
        $d.captionText = postedData['caption'];
        $d.animation = postedData['animation'];
        resetCard();
      });
    }
  }
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
  $d.questionPhrase = new RabbitPhrase($d.questionTemplate, pathIdSeed);
  $d.answerPhrase = new RabbitPhrase($d.answerTemplate, pathIdSeed);
  $e('#caption-content').innerHTML = $d.captionText || '';
  $e('#pattern-count').innerHTML = $d.questionPhrase.possiblePathCount.toLocaleString();
  $e('#pattern-id').innerHTML = $d.questionPhrase.pathId.toLocaleString();
  $e('#training-count').innerHTML = ($d.trainingCount++).toLocaleString();
  $d.isAnswerShown = true;
  showQuestion();
};
const showQuestion = () => {
  disableButtons();
  if ($d.animation == 'flip') {
    addAnimation($e('#question-wrapper'), 'flipA 200ms', target => {
      resetQuestion();
      $e('#question-cover').style.visibility = 'hidden';
      addAnimation($e('#question-wrapper'), 'flipB 200ms', target => {
        enableButtons();
      });
    });
    if ($d.isAnswerShown) {
      addAnimation($e('#answer-wrapper'), 'flipA 200ms', target => {
        resetAnswer();
        $e('#answer-cover').style.visibility = 'visible';
        addAnimation($e('#answer-wrapper'), 'flipB 200ms', null);
      });
    } else {
      resetAnswer();
    }
  } else if ($d.animation == 'slide') {
    addAnimation(
      $e('#question-cover'),
      $e('#question-cover').style.visibility == 'hidden' ? 'slideInFromLeft 400ms' : 'dummySlide 0',
      target => {
        resetQuestion();
        addAnimation($e('#question-cover'), 'slideOutToRight 400ms', target => {
          $e('#question-cover').style.visibility = 'hidden';
          enableButtons();
        });
      }
    );
    addAnimation(
      $e('#answer-cover'),
      $e('#answer-cover').style.visibility == 'hidden' ? 'slideInFromLeft 400ms' : 'dummySlide 0',
      target => {
        resetAnswer();
        $e('#answer-cover').style.visibility = 'visible';
      }
    );
  } else {
    resetQuestion();
    $e('#question-cover').style.visibility = 'hidden';
    resetAnswer();
    $e('#answer-cover').style.visibility = 'visible';
    enableButtons();
  }
  $d.isAnswerShown = false;
};
const resetQuestion = () => {
  $e('#question-wrapper').scrollTop = 0;
  $e('#question-content').innerHTML = $d.questionPhrase.html;
  addHintBalloons($e('#question-content'), $d.answerPhrase.chosenBranchTexts);
};
const resetAnswer = () => {
  $e('#answer-wrapper').scrollTop = 0;
  $e('#answer-content').innerHTML = $d.answerPhrase.html;
  addHintBalloons($e('#answer-content'), $d.questionPhrase.chosenBranchTexts);
}
const addHintBalloons = (targetContent, hintTextList) => {
  const branchElements = targetContent.querySelectorAll('.branch');
  for (const branchElement of branchElements) {
    const branchNumber = Number(branchElement.dataset.branchNumber);
    const hintBalloonContentElement = document.createElement('span');
    hintBalloonContentElement.className = 'hint-balloon-content';
    hintBalloonContentElement.innerText = hintTextList[branchNumber];
    const hintBalloonWrapperElement = document.createElement('span');
    hintBalloonWrapperElement.className = 'hint-balloon-wrapper';
    hintBalloonWrapperElement.append(hintBalloonContentElement);
    branchElement.append(hintBalloonWrapperElement);
    const hintBalloonRight = branchElement.getClientRects()[0].left + hintBalloonWrapperElement.offsetWidth;
    const hintBalloonContentMarginLeft = Math.min(0, document.body.offsetWidth - hintBalloonRight);
    hintBalloonContentElement.style.marginLeft = `${hintBalloonContentMarginLeft}px`;
    branchElement.addEventListener('mouseenter', event => {
      const branchElement = event.target;
      const hintBalloonWrapperElement = branchElement.querySelector('.hint-balloon-wrapper');
      const branchRect = branchElement.getClientRects()[0];
      hintBalloonWrapperElement.style.top = `${branchRect.top}px`;
      hintBalloonWrapperElement.style.left = `${branchRect.left}px`;
      hintBalloonWrapperElement.style.animation = 'fadeIn 400ms';
    });
    branchElement.addEventListener('mouseleave', event => {
      const branchElement = event.target;
      const hintBalloonWrapperElement = branchElement.querySelector('.hint-balloon-wrapper');
      hintBalloonWrapperElement.style.animation = 'fadeOut 400ms';
    });
  }
}
const showAnswer = () => {
  disableButtons();
  if ($d.animation == 'flip') {
    addAnimation($e('#answer-wrapper'), 'flipA 200ms', target => {
      $e('#answer-cover').style.visibility = 'hidden';
      addAnimation($e('#answer-wrapper'), 'flipB 200ms', target => {
        enableButtons();
        if ($d.isAutoReadAloudEnabled) readAloud();
      });
    });
  } else if ($d.animation == 'slide') {
    addAnimation($e('#answer-cover'), 'slideOutToRight 400ms', target => {
      $e('#answer-cover').style.visibility = 'hidden';
      enableButtons();
      if ($d.isAutoReadAloudEnabled) readAloud();
    });
  } else {
    $e('#answer-cover').style.visibility = 'hidden';
    enableButtons();
    if ($d.isAutoReadAloudEnabled) readAloud();
  }
  $d.isAnswerShown = true;
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
  utterance.text = $d.answerPhrase.text;
  utterance.lang = 'en-US';
  utterance.volume = 1;
  utterance.rate = 1;
  utterance.pitch = 1;
  const candidateVoices = [];
  for (const voice of window.speechSynthesis.getVoices()) {
    if (new RegExp(`^${$d.answerLang}`, 'i').test(voice.lang)) {
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
  $e('#read-aloud-button').disabled = true;
  $e('#play-button').disabled = true;
  $e('#skip-button').disabled = true;
};
const enableButtons = () => {
  $e('#read-aloud-button').disabled = false;
  $e('#play-button').disabled = false;
  $e('#skip-button').disabled = false;
};
window.addEventListener('DOMContentLoaded', main);
