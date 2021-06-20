'use strict';
const $d = (key, value, defaultValue) => {
  if (value !== undefined) {
    $d[key] = value;
  } else if (defaultValue !== undefined) {
    $d[key] = defaultValue;
  }
  return $d[key];
};
const $e = (selectors, returnMultiple) => {
  if (returnMultiple) {
    return document.querySelectorAll(selectors);
  } else {
    return document.querySelector(selectors);
  }
};
const $f = (key, value) => {
  const rootElement = document.querySelector(':root');
  if (value === null) {
    value = !(rootElement.classList.contains(key));
  }
  if (value) {
    rootElement.classList.add(key);
  } else if (value !== undefined) {
    rootElement.classList.remove(key);
  }
  return rootElement.classList.contains(key);
};
const $q = (field, toLowerCase) => {
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
