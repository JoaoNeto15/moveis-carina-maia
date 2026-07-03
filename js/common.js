// Mobile nav toggle — shared by every page.
document.addEventListener('DOMContentLoaded', () => {
  const root = document.body;
  const openMenu = () => root.classList.add('menu-open');
  const closeMenu = () => root.classList.remove('menu-open');
  const burger = document.querySelector('.nav-burger');
  const closeBtn = document.querySelector('.mnav-close');
  if (burger) burger.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  document.querySelectorAll('.mnav-link, .mnav-cta').forEach((a) => a.addEventListener('click', closeMenu));
});
