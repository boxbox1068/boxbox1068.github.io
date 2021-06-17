'use strict';
const addKeyDownListener = (listeners) => {
  window.addEventListener('keydown', event => {
    if (/^F\d+$/.test(event.key)) {
      return;
    }
    if (event.ctrlKey || event.altKey || event.metaKey) {
      return;
    }
    event.preventDefault();
    const listener = listeners[event.key];
    if (listener) {
      listener();
    }
  }, {passive: false});
};











/*
window.addEventListener('keydown', event => {
  if (/^F\d+$/.test(event.key)) {
    return;
  }
  if (event.ctrlKey || event.altKey || event.metaKey) {
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
      document.querySelector('#read-aloud-button').click();
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
*/