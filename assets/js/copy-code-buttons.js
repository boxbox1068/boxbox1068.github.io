const main = () => {
  for (const code of document.querySelectorAll('pre > code')) {
    const button = (() => {
      const button = document.createElement('button');
      button.innerText = 'Copy to clipboard';
      button.addEventListener('click', () => {
        const text = code.innerText.trim();
        navigator.clipboard.writeText(text).then(() => {
          window.alert('Copy succeeded.\n----\n'+text);
        }).catch(e => {
          window.prompt('Copy failed. Please manually copy the text below instead.', text);
        });
      });
      return button;
    })();
    const div = document.createElement('div');
    div.appendChild(button);
    const pre = code.parentElement;
    pre.after(div);
    code.style.whiteSpace = 'nowrap';
  }
};
window.addEventListener('DOMContentLoaded', main);