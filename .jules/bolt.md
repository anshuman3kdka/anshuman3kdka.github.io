
## 2024-03-08 - [Optimize Search Array Iteration]
**Learning:** Using chained `.map().filter()` operations on large datasets (like the client-side search index) creates significant performance bottlenecks due to creating garbage collection (GC) overhead by allocating intermediate objects that immediately get filtered out. Using `forEach` inside large loops also adds overhead through closure allocations.
**Action:** When filtering and transforming large arrays in performance-sensitive frontend paths, use a single standard `for` loop to conditionally apply transformations and `push()` into a new array.

## 2025-05-15 - [Parallelize Fallback Index Loading]
**Learning:** Sequential `fetch` calls in a fallback mechanism (like loading a content index) introduce significant cumulative latency if the primary URL fails or is slow. `Promise.any` provides a robust way to parallelize these requests and adopt the first successful response.
**Action:** Replace sequential `for...of` fetch loops with `Promise.any` when retrieving resources from multiple fallback locations to minimize the total loading time to that of the fastest successful request.

## 2026-04-11 - [Parallelize Recursive Directory Walk]
**Learning:** Sequential recursive calls (`await walk(dir)`) within a loop for directory traversal are a significant I/O bottleneck as each level of the tree must wait for the previous one to complete entirely before moving to the next entry.
**Action:** Use `Promise.all` combined with `entries.map` and `Array.prototype.flat()` to parallelize file system I/O during recursive directory walks, which can yield substantial performance gains (up to 50%+ in this repository).
