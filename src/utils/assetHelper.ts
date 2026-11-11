/**
 * Universal asset URL resolver for AI Studio and GitHub Pages
 * Handles relative paths consistently so images work both in dev (/)
 * and when deployed to GitHub Pages subpath (/novinfilter/).
 */
export function resolveAssetUrl(path: string | undefined | null): string {
  if (!path) return '';

  // Return absolute external URLs or data URLs directly
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }

  // Remove leading slashes and leading dot-slashes to get clean relative path
  const cleanPath = path.replace(/^(\.\/|\/)+/, '');

  // In Vite with base: './', import.meta.env.BASE_URL is './'
  // When running on GitHub Pages (https://user.github.io/novinfilter/),
  // a relative path like './assets/...' cleanly resolves to the repository root.
  const base = import.meta.env.BASE_URL || './';
  
  if (base.endsWith('/')) {
    return `${base}${cleanPath}`;
  }
  return `${base}/${cleanPath}`;
}
