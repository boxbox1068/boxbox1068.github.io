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
  }
});
