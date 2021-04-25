'use strict';
const SITE_MAP = {
  '': 'ホーム',
  '/anytime-mirror': 'いつでもミラー',
  '/bookmarklet': 'ブックマークレット'
};
window.addEventListener('DOMContentLoaded', e => {
  document.head.appendChild((() => {
    const e = document.createElement('meta');
    e.setAttribute('name', 'format-detection');
    e.setAttribute('content', 'telephone=no,address=no,email=no');
    return e;
  })());
  document.body.querySelector('*').before((() => {
    const e = document.createElement('nav');
    const path = [];
    let url = location.href.replace(/^https:\/\/.+?\/|\/.*?$/ig, '');
alert(url);
  })());
  document.title += ' - しかくのサイト';
});
