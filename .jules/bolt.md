
## 2026-03-15 - [Hoist Static Data Out of Frequent Functions]
**Learning:** Functions called frequently (like route classification during page transitions) that declare array literals containing complex objects like Regular Expressions allocate new arrays and compile Regexes on every execution. This creates a hidden performance tax and garbage collection overhead.
**Action:** Always hoist static, non-changing array literals and Regular Expressions out of frequently executed functions into the module scope.

## 2024-03-08 - [Optimize Search Array Iteration]
**Learning:** Using chained `.map().filter()` operations on large datasets (like the client-side search index) creates significant performance bottlenecks due to creating garbage collection (GC) overhead by allocating intermediate objects that immediately get filtered out. Using `forEach` inside large loops also adds overhead through closure allocations.
**Action:** When filtering and transforming large arrays in performance-sensitive frontend paths, use a single standard `for` loop to conditionally apply transformations and `push()` into a new array.

## 2025-05-15 - [Parallelize Fallback Index Loading]
**Learning:** Sequential `fetch` calls in a fallback mechanism (like loading a content index) introduce significant cumulative latency if the primary URL fails or is slow. `Promise.any` provides a robust way to parallelize these requests and adopt the first successful response.
**Action:** Replace sequential `for...of` fetch loops with `Promise.any` when retrieving resources from multiple fallback locations to minimize the total loading time to that of the fastest successful request.
