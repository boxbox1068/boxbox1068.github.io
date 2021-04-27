const style = document.createElement('style');
style.innerHTML = `
  h1 {
    counter-reset: chapter;
  }
  h2 {
    counter-reset: sub-chapter;
  }
  h3 {
    counter-reset: section;
  }
  h2::before {
    counter-increment: chapter;
    content: counter(chapter) ". ";
  }
  h3::before {
    counter-increment: sub-chapter;
    content: counter(chapter) "-" counter(sub-chapter) ". ";
  }
  h4::before {
    counter-increment: section;
    content: "(" counter(section) ") ";
  }
`;
document.head.append(style);
