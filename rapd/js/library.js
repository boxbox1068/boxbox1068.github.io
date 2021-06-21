'use strict';
const dqs = document.querySelector.bind(document);
const dqsa = document.querySelectorAll.bind(document);
const dce = document.createElement.bind(document);
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
const getSetting = key => {
  const cookies = {};
  document.cookie.split(';').forEach(parameter => {
    if (! /=/.test(parameter)) {
      return;
    }
    const key = parameter.replace(/=.*$/, '').trim();
    const encodedValue = parameter.replace(/^.*?=/, '').trim();
    cookies[key] = decodeURIComponent(encodedValue);
  });
  const value = cookies[key];
  return value;
};
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
