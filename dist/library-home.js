const legacyCategoryRoots = new Set(['embedded', 'software', 'tools', 'thinking']);
const legacyParams = new URLSearchParams(location.search);
const legacyPathRoot = String(legacyParams.get('path') || '').split('/').filter(Boolean)[0];
const requestedLegacyCategory = legacyParams.get('category');
const legacyCategory = legacyCategoryRoots.has(requestedLegacyCategory) ? requestedLegacyCategory : legacyPathRoot;

if (legacyCategoryRoots.has(legacyCategory)) {
  const nextParams = new URLSearchParams(legacyParams);
  nextParams.set('category', legacyCategory);
  window.location.replace(`category.html?${nextParams.toString()}${location.hash}`);
}
