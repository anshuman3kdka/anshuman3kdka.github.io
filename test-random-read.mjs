import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const buildRandomReadUrlCandidates = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return [];

  const candidates = [raw];

  if (raw.endsWith('/')) {
    candidates.push(`${raw}index.html`);
    candidates.push(`${raw.slice(0, -1)}.html`);
  } else if (raw.endsWith('.html')) {
    const withoutHtml = raw.replace(/\.html$/i, '');
    candidates.push(`${withoutHtml}/`);
    candidates.push(`${withoutHtml}/index.html`);
  } else {
    candidates.push(`${raw}/`);
    candidates.push(`${raw}.html`);
    candidates.push(`${raw}/index.html`);
  }

  return [...new Set(candidates)];
};

const resolveRandomReadUrlSequentially = async (value, fetchMock) => {
  const candidates = buildRandomReadUrlCandidates(value);

  for (const candidate of candidates) {
    try {
      const response = await fetchMock(candidate, {
        method: 'HEAD',
        cache: 'no-store',
      });

      if (response.ok || response.status === 405) {
        return candidate;
      }
    } catch (error) {
      // Try the next candidate URL.
    }
  }

  return candidates[0] || '#';
};

const resolveRandomReadUrlParallel = async (value, fetchMock) => {
  const candidates = buildRandomReadUrlCandidates(value);

  // ⚡ Bolt: Use Ordered Parallelism to initiate all candidate requests concurrently,
  // but await them in priority order to return the fastest valid high-priority match
  // without blocking on slower, lower-priority requests.
  const requests = candidates.map(candidate =>
    fetchMock(candidate, { method: 'HEAD', cache: 'no-store' })
      .then(response => ({ candidate, ok: response.ok || response.status === 405 }))
      .catch(() => ({ candidate, ok: false }))
  );

  for (const request of requests) {
    const result = await request;
    if (result.ok) {
      return result.candidate;
    }
  }

  return candidates[0] || '#';
};

describe('Ordered Parallelism', () => {
  it('should be faster than sequential', async () => {
    // Mock fetch that takes 100ms and fails for first candidate, succeeds for second
    const fetchMock = async (url) => {
      await new Promise(r => setTimeout(r, 100));
      if (url.endsWith('index.html')) return { ok: true };
      return { ok: false };
    };

    const startSeq = Date.now();
    const resSeq = await resolveRandomReadUrlSequentially('/test/', fetchMock);
    const timeSeq = Date.now() - startSeq;

    const startPar = Date.now();
    const resPar = await resolveRandomReadUrlParallel('/test/', fetchMock);
    const timePar = Date.now() - startPar;

    assert.equal(resSeq, '/test/index.html');
    assert.equal(resPar, '/test/index.html');

    console.log(`Sequential: ${timeSeq}ms, Parallel: ${timePar}ms`);
    assert.ok(timePar < timeSeq);
  });
});
