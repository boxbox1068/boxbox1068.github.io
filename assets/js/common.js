'use strict';
window.addEventListener('DOMContentLoaded', e => {
  document.head.appendChild((() => {
    const e = document.createElement('meta');
    e.setAttribute('name', 'format-detection');
    e.setAttribute('content', 'telephone=no,address=no,email=no');
    return e;
  })());
  document.title += ' - しかくのサイト';
});
