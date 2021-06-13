'use strict';
{
  const MIN_VALID_MOVE_X = 25;
  let firstTouchPosition = null;
  let lastTouchPosition = null;
  window.addEventListener('touchstart', event => {
    if (event.touches.length == 1) {
      const currentTouch = event.touches[0];
      firstTouchPosition = {
        'x': currentTouch.pageX,
        'y': currentTouch.pageY
      }
      lastTouchPosition = {...firstTouchPosition};
    } else {
      firstTouchPostion = null;
      lastTouchPosition = null;
      touchMoveDirection = 'none';
    }
  }, {capture: true});
  window.addEventListener('touchmove', event => {
    if (firstTouchPosition && lastTouchPosition) {
      const currentTouch = event.touches[0];
      const shortMoveX = currentTouch.pageX - lastTouchPosition.x;
      const shortMoveY = currentTouch.pageY - lastTouchPosition.y;
      if (Math.abs(shortMoveX) > Math.abs(shortMoveY)) {
        const longMoveX = currentTouch.pageX - firstTouchPosition.x;
        const longMoveY = currentTouch.pageY - firstTouchPosition.y;
        if ((longMoveX > 0 && shortMoveX > 0) || (longMoveX < 0 && shortMoveX < 0)) {
          lastTouchPosition = {
            'x': currentTouch.pageX,
            'y': currentTouch.pageY
          }
        } else {
          firstTouchPosition = null;
          lastTouchPosition = null;
        }
      } else {
        firstTouchPosition = null;
        lastTouchPosition = null;
      }
    }
  }, {capture: true});
  window.addEventListener('touchend', event => {
    if (firstTouchPosition && lastTouchPosition) {
      const longMoveX = lastTouchPosition.x - firstTouchPosition.x;
      if (longMoveX >= MIN_VALID_MOVE_X) {
        event.preventDefault();
        onSwipeToRight();
      } else if (longMoveX <= MIN_VALID_MOVE_X * -1) {
        event.preventDefault();
        onSwipeToLeft();
      }
      firstTouchPosition = null;
      lastTouchPosition = null;
    }
  }, {capture: true});
  const onSwipeToRight = () => {
    document.querySelector('#play-button').click();
  };
  const onSwipeToLeft = () => {
    document.querySelector('#skip-button').click();
  };
}