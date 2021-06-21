'use strict';
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
