const assert = require('assert');

// Mock window and document
global.window = {
  location: {
    origin: 'https://example.com',
    pathname: '/about/',
    search: '?theme=dark',
    href: 'https://example.com/about/?theme=dark'
  }
};

const isSafeInternalUrl = (url) => {
  if (typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) return false;

  try {
    const parsed = new URL(trimmed, window.location.origin);
    // Only allow standard web protocols for internal site navigation
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    return parsed.origin === window.location.origin;
  } catch (e) {
    return false;
  }
};

const isNavigableDocumentLink = (link, href) => {
  if (!isSafeInternalUrl(href)) return false;

  if (link.target === "_blank" || link.hasAttribute("download") || link.getAttribute("rel")?.includes('external')) {
    return false;
  }

  const path = new URL(href, window.location.origin).pathname;
  const extensionMatch = path.match(/\.([a-z0-9]+)$/i);
  if (!extensionMatch) return true;

  return extensionMatch[1] === 'html';
};

const link = {
  target: '',
  hasAttribute: () => false,
  getAttribute: () => null
};

// This is a same-page anchor link. It should return false so native scroll happens.
const href = 'https://example.com/about/?theme=dark#section2';
const result = isNavigableDocumentLink(link, href);
console.log('Is navigable (should be false for anchor):', result);
assert.strictEqual(result, true, 'Currently returns true (which is the bug)');

console.log('Bug reproduced: same-page anchor links are treated as full page transitions.');
