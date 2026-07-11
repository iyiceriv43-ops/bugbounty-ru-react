// Base URL helper for GitHub Pages (vite base path)
const base = import.meta.env.BASE_URL;
export function asset(path) {
  return base + path.replace(/^\//, '');
}
