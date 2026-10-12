// DumpIt theme switcher — exact tokens from the app (accent/background/ink/muted/onAccent)
(function () {
  var THEMES = [
    { id: 'bubblegum', name: 'Bubblegum', accent: '#E0608F', ground: '#DDD8EE', on: '#17142A', ink: '#17142A', muted: '#5A566E' },
    { id: 'lemonade',  name: 'Lemonade',  accent: '#FFB800', ground: '#FFF3B8', on: '#171717', ink: '#171717', muted: '#756F5A' },
    { id: 'blueberry', name: 'Blueberry', accent: '#5271FF', ground: '#DDE7FF', on: '#111827', ink: '#111827', muted: '#68728A' },
    { id: 'tangerine', name: 'Tangerine', accent: '#FF7043', ground: '#FFE4C7', on: '#17120F', ink: '#17120F', muted: '#75685D' },
    { id: 'cherry',    name: 'Cherry',    accent: '#F0445E', ground: '#FFE0E4', on: '#1B1012', ink: '#1B1012', muted: '#78666A' },
    { id: 'matcha',    name: 'Matcha',    accent: '#6FAE63', ground: '#DDEBD7', on: '#172018', ink: '#172018', muted: '#667063' },
    { id: 'grape',     name: 'Grape',     accent: '#9B5DE5', ground: '#E5D8FF', on: '#191321', ink: '#191321', muted: '#746A80' },
    { id: 'newspaper', name: 'Newspaper', accent: '#3D3D3D', ground: '#E9E7E1', on: '#F8F7F2', ink: '#111111', muted: '#696969' }
  ];

  var root = document.documentElement;
  var swatchWrap = document.getElementById('themeSwatches');
  var themeNameEl = document.getElementById('themeName');
  var currentId = 'bubblegum';

  try {
    var saved = localStorage.getItem('dumpit-theme');
    if (saved && THEMES.some(function (t) { return t.id === saved; })) currentId = saved;
  } catch (e) { /* private mode — ignore */ }

  function applyTheme(id) {
    var theme = THEMES.find(function (t) { return t.id === id; }) || THEMES[0];
    currentId = theme.id;
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--ground', theme.ground);
    root.style.setProperty('--on-accent', theme.on);
    root.style.setProperty('--ink', theme.ink);
    root.style.setProperty('--muted', theme.muted);
    if (themeNameEl) themeNameEl.textContent = theme.name;
    if (swatchWrap) {
      var btns = swatchWrap.querySelectorAll('.swatch');
      btns.forEach(function (b) {
        var active = b.getAttribute('data-theme') === theme.id;
        b.classList.toggle('swatch-active', active);
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    }
    try { localStorage.setItem('dumpit-theme', theme.id); } catch (e) {}
  }

  function render() {
    if (!swatchWrap) return;
    swatchWrap.innerHTML = '';
    THEMES.forEach(function (t) {
      var b = document.createElement('button');
      b.className = 'swatch';
      b.type = 'button';
      b.setAttribute('data-theme', t.id);
      b.setAttribute('aria-label', t.name);
      b.title = t.name;
      b.style.background = t.accent;
      b.addEventListener('click', function () { applyTheme(t.id); });
      swatchWrap.appendChild(b);
    });
    applyTheme(currentId);
  }

  render();
})();
