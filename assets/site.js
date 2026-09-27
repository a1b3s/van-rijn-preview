(() => {
  'use strict';
  const menuButton = document.querySelector('[data-menu-toggle]');
  const menuPanel = document.querySelector('[data-menu-panel]');
  const searchButton = document.querySelector('[data-search-toggle]');
  const searchPanel = document.querySelector('[data-search-panel]');
  const input = document.querySelector('[data-search-input]');
  const results = document.querySelector('[data-search-results]');
  const status = document.querySelector('[data-search-status]');
  const clear = document.querySelector('[data-search-clear]');
  if (!menuButton || !searchButton || !input || !results || !status || !clear) return;
  const articles = Array.isArray(window.VAN_RIJN_ARTICLES) ? window.VAN_RIJN_ARTICLES :
    [...results.querySelectorAll('a')].map(a => ({title: a.querySelector('span')?.textContent || a.textContent, href: a.getAttribute('href'), category: '', date: '', summary: '', body: ''}));
  const normalize = s => String(s || '').normalize('NFKC').toLocaleLowerCase('ja').trim();
  const indexed = articles.map(a => ({...a, search: normalize([a.title,a.summary,a.body,a.category].join(' '))}));
  function panel(button, target, open) {
    button.setAttribute('aria-expanded', String(open));
    target.classList.toggle('is-open', open);
  }
  function closeSearch(restore = true) {
    panel(searchButton, searchPanel, false);
    if (restore) searchButton.focus();
  }
  function render() {
    const query = normalize(input.value);
    const terms = query.split(/\s+/).filter(Boolean);
    const matches = indexed.filter(a => terms.every(term => a.search.includes(term)));
    const shown = query ? matches.slice(0, 50) : matches.slice(0, 5);
    results.replaceChildren();
    clear.hidden = input.value.length === 0;
    status.textContent = query ? matches.length + '件の記事' + (matches.length > 50 ? '（先頭50件を表示。語句を追加して絞り込めます）' : '') : '新着記事 ' + shown.length + '件';
    if (!shown.length) {
      const p = document.createElement('p');
      p.textContent = '記事が見つかりませんでした。別の言葉や短いキーワードでお試しください。';
      results.append(p);
    }
    shown.forEach(a => {
      // Generated index URLs may never execute scripts or navigate off-site.
      if (!/^article(?:-[a-z0-9-]+)?\.html$/.test(a.href)) return;
      const link = document.createElement('a'); link.href = (document.body.dataset.rootLinks === 'true' ? '/' : '') + a.href;
      const title = document.createElement('span'); title.textContent = a.title;
      const meta = document.createElement('small'); meta.textContent = [a.category, a.date.replaceAll('-', '.')].filter(Boolean).join(' · ');
      link.append(title, meta); results.append(link);
    });
  }
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    closeSearch(false); panel(menuButton, menuPanel, open);
  });
  searchButton.addEventListener('click', () => {
    const open = searchButton.getAttribute('aria-expanded') !== 'true';
    panel(menuButton, menuPanel, false); panel(searchButton, searchPanel, open);
    if (open) { render(); input.focus(); }
  });
  input.addEventListener('input', event => { if (!event.isComposing) render(); });
  input.addEventListener('compositionend', render);
  clear.addEventListener('click', () => { input.value = ''; render(); input.focus(); });
  document.querySelector('[data-search-close]').addEventListener('click', () => closeSearch());
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (searchButton.getAttribute('aria-expanded') === 'true') closeSearch();
    else if (menuButton.getAttribute('aria-expanded') === 'true') {
      panel(menuButton, menuPanel, false); menuButton.focus();
    }
  });
  panel(menuButton, menuPanel, false); panel(searchButton, searchPanel, false);
  input.disabled = false; render();
  // Hide fallback navigation only after successful enhancement.
  document.documentElement.classList.add('js');
})();
