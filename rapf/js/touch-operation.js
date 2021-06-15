'use strict';
{
  const MIN_VALID_MOVE_X = 25;
  const pastTouches = [];
  window.addEventListener('touchstart', event => {
    if (event.touches.length > 1) {
      pastTouches = [];
      event.preventDefault();
      return;
    }
    const currentTouch = event.touches[0];
    pastTouches.push({
      'pageX': currentTouch.pageX,
      'pageY': currentTouch.pageY
    });
  }, {passive: false});
  window.addEventListener('touchmove', event => {
    if (! pastTouches.length) {
      return;
    }
    if (event.touches.length > 1) {
      pastTouches = [];
      event.preventDefault();
      return;
    }
    const currentTouch = event.touches[0];
    const firstTouch = pastTouches[0];
    const lastTouch = pastTouches[pastTouches.length - 1];
    const longMoveX = currentTouch.pageX - firstTouch.pageX;
    const longMoveY = currentTouch.pageY - firstTouch.pageY;
    const shortMoveX = currentTouch.pageX - lastTouch.pageX;
    const shortMoveY = currentTouch.pageY - lastTouch.pageY;
    if (Math.abs(shortMoveX) < Math.abs(shortMoveY) || shortMoveX * longMoveX < 0) {
      pastTouches = [];
      return;
    }
    pastTouches.push({
      'pageX': currentTouch.pageX,
      'pageY': currentTouch.pageY
    });
    event.preventDefault();
  }, {passive: false});
  window.addEventListener('touchend', event => {
    if (! pastTouches.length) {
      return;
    }
    const firstTouch = pastTouches[0];
    const lastTouch = pastTouches[pastTouches.length - 1];
    const longMoveX = lastTouch.pageX - firstTouch.pageX;
    if (longMoveX >= MIN_VALID_MOVE_X) {
      onSwipeToRight();
      event.preventDefault();
    } else if (longMoveX <= MIN_VALID_MOVE_X * -1) {
      onSwipeToLeft();
      event.preventDefault();
    }
    pastTouches = [];
  }, {passive: false});
  const onSwipeToRight = () => {
    const foldLeadCheckboxElement = document.querySelector('#fold-lead-checkbox');
    if (foldLeadCheckboxElement.checked) {
      document.querySelector('#play-button').click();
    } else {
      foldLeadCheckboxElement.checked = true;
      foldLeadCheckboxElement.dispatchEvent(new Event('change'));
    }
  };
  const onSwipeToLeft = () => {
    if (! document.querySelector('#enable-skip-by-swipe-checkbox').checked) {
      return;
    }
    const foldLeadCheckboxElement = document.querySelector('#fold-lead-checkbox');
    if (foldLeadCheckboxElement.checked) {
      document.querySelector('#skip-button').click();
    } else {
      foldLeadCheckboxElement.checked = true;
      foldLeadCheckboxElement.dispatchEvent(new Event('change'));
    }
  };
}









/*
{
  const MIN_VALID_MOVE_X = 25;
  let firstTouch = null;
  let lastTouch = null;
  window.addEventListener('touchstart', event => {
    if (event.touches.length > 1) {
      firstTouch = null;
      lastTouch = null;
      event.preventDefault();
      return;
    }
    const currentTouch = event.touches[0];
    firstTouch = {
      'pageX': currentTouch.pageX,
      'pageY': currentTouch.pageY
    };
    lastTouch = {...firstTouch};
  }, {passive: false});
  window.addEventListener('touchmove', event => {
    if (event.touches.length > 1) {
      firstTouch = null;
      lastTouch = null;
      event.preventDefault();
      return;
    }
    if (firstTouch && lastTouch) {
      const currentTouch = event.touches[0];
      const shortMoveX = currentTouch.pageX - lastTouch.pageX;
      const shortMoveY = currentTouch.pageY - lastTouch.pageY;
      if (Math.abs(shortMoveX) > Math.abs(shortMoveY)) {
        const longMoveX = currentTouch.pageX - firstTouch.pageX;
        const longMoveY = currentTouch.pageY - firstTouch.pageY;
        if ((longMoveX > 0 && shortMoveX > 0) || (longMoveX < 0 && shortMoveX < 0)) {
          lastTouch = {
            'pageX': currentTouch.pageX,
            'pageY': currentTouch.pageY
          };
        } else {
          firstTouch = null;
          lastTouch = null;
        }
      } else {
        firstTouch = null;
        lastTouch = null;
      }
    }
  }, {passive: false});
  window.addEventListener('touchend', event => {
    if (firstTouch && lastTouch) {
      const longMoveX = lastTouch.pageX - firstTouch.pageX;
      if (longMoveX >= MIN_VALID_MOVE_X) {
        event.preventDefault();
        onSwipeToRight();
      } else if (longMoveX <= MIN_VALID_MOVE_X * -1) {
        event.preventDefault();
        onSwipeToLeft();
      }
      firstTouch = null;
      lastTouch = null;
    }
  }, {passive: false});
  const onSwipeToRight = () => {
    const foldLeadCheckboxElement = document.querySelector('#fold-lead-checkbox');
    if (foldLeadCheckboxElement.checked) {
      document.querySelector('#play-button').click();
    } else {
      foldLeadCheckboxElement.checked = true;
      foldLeadCheckboxElement.dispatchEvent(new Event('change'));
    }
  };
  const onSwipeToLeft = () => {
    if (! document.querySelector('#enable-skip-by-swipe-checkbox').checked) {
      return;
    }
    const foldLeadCheckboxElement = document.querySelector('#fold-lead-checkbox');
    if (foldLeadCheckboxElement.checked) {
      document.querySelector('#skip-button').click();
    } else {
      foldLeadCheckboxElement.checked = true;
      foldLeadCheckboxElement.dispatchEvent(new Event('change'));
    }
  };
}
*/
