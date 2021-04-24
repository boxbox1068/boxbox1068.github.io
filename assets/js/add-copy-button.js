window.addEventListener('load', e => {
  for (const element of document.querySelectorAll('.s1068_add_copy_button')) {
alert(1);
    const button = document.createElement('button');
    button.innerText('Copy text to clipboard');
    button.addEventListener('click', () => {
      const text = element.innerText;
      navigator.clipboard.writeText(text).then(() => {
        window.alert('Copy succeeded.');
      }).catch(e => {
        window.prompt('Copy failed. Please copy the text below alternatively.', text);
      });
    });
alert(button);
    element.after(button);
  }
});