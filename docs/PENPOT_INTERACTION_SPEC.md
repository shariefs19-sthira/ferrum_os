# W-76 — Penpot interaction-pattern adaptation

## Decision

Ferrum does not embed, fork, link, or copy Penpot code. Penpot is a full
general-purpose design system whose MPL-2.0 source and operating footprint are
disproportionate to Ferrum's focused architectural viewport. The useful input
is interaction vocabulary only.

## Pattern mapping

| Reference pattern | Ferrum mapping | Current decision |
|---|---|---|
| Explicit selection | Selecting a podium, slab, or level identifies the same object in every rendered viewport. | Adapted in W-76. |
| Selection handles | A high-contrast bounding outline encloses the selected object in perspective, plan, and axonometric views. | Adapted in W-76 as a view-only `BoxHelper`. |
| Keyboard selection | A focused canvas cycles deterministic targets with `[` and `]`; the selected label remains visible. | Adapted in W-76. |
| Resize handles | Would change PLAN_GEN geometry. | Deferred; any future version must dispatch a SUTRA intent, never mutate the mesh directly. |
| Snap to grid | Would quantize a dimensional model change. | Deferred; any future version must use exact project units, paired numeric input, and the SUTRA intent pipeline. |

## Interaction contract

- Pointer selection and bracket-key selection are view operations under RULE 50.
- Selection changes material emphasis and the shared outline only; no plan,
  dimension, room, quantity, or persisted workspace state changes.
- One shared three.js scene supplies all viewports, so the selected object and
  outline cannot diverge between perspective, top-plan, and axonometric views.
- The canvas remains focusable and carries an explicit accessible instruction.
- Orange selection treatment follows Ferrum's existing accent; no new visual
  token or dependency is introduced.

## Provenance and licensing

The concept source is `penpot/penpot`, recorded in `docs/TECH_SCOUT.md` as
MPL-2.0 and **Concept-only**. This implementation was authored independently
against Ferrum's existing three.js scene. It contains no Penpot source,
assets, package, runtime, or derivative code.

## Proof contract

Headless verification must focus the canvas, press `]`, and assert that both
`data-selection-target` and the visible selected label change while the plan
state is byte-for-byte unchanged. A screenshot must show the orange outline
around the selected object in the shared rendered scene.
