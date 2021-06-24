'use strict';
const dqs = document.querySelector.bind(document);
const dqsa = document.querySelectorAll.bind(document);
const dce = document.createElement.bind(document);
const expandStringVariables = (targetString, stringVariables) => {
  for (const key in stringVariables) {
    targetString = targetString.replace(new RegExp(`%${key}%`, 'ig'), stringVariables[key]);
  }
  return targetString;
};

const setFlag = (key, value) => {
  if (value === null) {
    dqs(':root').classList.toggle(key);
  } else if (value) {
    dqs(':root').classList.add(key);
  } else {
    dqs(':root').classList.remove(key);
  }
};
const getFlag = (key) => {
  return dqs(':root').classList.contains(key);
}

const setSetting = (key, value) => {
  const encodedValue = encodeURIComponent(value);
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${key}=${encodedValue}; max-age=${maxAge};`;
  dqs(':root').setAttribute(`data-${key}`, value);
  if (/^true|false$/i.test(value)) {
    const selector = `[type="checkbox"][name="${key}"]`;
    dqsa(selector).forEach(element => {
      element.checked = value == 'true';
    });
  } else {
    const selector = `[type="radio"][name="${key}"][value="${value}"]`;
    dqsa(selector).forEach(element => {
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
  const candidateValueA = dqs(':root').getAttribute(`data-${key}`);
  if (candidateValueA != null) {
    return candidateValueA;
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
  return candidateValueB;
};
const requestJsonp = (jsonpSrc, jsonpCallbackName) => {
  return new Promise((resolve, reject) => {
    jsonpCallbackName || (jsonpCallbackName = 'jsonpCallback');
    const jsonpCallbackScriptElement = document.createElement('script');
    window[jsonpCallbackName] = data => {
      delete window[jsonpCallbackName];
      dqs('#jsonp-data').remove();
      resolve(data);
    };
    const jsonpDataScriptElement = dce('script');
    jsonpDataScriptElement.id = 'jsonp-data';
    jsonpDataScriptElement.src = jsonpSrc;
    document.head.append(jsonpDataScriptElement);
  });
};
const waitMessage = () => {
  return new Promise((resolve, reject) => {
    window.addEventListener('message', event => {
      resolve(event.data);
    }, {once: true});
  });
}
/*
const requestJsonp = (jsonpSrc, jsonpCallbackName, callback) => {
  const jsonpCallbackScriptElement = document.createElement('script');
  window[jsonpCallbackName] = jsonData => {
    delete window[jsonpCallbackName];
    dqs('#jsonp-data').remove();
    callback(jsonData);
  };
  const jsonpDataScriptElement = dce('script');
  jsonpDataScriptElement.id = 'jsonp-data';
  jsonpDataScriptElement.src = jsonpSrc;
  document.head.append(jsonpDataScriptElement);
};
*/
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
const addKeyDownListener = (targetElement, targetKey, listener) => {
  targetElement.addEventListener('keydown', event => {
    if (event.ctrlKey || event.altKey || event.metaKey || /^F\d+$/.test(event.key)) {
      return;
    }
    event.preventDefault();
    if (event.key == targetKey) {
      listener(targetKey);
    }
  }, {passive: false});
};


