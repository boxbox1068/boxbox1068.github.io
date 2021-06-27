'use strict';
const qs = document.querySelector.bind(document);
const qsa = document.querySelectorAll.bind(document);
const ce = document.createElement.bind(document);
const setTimeout = delay => {
  return new Promise(resolve => {
    window.setTimeout(() => {
      resolve();
    }, delay);
  });
};
const setFlag = (key, value) => {
  if (value === null) {
    value = ! qs(':root').classList.contains(key);
  }
  if (value) {
    qs(':root').classList.add(key);
  } else {
    qs(':root').classList.remove(key);
  }
  if (setFlag.listener) {
    setFlag.listener(key, value);
  }
};
const getFlag = (key) => {
  return qs(':root').classList.contains(key);
}
const setSetting = (key, value) => {
  const encodedValue = encodeURIComponent(value);
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${key}=${encodedValue}; max-age=${maxAge};`;
  qs(':root').setAttribute(`data-${key}`, value);
  if (/^true|false$/i.test(value)) {
    const selector = `[type="checkbox"][name="${key}"]`;
    qsa(selector).forEach(element => {
      element.checked = value == 'true';
    });
  } else {
    const selector = `[type="radio"][name="${key}"][value="${value}"]`;
    qsa(selector).forEach(element => {
      element.checked = true;
    });
  }
};
const getSetting = (key, valueType) => {
  const convertValue = (srcValue, valueType) => {
    switch (valueType) {
      case 'number':
        return Number(srcValue);
        break;
      case 'integer':
        return Math.round(Number(srcValue));
        break;
      case 'boolean':
        return /^true$/i.test(srcValue);
        break;
      default:
        return srcValue;
    }
  };
  const candidateValueA = qs(':root').getAttribute(`data-${key}`);
  if (candidateValueA != null) {
    return convertValue(candidateValueA, valueType);
  }
  const cookies = {};
  document.cookie.split(';').forEach(parameter => {
    if (! /=/.test(parameter)) {
      return;
    }
    const key = parameter.replace(/=.*$/, '').trim();
    const encodedValue = parameter.replace(/^.*?=/, '').trim();
    cookies[key] = decodeURIComponent(encodedValue);
  });
  const candidateValueB = cookies[key];
  return convertValue(candidateValueB, valueType);
};
const loadSetting = (key, defaultValue) => {
  setSetting(key, getSetting(key) || defaultValue);
};
const requestJsonp = (jsonpSrc, callback) => {
  const jsonpCallbackName = 'jsonpCallback';
  window[jsonpCallbackName] = data => {
    delete window[jsonpCallbackName];
    qs('#jsonp-data').remove();
    callback(data);
  };
  const jsonpDataScriptElement = ce('script');
  jsonpDataScriptElement.id = 'jsonp-data';
  jsonpDataScriptElement.src = jsonpSrc;
  document.head.append(jsonpDataScriptElement);
};
const expandVariables = (targetString, variableValues, symbolForVariables) => {
  symbolForVariables || (symbolForVariables = '%');
  for (const key in variableValues) {
    const variableExpression = new RegExp(`${symbolForVariables}${key}${symbolForVariables}`, 'ig');
    targetString = targetString.replace(variableExpression, variableValues[key]);
  }
  return targetString;
};
const addKeyDownListener = (targetElement, targetKeys, listener) => {
  if (! Array.isArray(targetKeys)) {
    targetKeys = [targetKeys];
  }
  targetElement.addEventListener('keydown', event => {
    if (event.ctrlKey || event.altKey || event.metaKey || /^F\d+$/.test(event.key)) {
      return;
    }
    event.preventDefault();
    targetKeys.forEach(targetKey => {
      if (event.key == targetKey) {
        listener(targetKey);
      }
    });
  }, {passive: false});
};
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
    if (tapCount) {
      event.target.blur();
      event.preventDefault();
    }
  }, {passive: false});
};
