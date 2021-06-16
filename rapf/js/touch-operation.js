'use strict';
const addSwipeEventListener = (targetElement, minValidMoveX, listener) => {
  let firstTouch = null;
  let lastTouch = null;
  targetElement.addEventListener('touchstart', event => {
    if (event.touches.length > 1) {
      firstTouch = null;
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
  targetElement.addEventListener('touchmove', event => {
    if (! firstTouch) {
      return;
    }
    const currentTouch = event.touches[0];
    const moveX = currentTouch.pageX - lastTouch.pageX;
    const moveY = currentTouch.pageY - lastTouch.pageY;
    if (Math.abs(moveX) < Math.abs(moveY) || moveX * minValidMoveX < 0) {
      firstTouch = null;
      return;
    }
    lastTouch = {
      'pageX': currentTouch.pageX,
      'pageY': currentTouch.pageY
    };
    event.preventDefault();
  }, {passive: false});
  targetElement.addEventListener('touchend', event => {
    if (! firstTouch) {
      return;
    }
    const moveX = lastTouch.pageX - firstTouch.pageX;
    if (Math.abs(moveX) >= Math.abs(minValidMoveX)) {
      listener();
      event.preventDefault();
    }
    firstTouch = null;
  }, {passive: false});
};
const addDoubleTapEventListener = (targetElement, maxValidInterval, listener) => {
  let tapCount = 0;
  let timeoutId = null;
  targetElement.addEventListener('touchstart', event => {
    if (event.touches.length > 1) {
      tapCount = 0;
      event.preventDefault();
      return;
    }
    tapCount++;
  });
  targetElement.addEventListener('touchmove', event => {
    tapCount = 0;
  });
  targetElement.addEventListener('touchend', event => {
    event.preventDefault();
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      timeoutId = null;
      if (tapCount == 1) {
        event.target.dispatchEvent(new MouseEvent('click', {
          clientX: 0,
          clientY: 0,
          bubbles: true
        }));
      } else if (tapCount == 2) {
        listener();
      }
      tapCount = 0;
    }, maxValidInterval);
  }, {passive: false});
};











/*
const addSwipeEventListener = (targetElement, minValidMoveX, listener) => {
  const pastTouches = [];
  targetElement.addEventListener('touchstart', event => {
    if (event.touches.length > 1) {
      pastTouches.splice(0);
      event.preventDefault();
      return;
    }
    const currentTouch = event.touches[0];
    pastTouches.push({
      'pageX': currentTouch.pageX,
      'pageY': currentTouch.pageY
    });
  }, {passive: false});
  targetElement.addEventListener('touchmove', event => {
    if (! pastTouches.length) {
      return;
    }
    if (event.touches.length > 1) {
      pastTouches.splice(0);
      event.preventDefault();
      return;
    }
    const currentTouch = event.touches[0];
    const lastTouch = pastTouches[pastTouches.length - 1];
    const moveX = currentTouch.pageX - lastTouch.pageX;
    const moveY = currentTouch.pageY - lastTouch.pageY;
    if (Math.abs(moveX) < Math.abs(moveY) || moveX * minValidMoveX < 0) {
      pastTouches.splice(0);
      return;
    }
    pastTouches.push({
      'pageX': currentTouch.pageX,
      'pageY': currentTouch.pageY
    });
    event.preventDefault();
  }, {passive: false});
  targetElement.addEventListener('touchend', event => {
    if (! pastTouches.length) {
      return;
    }
    const lastTouch = pastTouches[pastTouches.length - 1];
    const firstTouch = pastTouches[0];
    const moveX = lastTouch.pageX - firstTouch.pageX;
    if (Math.abs(moveX) >= Math.abs(minValidMoveX)) {
      listener();
    }
    pastTouches.splice(0);
    event.preventDefault();
  }, {passive: false});
};
*/




/*
{
  const MIN_VALID_MOVE_X = 25;
  const pastTouches = [];
  window.addEventListener('touchstart', event => {
    if (event.touches.length > 1) {
      pastTouches.splice(0);
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
      pastTouches.splice(0);
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
      pastTouches.splice(0);
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
    pastTouches.splice(0);
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
