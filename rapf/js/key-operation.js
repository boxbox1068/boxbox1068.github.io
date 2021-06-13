'use strict';
window.addEventListener('keydown', event => {
  if (event.ctrlKey || event.altKey || event.metaKey) {
    return;
  }
  if (/^F\d+$/.test(event.key)) {
    return;
  }
  event.preventDefault();
  switch (event.key) {
    case ' ':
      document.querySelector('#play-button').click();
      break;
    case 'Tab':
      document.querySelector('#skip-button').click();
      break;
    case 'Enter':
      document.querySelector('#speak-button').click();
      break;
    case 'Escape':
      document.querySelector('#fold-lead-checkbox').click();
      break;
    case 'l':
      document.querySelector('#scroll-down-lead-button').click();
      break;
    case 'L':
      document.querySelector('#scroll-up-lead-button').click();
      break;
    case 'q':
      document.querySelector('#scroll-down-question-button').click();
      break;
    case 'Q':
      document.querySelector('#scroll-up-question-button').click();
      break;
    case 'a':
      document.querySelector('#scroll-down-answer-button').click();
      break;
    case 'A':
      document.querySelector('#scroll-up-answer-button').click();
      break;
  }
});
