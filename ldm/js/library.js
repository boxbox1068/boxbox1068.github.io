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
const replaceAll = (targetString, replacements) => {
  for (const key in replacements) {
    targetString = targetString.replaceAll(key, replacements[key]);
  }
  return targetString;
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
const getFlag = key => {
  return qs(':root').classList.contains(key);
}
const toggleFlag = key => {
  setFlag(key, ! getFlag(key));
}
const setSetting = (key, value) => {
  qs(':root').setAttribute(`data-${key}`, value);
  const encodedValue = encodeURIComponent(value);
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${key}=${encodedValue}; max-age=${maxAge};`;
  qsa(`[data-setting-key=${key}]`).forEach(element => {
    if (element.getAttribute('data-setting-value') == value) {
      element.classList.add('checked');
    } else {
      element.classList.remove('checked');
    }
  });
};
const getSetting = (key, valueType) => {
  const _convertValue = (srcValue, valueType) => {
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
    return _convertValue(candidateValueA, valueType);
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
  return _convertValue(candidateValueB, valueType);
};
const loadSetting = (key, defaultValue) => {
  setSetting(key, getSetting(key) || defaultValue);
};
const toggleSetting = (key) => {
  const currentValue = getSetting(key);
  if (! /^(true|false)$/.test(currentValue)) {
    return;
  }
  const newValue = (! /^true$/i.test(currentValue)).toString(); 
  setSetting(key, newValue);
}
const requestJsonp = (jsonpSrc, callback) => {
  requestJsonp.count = requestJsonp.count + 1 || 1;
  const jsonpScriptElementId = `jsonp-${requestJsonp.count}`;
  const jsonpCallbackName = 'jsonpCallback';
  window[jsonpCallbackName] = data => {
    delete window[jsonpCallbackName];
    qs(`#${jsonpScriptElementId}`).remove();
    callback(data);
  };
  const jsonpScriptElement = ce('script');
  jsonpScriptElement.id = jsonpScriptElementId;
  jsonpScriptElement.src = jsonpSrc;
  document.head.append(jsonpScriptElement);
};
const addKeyDownListener = (targetKey, listener) => {
  qs('body').addEventListener('keydown', event => {
    if (event.ctrlKey || event.altKey || event.metaKey || /^F\d+$/.test(event.key)) {
      return;
    }
    event.preventDefault();
    if (event.key == targetKey) {
      listener();
    }
  }, {passive: false});
};
const addSwipeListener = (minValidMoveX, listener) => {
  let firstTouch = null;
  let lastTouch = null;
  qs('body').addEventListener('touchstart', event => {
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
  qs('body').addEventListener('touchmove', event => {
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
  qs('body').addEventListener('touchend', event => {
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
const addDoubleTapListener = (maxValidInterval, listener) => {
  let tapCount = 0;
  let timeoutId = null;
  qs('body').addEventListener('touchstart', event => {
    if (event.touches.length > 1) {
      tapCount = 0;
      event.preventDefault();
      return;
    }
    tapCount++;
  }, {passive: false});
  qs('body').addEventListener('touchmove', event => {
    tapCount = 0;
  });
  qs('body').addEventListener('touchend', event => {
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
const speak = (text, lang, voiceVolume, voiceRate, voicePitch, voiceNumber, interrupt) => {
  const isSpeaking = window.speechSynthesis.speaking;
  window.speechSynthesis.cancel();
  if (! text) {
    return;
  }
  if (isSpeaking && ! interrupt) {
    return;
  }
  const utterance = new SpeechSynthesisUtterance();
  utterance.text = text || '';
  utterance.lang = lang || 'en';
  utterance.volume = {
    'extra-soft': 0.5,
    'soft': 0.75,
    'medium': 1
  }[voiceVolume] || 1;
  utterance.rate = {
    'extra-slow': 0.5,
    'slow': 0.75,
    'medium': 1,
    'fast': 1.25,
    'extra-fast': 1.5
  }[voiceRate] || 1;
  utterance.pitch = {
    'extra-low': 0.5,
    'low': 0.75,
    'medium': 1,
    'high': 1.25,
    'extra-high': 1.5
  }[voicePitch] || 1;
  const candidateVoices = [];
  for (const voice of window.speechSynthesis.getVoices()) {
    if (new RegExp(`^${lang}`, 'i').test(voice.lang)) {
      candidateVoices.push(voice);
    }
  }
  if (voiceNumber === undefined) {
    voiceNumber = 1;
  }
  if (candidateVoices.length) {
    let index;
    if (voiceNumber > 0) {
      index = (voiceNumber - 1) % candidateVoices.length;
    } else {
      index = Math.floor(candidateVoices.length * Math.random());
    }
    utterance.voice = candidateVoices[index];
  }
  window.speechSynthesis.speak(utterance);
};
