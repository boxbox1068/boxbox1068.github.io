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
      $e('#play-button').click();
      break;
    case 'Tab':
      $e('#skip-button').click();
      break;
    case 'Enter':
      $e('#speak-button').click();
      break;
    case 'Escape':
      $e('#fold-lead-checkbox').click();
      break;
    case 'l':
      $e('#scroll-down-lead-button').click();
      break;
    case 'L':
      $e('#scroll-up-lead-button').click();
      break;
    case 'q':
      $e('#scroll-down-question-button').click();
      break;
    case 'Q':
      $e('#scroll-up-question-button').click();
      break;
    case 'a':
      $e('#scroll-down-answer-button').click();
      break;
    case 'A':
      $e('#scroll-up-answer-button').click();
      break;
  }
});
