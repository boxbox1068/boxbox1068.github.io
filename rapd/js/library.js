'use strict';
const dqs = document.querySelector.bind(document);
const dqsa = document.querySelectorAll.bind(document);
const readCookies = callback => {
  const cookies = {};
  document.cookie.split(';').forEach(parameter => {
    if (! /=/.test(parameter)) {
      return;
    }
    const key = parameter.replace(/=.*$/, '').trim();
    const value = decodeURIComponent(parameter.replace(/^.*?=/, '').trim());
    cookies[key] = value;
  });
  callback(cookies);
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
