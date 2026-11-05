// Dexplorer website: theme toggle and scroll reveal. No libraries, no build step.
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  // ---------- Theme: system by default; the visitor's choice is remembered ----------
  var STORAGE_KEY = 'dexplorer-theme';
  var toggle = document.getElementById('theme-toggle');
  var systemDark = window.matchMedia('(prefers-color-scheme: dark)');

  function currentTheme() {
    return root.dataset.theme || (systemDark.matches ? 'dark' : 'light');
  }

  function render() {
    var dark = currentTheme() === 'dark';
    toggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    toggle.querySelector('use').setAttribute('href', dark ? '#i-sun' : '#i-moon');
  }

  toggle.addEventListener('click', function () {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (e) {
      // Storage blocked (private mode): the choice lasts for this visit only.
    }
    render();
  });

  // Follow the system when the visitor hasn't picked a theme.
  systemDark.addEventListener('change', function () {
    if (!root.dataset.theme) render();
  });

  render();

  // ---------- Scroll reveal: sections rise in once as they come into view ----------
  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
  items.forEach(function (el) { observer.observe(el); });
})();
