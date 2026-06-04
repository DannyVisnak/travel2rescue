// Resolves a Keystatic image value to a usable URL.
//
// Keystatic's `fields.image({ publicPath: '/images/' })` stores only the bare
// filename in JSON, and the `reader` returns it WITHOUT the publicPath prefix
// (publicPath is only applied to document-field images, not `fields.image`).
// So a value like `IMG_0991.jpeg` must become `/images/IMG_0991.jpeg`, or the
// browser resolves it relative to the current page and 404s.
//
// Idempotent: already-absolute ("/…") and remote ("http…") values pass through,
// so it's safe to wrap fallbacks that are already full paths.
export function img(value?: string | null, fallback = ''): string {
  const v = (value ?? '').trim();
  if (!v) return fallback;
  if (v.startsWith('http://') || v.startsWith('https://') || v.startsWith('/')) {
    return v;
  }
  return `/images/${v}`;
}
