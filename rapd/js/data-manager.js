'use strict';
class DataManager {
  constructor() {
    this.values = {};
    this.onChangeListeners = {};
  }
  registerData({
    key = 'key',
    source = 'none',
    type = 'string',
    default = '',
    linkWithCookie = false,
    linkWithHtml = false,
    onChangeListener = null
  } = {}) {
    let value = default;
    switch (source) {
      case 'cookie':
        break;
      case 'query':
        break;
      default:
    }
  }
  _readFromCookie(key) {

  }
  _readFromQuery(key) {

  }
}