// Runs before first paint; storage may be unavailable in private/restricted browsers.
export const themeScript = `(() => {
  let theme;
  try { theme = window.localStorage.getItem('blog_theme'); } catch {}
  if (theme !== 'light' && theme !== 'dark') {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.dataset.theme = theme;
})();`;
