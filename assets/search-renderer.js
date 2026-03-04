const createResultItem = (item) => {
  const li = document.createElement('li');
  li.className = 'search-result-item';

  const link = document.createElement('a');
  link.className = 'search-result-link';
  link.href = item.url;
  link.textContent = item.title || 'Untitled';

  const meta = document.createElement('p');
  meta.className = 'search-result-meta';
  const tagsText = Array.isArray(item.tags) && item.tags.length ? ` · ${item.tags.join(', ')}` : '';
  meta.textContent = `${item.category || 'General'}${tagsText}`;

  const excerpt = document.createElement('p');
  excerpt.className = 'search-result-excerpt';
  excerpt.textContent = item.excerpt || 'No preview available.';

  li.append(link, meta, excerpt);
  return li;
};

export const renderSearchState = ({ listElement, liveRegion, message = '', results = [] }) => {
  listElement.innerHTML = '';

  if (message) {
    const empty = document.createElement('li');
    empty.className = 'search-empty-state';
    empty.textContent = message;
    listElement.append(empty);
    const isHint = message.toLowerCase().includes('type at least 2 letters');
    liveRegion.textContent = isHint ? '' : message;
    return;
  }

  results.forEach((item) => {
    listElement.append(createResultItem(item));
  });

  liveRegion.textContent = `${results.length} result${results.length === 1 ? '' : 's'} found.`;
};
