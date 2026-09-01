import { afterEach, expect } from 'vitest';
import { cleanup } from '@testing-library/react';
// @testing-library/jest-dom is pinned at v5.17.0 (package.json is a
// RULE 6 protected path — not bumping it to v6 here just to get the
// '/vitest' subpath export that v5 doesn't have). v5's matchers module
// extends a Jest-style global `expect`, which doesn't exist under
// vitest without `test.globals: true` (unset in vite.config.ts) — so
// extend vitest's own `expect` directly instead.
// @ts-expect-error — v5.17.0's plain (non-'/vitest') matchers subpath ships no .d.ts
import matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});