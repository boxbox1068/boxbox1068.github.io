'use strict';
const $query = (field, trim, toLowerCase) => {
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
const $element = selectors => {
  if (/^\s*#/.test(selectors)) {
    return document.querySelector(selectors);
  } else {
    return document.querySelectorAll(selectors);
  }
};
const $data = {};
const main = () => {
  // dummy
  {

    $data.questionTemplate = 'もし私が^[鳥|魚|犬|猫|馬]だったら^[空を自由に飛べる|海深くまで泳げる|君の匂いを嗅ぎ分けられる|一日中寝ていられる|風より速く走れる]んだけど。';
    $data.answerTemplate = 'If I were ^[a bird|a fish|a dog|a cat|a horse], I could ^[fly freely in the sky|swim deep in the ocean|pick up your scent|sleep all day long|run faster than wind].';

    $data.questionTemplate = '^[私|君|彼|彼女|私たちの|君たち|彼ら|彼女ら]の^^[誕生日|結婚記念日|命日]は^^^[1|2|3|4|5|6|7|8|9|10|11|12]月^^^^[1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|^^^[30||30|30|30|30|30|30|30|30|30|30]|^^^[31||31||31||31|31||31||31]]日^^^^^[です|だった|になるだろう]。';
    $data.answerTemplate = '^[My|Your|His|Her|Our|Your|Their|Their] ^^[birthday|wedding anniversary|death anniversary] ^^^^^[is|was|will be] ^^^[January|February|March|April|May|June|July|August|September|October|November|December] ^^^^[1st|2nd|3rd|4th|5th|6th|7th|8th|9th|10th|11th|12th|13th|14th|15th|16th|17th|18th|19th|20th|21st|22nd|23rd|24th|25th|26th|27th|28th|29th|^[30th||30th|30th|30th|30th|30th|30th|30th|30th|30th|30th]|^[31st||31st||31st||31st|31st||31st||31st]].';

    $data.questionTemplate = '^[彼ら|彼女ら]は親切^^[だ|だった]。';
    $data.answerTemplate = '^[They|-] ^^[are|were] kind.';

    $data.questionTemplate = '^[1|2|3|4|5|6|7|8|9|10|11|12]月^^[1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|^[|!||||||||||]30|^[|!||!||!|||!||!|]31]日';
    $data.answerTemplate = '^[1|2|3|4|5|6|7|8|9|10|11|12]月^^[1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|^[|!||||||||||]30|^[|!||!||!|||!||!|]31]日';

    $data.questionTemplate = '^[^^[1|3|5|7|8|10|12]月|^^^[4|6|9|11]月|2月]^[^^^^^[1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31]日|^^^^^^[1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30]日|^^^^^^^^^^^^[1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29]日]';
    $data.answerTemplate = 'expandVariables';


    $data.questionTemplate = '^[1月1日|1月2日|1月3日|1月4日|1月5日|1月6日|1月7日|1月8日|1月9日|1月10日|1月11日|1月12日|1月13日|1月14日|1月15日|1月16日|1月17日|1月18日|1月19日|1月20日|1月21日|1月22日|1月23日|1月24日|1月25日|1月26日|1月27日|1月28日|1月29日|1月30日|1月31日|2月1日|2月2日|2月3日|2月4日|2月5日|2月6日|2月7日|2月8日|2月9日|2月10日|2月11日|2月12日|2月13日|2月14日|2月15日|2月16日|2月17日|2月18日|2月19日|2月20日|2月21日|2月22日|2月23日|2月24日|2月25日|2月26日|2月27日|2月28日|2月29日|3月1日|3月2日|3月3日|3月4日|3月5日|3月6日|3月7日|3月8日|3月9日|3月10日|3月11日|3月12日|3月13日|3月14日|3月15日|3月16日|3月17日|3月18日|3月19日|3月20日|3月21日|3月22日|3月23日|3月24日|3月25日|3月26日|3月27日|3月28日|3月29日|3月30日|3月31日|4月1日|4月2日|4月3日|4月4日|4月5日|4月6日|4月7日|4月8日|4月9日|4月10日|4月11日|4月12日|4月13日|4月14日|4月15日|4月16日|4月17日|4月18日|4月19日|4月20日|4月21日|4月22日|4月23日|4月24日|4月25日|4月26日|4月27日|4月28日|4月29日|4月30日|5月1日|5月2日|5月3日|5月4日|5月5日|5月6日|5月7日|5月8日|5月9日|5月10日|5月11日|5月12日|5月13日|5月14日|5月15日|5月16日|5月17日|5月18日|5月19日|5月20日|5月21日|5月22日|5月23日|5月24日|5月25日|5月26日|5月27日|5月28日|5月29日|5月30日|5月31日|6月1日|6月2日|6月3日|6月4日|6月5日|6月6日|6月7日|6月8日|6月9日|6月10日|6月11日|6月12日|6月13日|6月14日|6月15日|6月16日|6月17日|6月18日|6月19日|6月20日|6月21日|6月22日|6月23日|6月24日|6月25日|6月26日|6月27日|6月28日|6月29日|6月30日|7月1日|7月2日|7月3日|7月4日|7月5日|7月6日|7月7日|7月8日|7月9日|7月10日|7月11日|7月12日|7月13日|7月14日|7月15日|7月16日|7月17日|7月18日|7月19日|7月20日|7月21日|7月22日|7月23日|7月24日|7月25日|7月26日|7月27日|7月28日|7月29日|7月30日|7月31日|8月1日|8月2日|8月3日|8月4日|8月5日|8月6日|8月7日|8月8日|8月9日|8月10日|8月11日|8月12日|8月13日|8月14日|8月15日|8月16日|8月17日|8月18日|8月19日|8月20日|8月21日|8月22日|8月23日|8月24日|8月25日|8月26日|8月27日|8月28日|8月29日|8月30日|8月31日|9月1日|9月2日|9月3日|9月4日|9月5日|9月6日|9月7日|9月8日|9月9日|9月10日|9月11日|9月12日|9月13日|9月14日|9月15日|9月16日|9月17日|9月18日|9月19日|9月20日|9月21日|9月22日|9月23日|9月24日|9月25日|9月26日|9月27日|9月28日|9月29日|9月30日|10月1日|10月2日|10月3日|10月4日|10月5日|10月6日|10月7日|10月8日|10月9日|10月10日|10月11日|10月12日|10月13日|10月14日|10月15日|10月16日|10月17日|10月18日|10月19日|10月20日|10月21日|10月22日|10月23日|10月24日|10月25日|10月26日|10月27日|10月28日|10月29日|10月30日|10月31日|11月1日|11月2日|11月3日|11月4日|11月5日|11月6日|11月7日|11月8日|11月9日|11月10日|11月11日|11月12日|11月13日|11月14日|11月15日|11月16日|11月17日|11月18日|11月19日|11月20日|11月21日|11月22日|11月23日|11月24日|11月25日|11月26日|11月27日|11月28日|11月29日|11月30日|12月1日|12月2日|12月3日|12月4日|12月5日|12月6日|12月7日|12月8日|12月9日|12月10日|12月11日|12月12日|12月13日|12月14日|12月15日|12月16日|12月17日|12月18日|12月19日|12月20日|12月21日|12月22日|12月23日|12月24日|12月25日|12月26日|12月27日|12月28日|12月29日|12月30日|12月31日]';
    $data.answerTemplate = '^[January 1st|January 2nd|January 3rd|January 4th|January 5th|January 6th|January 7th|January 8th|January 9th|January 10th|January 11th|January 12th|January 13th|January 14th|January 15th|January 16th|January 17th|January 18th|January 19th|January 20th|January 21st|January 22nd|January 23rd|January 24th|January 25th|January 26th|January 27th|January 28th|January 29th|January 30th|January 31st|February 1st|February 2nd|February 3rd|February 4th|February 5th|February 6th|February 7th|February 8th|February 9th|February 10th|February 11th|February 12th|February 13th|February 14th|February 15th|February 16th|February 17th|February 18th|February 19th|February 20th|February 21st|February 22nd|February 23rd|February 24th|February 25th|February 26th|February 27th|February 28th|February 29th|March 1st|March 2nd|March 3rd|March 4th|March 5th|March 6th|March 7th|March 8th|March 9th|March 10th|March 11th|March 12th|March 13th|March 14th|March 15th|March 16th|March 17th|March 18th|March 19th|March 20th|March 21st|March 22nd|March 23rd|March 24th|March 25th|March 26th|March 27th|March 28th|March 29th|March 30th|March 31st|April 1st|April 2nd|April 3rd|April 4th|April 5th|April 6th|April 7th|April 8th|April 9th|April 10th|April 11th|April 12th|April 13th|April 14th|April 15th|April 16th|April 17th|April 18th|April 19th|April 20th|April 21st|April 22nd|April 23rd|April 24th|April 25th|April 26th|April 27th|April 28th|April 29th|April 30th|May 1st|May 2nd|May 3rd|May 4th|May 5th|May 6th|May 7th|May 8th|May 9th|May 10th|May 11th|May 12th|May 13th|May 14th|May 15th|May 16th|May 17th|May 18th|May 19th|May 20th|May 21st|May 22nd|May 23rd|May 24th|May 25th|May 26th|May 27th|May 28th|May 29th|May 30th|May 31st|June 1st|June 2nd|June 3rd|June 4th|June 5th|June 6th|June 7th|June 8th|June 9th|June 10th|June 11th|June 12th|June 13th|June 14th|June 15th|June 16th|June 17th|June 18th|June 19th|June 20th|June 21st|June 22nd|June 23rd|June 24th|June 25th|June 26th|June 27th|June 28th|June 29th|June 30th|July 1st|July 2nd|July 3rd|July 4th|July 5th|July 6th|July 7th|July 8th|July 9th|July 10th|July 11th|July 12th|July 13th|July 14th|July 15th|July 16th|July 17th|July 18th|July 19th|July 20th|July 21st|July 22nd|July 23rd|July 24th|July 25th|July 26th|July 27th|July 28th|July 29th|July 30th|July 31st|August 1st|August 2nd|August 3rd|August 4th|August 5th|August 6th|August 7th|August 8th|August 9th|August 10th|August 11th|August 12th|August 13th|August 14th|August 15th|August 16th|August 17th|August 18th|August 19th|August 20th|August 21st|August 22nd|August 23rd|August 24th|August 25th|August 26th|August 27th|August 28th|August 29th|August 30th|August 31st|September 1st|September 2nd|September 3rd|September 4th|September 5th|September 6th|September 7th|September 8th|September 9th|September 10th|September 11th|September 12th|September 13th|September 14th|September 15th|September 16th|September 17th|September 18th|September 19th|September 20th|September 21st|September 22nd|September 23rd|September 24th|September 25th|September 26th|September 27th|September 28th|September 29th|September 30th|October 1st|October 2nd|October 3rd|October 4th|October 5th|October 6th|October 7th|October 8th|October 9th|October 10th|October 11th|October 12th|October 13th|October 14th|October 15th|October 16th|October 17th|October 18th|October 19th|October 20th|October 21st|October 22nd|October 23rd|October 24th|October 25th|October 26th|October 27th|October 28th|October 29th|October 30th|October 31st|November 1st|November 2nd|November 3rd|November 4th|November 5th|November 6th|November 7th|November 8th|November 9th|November 10th|November 11th|November 12th|November 13th|November 14th|November 15th|November 16th|November 17th|November 18th|November 19th|November 20th|November 21st|November 22nd|November 23rd|November 24th|November 25th|November 26th|November 27th|November 28th|November 29th|November 30th|December 1st|December 2nd|December 3rd|December 4th|December 5th|December 6th|December 7th|December 8th|December 9th|December 10th|December 11th|December 12th|December 13th|December 14th|December 15th|December 16th|December 17th|December 18th|December 19th|December 20th|December 21st|December 22nd|December 23rd|December 24th|December 25th|December 26th|December 27th|December 28th|December 29th|December 30th|December 31st]';
    //^[1月|2|3|4|5|6|7|8|9|10|11|12月]^[1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29-30-31|1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29|1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29-30-31|1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29-30|1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29-30-31|1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29-30|1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29-30-31|1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29-30-31|1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29-30|1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29-30-31|1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29-30|1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29-30-31]


    /*
^[1|2|3|4|5|6|7|8|9|10|11|12]月^[1+2+3+4+5+6+7+8+9+10+11+12+13+14+15+16+17+18+19+20+21+22+23+24+25+26+27+28+29+30+31|||||||||||]日

^[1|2|3|4|5|6|7|8|9|10|11|12]月^^[1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|^[|!||||||||||]30|^[|!||!||!|||!||!|]31]


*/

    $data.animation = 'slide';
  }
  $element('#read-aloud-button').addEventListener('click', readAloud);
  $element('#auto-read-aloud-checkbox').addEventListener('change', event => {
    $data.isAutoReadAloudEnabled = event.target.checked;
  });
  $element('#play-button').addEventListener('click', event => {
    if ($data.isAnswerShown) {
      resetCard();
    } else {
      showAnswer();
    }
  });
  $element('#skip-button').addEventListener('click', resetCard);

  $data.trainingCount = 0;
  if ($query('jsonp')) {
    const jsonpCallbackScriptElement = document.createElement('script');
    jsonpCallbackScriptElement.innerHTML = `
      const jsonpCallback = jsonData => {
        $data.questionTemplate = expandVariables(jsonData['question']);
        $data.answerTemplate = expandVariables(jsonData['answer']);
        $data.answerLang = jsonData['lang'];
        $data.captionText = jsonData['caption'];
        $data.animation = jsonData['animation'];
        resetCard();
      };
    `;
    document.head.append(jsonpCallbackScriptElement);
    const jsonpFileScriptElement = document.createElement('script');
    jsonpFileScriptElement.src = $query('jsonp');
    document.head.append(jsonpFileScriptElement);
  } else if ($query('question')) {
    $data.questionTemplate = expandVariables($query('question', true));
    $data.answerTemplate = expandVariables($query('answer', true));
    $data.answerLang = $query('lang', true, true);
    $data.captionText = $query('caption', true);
    $data.animation = $query('animation', true, true);
    resetCard();
  } else {
    if (window.parent != window) {
      window.addEventListener('message', event => {
        const postedData = event.data;
        if (typeof postedData != 'object') return;
        $data.questionTemplate = expandVariables(postedData['question']);
        $data.answerTemplate = expandVariables(postedData['answer']);
        $data.answerLang = postedData['lang'];
        $data.captionText = postedData['caption'];
        $data.animation = postedData['animation'];
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
  const pathIdSeed = Math.random();
  $data.questionPhrase = new RabbitPhrase($data.questionTemplate, pathIdSeed);
  $data.answerPhrase = new RabbitPhrase($data.answerTemplate, pathIdSeed);
  $element('#caption-content').innerHTML = $data.captionText || '';
  $element('#pattern-count').innerHTML = $data.questionPhrase.possiblePathCount.toLocaleString();
  $element('#pattern-id').innerHTML = $data.questionPhrase.pathId.toLocaleString();
  $element('#training-count').innerHTML = ($data.trainingCount++).toLocaleString();
  $data.isAnswerShown = true;
  showQuestion();
};
const showQuestion = () => {
  disableButtons();
  if ($data.animation == 'flip') {
    addAnimation($element('#question-wrapper'), 'flipA 200ms', target => {
      resetQuestion();
      $element('#question-cover').style.visibility = 'hidden';
      addAnimation($element('#question-wrapper'), 'flipB 200ms', target => {
        enableButtons();
      });
    });
    if ($data.isAnswerShown) {
      addAnimation($element('#answer-wrapper'), 'flipA 200ms', target => {
        resetAnswer();
        $element('#answer-cover').style.visibility = 'visible';
        addAnimation($element('#answer-wrapper'), 'flipB 200ms', null);
      });
    } else {
      resetAnswer();
    }
  } else if ($data.animation == 'slide') {
    addAnimation(
      $element('#question-cover'),
      $element('#question-cover').style.visibility == 'hidden' ? 'slideInFromLeft 400ms' : 'dummySlide 0',
      target => {
        resetQuestion();
        addAnimation($element('#question-cover'), 'slideOutToRight 400ms', target => {
          $element('#question-cover').style.visibility = 'hidden';
          enableButtons();
        });
      }
    );
    addAnimation(
      $element('#answer-cover'),
      $element('#answer-cover').style.visibility == 'hidden' ? 'slideInFromLeft 400ms' : 'dummySlide 0',
      target => {
        resetAnswer();
        $element('#answer-cover').style.visibility = 'visible';
      }
    );
  } else {
    resetQuestion();
    $element('#question-cover').style.visibility = 'hidden';
    resetAnswer();
    $element('#answer-cover').style.visibility = 'visible';
    enableButtons();
  }
  $data.isAnswerShown = false;
};
const resetQuestion = () => {
  $element('#question-wrapper').scrollTop = 0;
  $element('#question-content').innerHTML = $data.questionPhrase.html;
  addHintBalloons($element('#question-content'), $data.answerPhrase.chosenBranchTexts);
};
const resetAnswer = () => {
  $element('#answer-wrapper').scrollTop = 0;
  $element('#answer-content').innerHTML = $data.answerPhrase.html;
  addHintBalloons($element('#answer-content'), $data.questionPhrase.chosenBranchTexts);
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
  if ($data.animation == 'flip') {
    addAnimation($element('#answer-wrapper'), 'flipA 200ms', target => {
      $element('#answer-cover').style.visibility = 'hidden';
      addAnimation($element('#answer-wrapper'), 'flipB 200ms', target => {
        enableButtons();
        if ($data.isAutoReadAloudEnabled) readAloud();
      });
    });
  } else if ($data.animation == 'slide') {
    addAnimation($element('#answer-cover'), 'slideOutToRight 400ms', target => {
      $element('#answer-cover').style.visibility = 'hidden';
      enableButtons();
      if ($data.isAutoReadAloudEnabled) readAloud();
    });
  } else {
    $element('#answer-cover').style.visibility = 'hidden';
    enableButtons();
    if ($data.isAutoReadAloudEnabled) readAloud();
  }
  $data.isAnswerShown = true;
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
  utterance.text = $data.answerPhrase.text;
  utterance.lang = 'en-US';
  utterance.volume = 1;
  utterance.rate = 1;
  utterance.pitch = 1;
  const candidateVoices = [];
  for (const voice of window.speechSynthesis.getVoices()) {
    if (new RegExp(`^${$data.answerLang}`, 'i').test(voice.lang)) {
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
  $element('#read-aloud-button').disabled = true;
  $element('#play-button').disabled = true;
  $element('#skip-button').disabled = true;
};
const enableButtons = () => {
  $element('#read-aloud-button').disabled = false;
  $element('#play-button').disabled = false;
  $element('#skip-button').disabled = false;
};
window.addEventListener('DOMContentLoaded', main);
