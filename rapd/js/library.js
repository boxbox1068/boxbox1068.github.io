'use strict';
const $qs = document.querySelector.bind(document);
const $qsa = document.querySelectorAll.bind(document);



const $dt = (key, value, onChangeCallback) => {
  $dt._onChangeCallbacks || ($dt._onChangeCallbacks = {});
  if (onChangeCallback !== undefined) {
    $dt._onChangeCallbacks[key] = onChangeCallback;
  }
  if (value !== undefined) {
    $dt[key] = value;
    $dt._onChangeCallbacks[key] && $dt._onChangeCallbacks[key](key, value);
  }
  return $dt[key];
};
const $el = (selectors, returnMultiple) => {
  if (returnMultiple) {
    return document.querySelectorAll(selectors);
  } else {
    return document.querySelector(selectors);
  }
};
const $ck = (key, value) => {
  if (value !== undefined) {
    const maxAge = 60 * 60 * 24 * 365;
    const encodedValue = encodeURIComponent(value);
    document.cookie = `${key}=${encodedValue}; max-age=${maxAge}`;
  }
  let cookieValue = '';
  document.cookie.split(';').forEach(element => {
    if (! element.trim().startsWith(`${key}=`)) {
      return;
    }
    const encodedCookieValue = element.split('=')[1];
    cookieValue = decodeURIComponent(encodedCookieValue);
  });
  return cookieValue;
};
const $fl = (key, value) => {
  const rootElement = document.querySelector(':root');
  if (value === null) {
    value = ! rootElement.classList.contains(key);
  }
  if (value) {
    rootElement.classList.add(key);
  } else if (value !== undefined) {
    rootElement.classList.remove(key);
  }
  return rootElement.classList.contains(key);
};
const $qr = (field, toLowerCase) => {
  let value = undefined;
  const queryString = window.location.search.replace(/^\?/, '');
  const parameters = queryString.split('&');
  for (const parameter of parameters) {
    const currentField = parameter.replace(/=.*/, '').trim().toLowerCase();
    if (currentField == field) {
      value = decodeURIComponent(parameter.replace(/.*?=|.*/, '')).trim();
      if (toLowerCase) value = value.toLowerCase();
      break;
    }
  }
  return value;
};
