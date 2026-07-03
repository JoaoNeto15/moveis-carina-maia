// Fade-and-rise scroll reveal for elements with the `.reveal` class.
function initReveal() {
  const reveals = Array.from(document.querySelectorAll('.reveal'));
  const reveal = () => {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    reveals.forEach((el) => {
      if (el.classList.contains('vis')) return;
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.9 && r.bottom > 0) el.classList.add('vis');
    });
  };
  reveal();
  window.addEventListener('scroll', reveal, { passive: true });
  window.addEventListener('resize', reveal);
}
