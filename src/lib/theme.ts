const THEME_KEY = 'calorie_app_theme';

export function getTheme(): 'light' | 'dark' {
  return (localStorage.getItem(THEME_KEY) as 'light' | 'dark') || 'light';
}

export function setTheme(theme: 'light' | 'dark') {
  localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
}

export function applyTheme(theme?: 'light' | 'dark') {
  const t = theme || getTheme();
  document.documentElement.classList.toggle('dark', t === 'dark');
}
