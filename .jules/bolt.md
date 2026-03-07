## 2026-03-07 - [Consolidated Indices & Client-Side Tokenization]
**Learning:** For small-to-medium static sites, pre-calculating search tokens during the build step can bloat JSON payloads by 40-50% with redundant data. Consolidation of multiple indices (e.g., Search and Random Read) into a single asset further reduces HTTP overhead and build complexity.
**Action:** Always evaluate if build-time data processing (like tokenization) can be shifted to the client-side loader to optimize transfer size without sacrificing runtime performance.
