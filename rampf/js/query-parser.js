export class QueryParser {
  constructor() {
    const values = {};
    const queryString = decodeURIComponent(location.search.slice(1));
    queryString.split('&').forEach(parameter => {
      let key, value;
      if (parameter.match(/=/)) {
        key = parameter.match(/^[^=]*/)[0].toLowerCase().trim();
        value = parameter.match(/=.*$/)[0].slice(1).trim();
      } else {
        key = parameter.toLowerCase().trim();
        value = 'true';
      }
      if (key) values[key] = value;
    });
    this._values = values;
  }
  getValue(key, type, defaultValue) {
    key = typeof key == 'string' ? key : '';
    type = typeof type == 'string' ? type : '';
    let value = this._values[key.toLowerCase().trim()];
    if (type == 'number') {
      value = Number(value);
      if (! Number.isFinite(value)) value = null;
    } else if (type == 'integer') {
      value = Number(value);
      if (! Number.isInteger(value)) value = null;
    } else if (type == 'boolean') {
      if (/^\s*true\s*$/i.test(value)) {
        value = true;
      } else if (/^\s*false\s*$/i.test(value)) {
        value = false;
      } else {
        value = null;
      }
    }
    if (value == null) value = defaultValue;
    return value;
  }
}