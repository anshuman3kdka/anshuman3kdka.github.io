
## 2024-03-08 - [Optimize Search Array Iteration]
**Learning:** Using chained `.map().filter()` operations on large datasets (like the client-side search index) creates significant performance bottlenecks due to creating garbage collection (GC) overhead by allocating intermediate objects that immediately get filtered out. Using `forEach` inside large loops also adds overhead through closure allocations.
**Action:** When filtering and transforming large arrays in performance-sensitive frontend paths, use a single standard `for` loop to conditionally apply transformations and `push()` into a new array.

## 2024-03-09 - [Ordered Parallelism for URL Resolution]
**Learning:** Sequentially checking fallback URLs via `HEAD` requests introduces unnecessary latency. By initiating all candidate requests concurrently but iterating over their Promises in priority order, we can achieve "Ordered Parallelism." This minimizes network latency while preserving the required priority logic (returning the earliest high-priority match without blocking on slower, lower-priority requests).
**Action:** When resolving prioritized fallback URLs over the network, use concurrent `fetch` requests and await their results in order to return the first successful high-priority candidate quickly.
