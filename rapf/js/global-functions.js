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
