const mockFetch = (url, latency, ok = true) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (ok) {
                resolve({ ok: true, json: () => Promise.resolve({ items: [] }) });
            } else {
                resolve({ ok: false });
            }
        }, latency);
    });
};

async function sequentialFetch(urls, fetchMockMap) {
    const start = Date.now();
    let response = null;
    for (const url of urls) {
        try {
            const candidate = await fetchMockMap[url]();
            if (!candidate.ok) continue;
            response = candidate;
            break;
        } catch (error) {}
    }
    return { duration: Date.now() - start, success: !!response };
}

async function parallelFetch(urls, fetchMockMap) {
    const start = Date.now();
    try {
        const response = await Promise.any(
            urls.map(async (url) => {
                const candidate = await fetchMockMap[url]();
                if (!candidate.ok) throw new Error('Not OK');
                return candidate;
            })
        );
        return { duration: Date.now() - start, success: !!response };
    } catch (error) {
        return { duration: Date.now() - start, success: false };
    }
}

async function run() {
    const urls = ['a', 'b'];

    console.log('Case 1: First fails (100ms), second succeeds (50ms)');
    const mocks1 = {
        'a': () => mockFetch('a', 100, false),
        'b': () => mockFetch('b', 50, true)
    };
    const seq1 = await sequentialFetch(urls, mocks1);
    console.log('Sequential:', seq1);
    const par1 = await parallelFetch(urls, mocks1);
    console.log('Parallel:', par1);

    console.log('\nCase 2: Both succeed, first is slow (200ms), second is fast (50ms)');
    const mocks2 = {
        'a': () => mockFetch('a', 200, true),
        'b': () => mockFetch('b', 50, true)
    };
    const seq2 = await sequentialFetch(urls, mocks2);
    console.log('Sequential:', seq2);
    const par2 = await parallelFetch(urls, mocks2);
    console.log('Parallel:', par2);
}

run();
