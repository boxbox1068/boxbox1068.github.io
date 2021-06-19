'use strict';
const addSwipeListener = (targetElement, minValidMoveX, listener) => {
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
const addDoubleTapListener = (targetElement, maxValidInterval, listener) => {
  let tapCount = 0;
  let timeoutId = null;
  targetElement.addEventListener('touchstart', event => {
    if (event.touches.length > 1) {
      tapCount = 0;
      event.preventDefault();
      return;
    }
    tapCount++;
  }, {passive: false});
  targetElement.addEventListener('touchmove', event => {
    tapCount = 0;
  });
  targetElement.addEventListener('touchend', event => {
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
    event.preventDefault();
  }, {passive: false});
};
const addKeyDownListener = (targetElement, listeners) => {
  targetElement.addEventListener('keydown', event => {
    if (/^F\d+$/.test(event.key)) {
      return;
    }
    if (event.ctrlKey || event.altKey || event.metaKey) {
      return;
    }
    event.preventDefault();
    for (const listenerKey in listeners) {
      const targetKeys = listenerKey.split('|');
      const targetKey = event.key;
      if (targetKeys.indexOf(targetKey) >= 0) {
        const listener = listeners[listenerKey];
        listener(targetKey);
        break;
      }
    }
  }, {passive: false});
};


/*
const addKeyDownListener = (targetElement, listeners) => {
  targetElement.addEventListener('keydown', event => {
    if (/^F\d+$/.test(event.key)) {
      return;
    }
    if (event.ctrlKey || event.altKey || event.metaKey) {
      return;
    }
    event.preventDefault();
    const targetKey = event.key;
    const listener = listeners[targetKey];
    if (listener) {
      listener(targetKey);
    }
  }, {passive: false});
};
*/