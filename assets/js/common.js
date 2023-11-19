import * as website from '/assets/js/website-data.js';
const main = () => {
  addFormatDetectionMeta();
  addHeader();
  addFooter();
  showBody();
  if (! document.querySelector('h1')) {
    const h1Element = document.createElement('h1');
    h1Element.innerHTML = document.title;
    const headerElement = document.querySelector('header');
    headerElement.after(h1Element);
  }
  document.title += ` - ${website.name}`;
};
const addFormatDetectionMeta = () => {
  const meta = document.createElement('meta');
  meta.setAttribute('name', 'format-detection');
  meta.setAttribute('content', 'telephone=no');
  document.head.append(meta);
};
const addHeader = () => {
  const logo = (() => {
    const span = document.createElement('span');
    span.style.fontWeight = 'bold';
    span.style.fontSize = '2.5rem';
    span.innerText = website.name;
    const img = document.createElement('img');
    img.style.width = '2.5rem';
    img.src = website.mark;
    const div = document.createElement('div');
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.append(span);
    div.append(img);
    return div;
  })();
  const breadcrumb = (() => {
    const style = document.createElement('style');
    style.innerHTML = `
      ul.breadcrumb {
        display: flex;
        list-style: none;
        margin: 0;
        padding-left: 0;
        white-space: nowrap;
      }
      ul.breadcrumb > li + li::before {
        display: inline-block;
        width: 1.5em;
        text-align: center;
        content: ">";
      }
    `;
    document.head.append(style);
    const ul = document.createElement('ul');
    ul.className = 'breadcrumb';
    const path = location.href.replace(/^https?:\/\/[^/]+|\/(index.html)?(\?.*?)?(#.*)?$/ig, '');
    const pathParts = path.split('/');
    for (let i = 0; i < pathParts.length - 1; i++) {
      const path = pathParts.slice(0, i + 1).join('/') + '/';
      if (website.map[path]) {
        const a = document.createElement('a');
        a.href = path;
        a.innerText = website.map[path];
        const li = document.createElement('li');
        li.append(a);
        ul.append(li);
      }
    }
    const pageTitle = document.title.replace(/^(.{16}).+$/, '$1...');
    const li = document.createElement('li');
    li.append(document.createTextNode(pageTitle));
    ul.append(li);
    const nav = document.createElement('nav');
    nav.style.overflowX = 'auto';
    nav.append(ul);
    return nav;
  })();
  const header = document.createElement('header');
  header.append(logo);
  header.append(breadcrumb);
  document.body.prepend(header);
};
const addFooter = () => {
  const twitterLink = (() => {
    const a = document.createElement('a');
    a.href = 'https://twitter.com/boxbox1068/';
    a.innerHTML = 'Twitter';
    const small = document.createElement('small');
    small.append(a);
    return small;
  })();
  const copyright = (() => {
    const fullYear = new Date().getFullYear();
    const small = document.createElement('small');
    small.innerHTML = `&copy; ${fullYear} ${website.author}`;
    return small;
  })();
  const footer = document.createElement('footer');
  footer.style.display = 'flex';
  footer.style.justifyContent = 'space-between';
  footer.append(twitterLink);
  footer.append(copyright);
  document.body.append(footer);
};
const showBody = () => {
  document.body.style.animation = 'fadeIn 2s';
  document.body.style.opacity = '1';
};
window.addEventListener('DOMContentLoaded', main);
