window.addEventListener('load', e => {
  for (cosnt element of document.querySelectorAll('.1068_add_copy_button')) {
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