# Relume Integration Specifications

## Intake Protocol

Every Relume export lands as a versioned artifact in `docs/relume/<page>-<date>.json|md` in the same PR as its code. No design-to-code implementation is allowed without the corresponding artifact.

### Artifact Requirements

1. **Naming Convention**: Artifacts must follow the pattern `docs/relume/<page>-<YYYY-MM-DD>.json` or `docs/relume/<page>-<YYYY-MM-DD>.md`
2. **Synchronization**: The Relume export artifact must be included in the same pull request that implements the design
3. **Format**: JSON for component data, MD for layout/content documentation

### Example Structure

```
docs/
└── relume/
    ├── home-2026-08-29.json
    ├── pricing-2026-08-29.json
    └── about-2026-08-29.json
```

## Contract Management

The file `packages/shared/src/relume-contracts.ts` serves as the single mapping layer between Relume exports and code implementation. Any changes to this interface require:
1. A dedicated pull request
2. Human approval before merging

## Batch Processing (WAVE_QUEUE)

Draft W2 batch (DRAFT; releases when Relume resets AND B2 closed):
- W2-01: Case Studies page
- W2-02: IS Code Guides page
- W2-02: IS Code Guides page  
- W2-03: Section-parity sweep (Home/Pricing/About/Resources vs Relume sitemap screenshot)

## Quality Assurance

After each intake merge, the operator must run:
1. Baseline refresh (W1-24)
2. Pixelmatch comparison against pre-merge screenshots
3. Any regressions automatically spawn subtasks

## Related Ideas

- IDEA-060: Design artifacts should be versioned alongside code
- IDEA-061: External tool resets should serve as batch boundaries