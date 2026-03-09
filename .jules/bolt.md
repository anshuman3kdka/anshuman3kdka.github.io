
## 2024-03-08 - [Optimize Search Array Iteration]
**Learning:** Using chained `.map().filter()` operations on large datasets (like the client-side search index) creates significant performance bottlenecks due to creating garbage collection (GC) overhead by allocating intermediate objects that immediately get filtered out. Using `forEach` inside large loops also adds overhead through closure allocations.
**Action:** When filtering and transforming large arrays in performance-sensitive frontend paths, use a single standard `for` loop to conditionally apply transformations and `push()` into a new array.

## 2026-03-09 - [Ordered Parallelism for Prioritized URL Resolution]
**Learning:** Using `Promise.allSettled` to parallelize prioritized network requests (like URL candidate verification) can introduce a latency bottleneck. It forces the application to wait for the slowest, lowest-priority request to complete even if a high-priority request resolves quickly.
**Action:** Initiate promises in parallel but await them sequentially in priority order. This reduces total latency through concurrent execution while allowing immediate return for high-priority successes.
