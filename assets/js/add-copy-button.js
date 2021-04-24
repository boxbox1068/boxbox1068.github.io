window.addEventListener('DOMContentLoaded', () => {
  for (element of document.querySelectorAll('.1068_add_copy_button')) {
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
    element.after(button);
  }
});