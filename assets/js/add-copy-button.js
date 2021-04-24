window.addEventListener('load', e => {
  for (const element of document.querySelectorAll('.s1068_add_copy_button')) {
    const button = document.createElement('button');
    button.innerHTML = 'Copy text to clipboard';
    button.addEventListener('click', () => {
      const text = element.innerText.trim();
      navigator.clipboard.writeText(text).then(() => {
        window.alert('Copy succeeded.\n----\n'+text);
      }).catch(e => {
        window.prompt('Copy failed. Please manually copy the text below instead.', text);
      });
    });
    const div = document.createElement('div');
    div.appendChild(button);
    element.after(div);
  }
});