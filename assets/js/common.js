import * as website from '/website-data.js';
window.addEventListener('DOMContentLoaded', e => {
  addFormatDetectionMeta();
  addHeader();
  addFooter();
  showBody();
  document.title += ` - ${website.name}`;
});
const addFormatDetectionMeta = () => {
  const meta = document.createElement('meta');
  meta.setAttribute('name', 'format-detection');
  meta.setAttribute('content', 'telephone=no');
  document.head.append(meta);
/*

var meta = document.createElement("meta");  
meta.setAttribute("name", "format-detection");  
meta.setAttribute("content","telephone=no");  
document.getElementsByTagName("head")[0].appendChild(meta);  


*/





};
const addHeader = () => {
  const logo = (() => {
    const span = document.createElement('span');
    span.style.fontWeight = 'bold';
    span.style.fontSize = '2rem';
    span.innerText = website.name;
    const img = document.createElement('img');
    img.style.width = '2rem';
    img.src = website.mark;
    const div = document.createElement('div');
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.append(span);
    div.append(img);
    return div;
  })();
  const breadcrumb = (() => {
    const ul = document.createElement('ul');
    ul.style.display = 'flex';
    ul.style.listStyle = 'none';
    ul.style.margin = '0';
    ul.style.paddingLeft = '0';
    ul.style.whiteSpace = 'nowrap';
    const pathParts = location.href.replace(/^https?:\/\/[^/]+|\/(index.html)?$/ig, '').split('/');
    for (let i = 0; i < pathParts.length - 1; i++) {
      const path = pathParts.slice(0, i + 1).join('/') + '/';
      if (website.map[path]) {
        const a = document.createElement('a');
        a.href = path;
        a.innerText = website.map[path];
        const li = document.createElement('li');
        if (i > 0) {
          const span = document.createElement('span');
          span.innerHTML = '&nbsp;&gt;&nbsp;';
          li.prepend(span);
        }
        li.append(a);
        ul.append(li);
      }
    }
    const span = document.createElement('span');
    span.innerHTML = '&nbsp;&gt;&nbsp;' + document.title.replace(/^(.{16}).+$/, '$1...');
    const li = document.createElement('li');
    li.append(span);
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
  const copyright = (() => {
    const small = document.createElement('small');
    const fullYear = new Date().getFullYear();
    small.innerHTML = `&copy; ${fullYear} ${website.author}`;
    return small;
  })();
  const footer = document.createElement('footer');
  footer.style.textAlign = 'right';
  footer.append(copyright);
  document.body.append(footer);
};
const showBody = () => {
  const style = document.createElement('style');
  style.innerHTML = `
    body {
      opacity: 1;
      animation: fadeIn 1s;
    }
    @keyframes fadeIn {
      0% {
        opacity: 0;
      }
      100% {
        opacity: 1;
      }
    }
  `;
  document.head.append(style);
};