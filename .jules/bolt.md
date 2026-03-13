
## 2024-03-08 - [Optimize Search Array Iteration]
**Learning:** Using chained `.map().filter()` operations on large datasets (like the client-side search index) creates significant performance bottlenecks due to creating garbage collection (GC) overhead by allocating intermediate objects that immediately get filtered out. Using `forEach` inside large loops also adds overhead through closure allocations.
**Action:** When filtering and transforming large arrays in performance-sensitive frontend paths, use a single standard `for` loop to conditionally apply transformations and `push()` into a new array.

## 2024-03-13 - [Hoist Route Patterns to Prevent Reallocation]
**Learning:** Functions that map or classify navigation routes (like `classifyRoute` in `assets/site.js`) are frequently called during page transitions. Declaring arrays or `RegExp` objects inside these functions causes them to be reallocated and Garbage Collected on every single invocation. This creates unnecessary overhead for frequently executed functions.
**Action:** Always hoist static arrays and `RegExp` objects into module scope to prevent reallocation overhead.
