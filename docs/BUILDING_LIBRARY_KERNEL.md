# Building library kernel

Status: executable domain contract; no public-library, engineering or BOQ reuse claim.

Ferrum's building library is a versioned graph of original or lawfully licensed parametric templates and tenant-private variants. It is not a folder of attractive models. Each template records identity, semantic geometry, applicability, required project evidence and the exact boundary within which a precomputed result may be reused.

## Template contract

Every template carries:

- template ID, semantic version and SHA-256 identity checksum;
- copyright-safe provenance, licence and reuse restrictions;
- building type, programme, occupancy, climate and jurisdiction applicability;
- parameter ranges for area, floors, dimensions and storey height;
- a semantic-geometry reference in metres;
- structural-system state and a separately versioned analysis envelope;
- BOQ baseline/range, assumptions and exclusions;
- required site inputs and intended downstream product outputs;
- review freshness and controlled release state.

The existing regional shell catalogue is admitted at `CATALOGUE REVIEWED`. Its geometry remains `INDICATIVE`; structural systems are `UNSPECIFIED`; analyses are `NOT COMPUTED`; and quantities are `NOT MEASURED`. This prevents the current visual studies from being presented as prevalidated buildings.

## Bounded reuse and recomputation

A future precomputed analysis is reusable only when the current project remains inside the recorded jurisdiction, soil, wind, seismic, snow, dimensions, materials and load envelope. Any mismatch records a recomputation trigger. User changes to geometry, openings, programme, structural system, materials or loads also trigger project-specific recomputation.

Missing site evidence produces `INSUFFICIENT SITE INPUTS`. Expired review produces `STALE TEMPLATE`. An analysis-free shell produces `NOT PRECOMPUTED`. Only a current, complete match may produce `WITHIN BOUNDED ENVELOPE`, and that state still does not confer issue or construction approval.

## Intent and library growth

SUTRA may derive a tenant-private variant from a template and normalized user intent. Equivalent intents are deduplicated within the same tenant and template version, while parent/template lineage is preserved. User interaction does not automatically train a model or enter the shared catalogue.

Promotion requires explicit library-contribution consent, licence review, privacy review, deterministic checks, architectural review, engineering review for structural outputs, quantity review for reusable BOQ baselines, evaluation and a versioned approval. An approved version is immutable; later improvement creates a successor.

## Product-time target

The 15–30 minute objective is measured as **time to first coordinated option**: one comparable design option whose source, assumptions, unresolved inputs and downstream recomputation state are visible. It is not a promise of a finished, authority-approved, engineering-verified or construction-ready building.

The executable contract is `apps/web/lib/designstudio/buildingLibraryKernel.ts`.

## Open-source capability boundary

Ferrum uses a curated adapter registry rather than treating every open-source project as an in-process dependency. The registry records licence class, integration mode, maturity, isolation and product mapping. `ACTIVE DEPENDENCY` requires a repository connection reference. Planned and evaluated entries carry no connection evidence and cannot be described as live.

Permissive components may still require data, model-weight, format-driver and service-term review. LGPL/MPL components retain covered-file and distribution obligations. GPL/AGPL or restricted candidates require an isolated boundary or commercial/legal adjudication. Open-source status never establishes engineering validation.

The executable registry is `apps/web/lib/capabilities/openSourceRegistry.ts`.
