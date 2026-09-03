# Vaastu orientation and placement ruleset

## 1. Purpose and scope

This document is the source of truth for S3/S4 Vaastu preference checks. It
turns a user-selected orientation and room-placement preference into a
deterministic result. It is not a structural, fire, accessibility, planning,
title, environmental, or legal-compliance assessment, and it does not claim
that following a preference produces a construction or wellbeing outcome.

The feature must be opt-in. Its output must state that it is a user-selected
traditional placement preference and that project professionals and applicable
codes control the final design.

## 2. Input contract

A check requires:

- a site-north bearing in degrees clockwise from true north;
- a plan coordinate system and room polygons or room centroids;
- a declared primary entrance; and
- room classifications from the controlled vocabulary below.

If any required input is absent, the result is `REQUIRES_INPUT`; no directional
claim may be made. North must be displayed on the plan so the operator can
inspect the basis of every result.

## 3. Direction model

Transform each room centroid and the primary-entrance point into the site-north
frame. Use eight equal 45-degree sectors: N, NE, E, SE, S, SW, W, and NW.
A point on a sector boundary is assigned to both adjacent sectors and may
satisfy either of their listed checks. This avoids a false negative caused by a
rounding boundary.

## 4. Result states

| State | Meaning | Delivery behaviour |
| --- | --- | --- |
| `PASS` | The declared placement matches a preferred sector. | Show the matched rule and orientation basis. |
| `ADVISORY` | The placement is an accepted alternative or falls outside a preferred sector. | Show the alternative or concern; do not block the plan. |
| `REQUIRES_INPUT` | Direction, classification, or geometry is missing or ambiguous. | Ask for the missing input; make no directional conclusion. |

There is no compliance `FAIL` state. These checks are advisory preferences and
cannot override life-safety, accessibility, code, or professional judgement.

## 5. Controlled placement checks

| Classification | `PASS` sector | `ADVISORY` sector or condition | Check key |
| --- | --- | --- |
| Primary entrance | N, NE, E | NW accepted alternative; all others show advisory | `entrance.orientation` |
| Kitchen | SE | NW accepted alternative; all others show advisory | `kitchen.placement` |
| Primary bedroom | SW | W or S accepted alternative; all others show advisory | `primary_bedroom.placement` |
| Prayer / meditation | NE | E or N accepted alternative; all others show advisory | `prayer.placement` |
| Study / work | N, NE, E | W accepted alternative; all others show advisory | `study.placement` |
| Toilet / washroom | W, NW, S | all other sectors show advisory; never block accessibility plumbing decisions | `toilet.placement` |
| Stair | S, SW, W | all other sectors show advisory; never override fire-egress or accessibility design | `stair.placement` |
| Water storage / well | N, NE, E | all other sectors show advisory; never override utilities, drainage, or safety design | `water.placement` |
| Heavy storage / service | S, SW, W | all other sectors show advisory | `service.placement` |
| Open court / garden | N, NE, E | all other sectors show advisory | `open_space.placement` |

A room assigned multiple classifications produces one result per check key; the
UI must not collapse them into an invented overall score. A user may dismiss an
advisory with a recorded rationale. `PASS` is a placement-match label, not a
certification.

## 6. Evaluation procedure

1. Validate the input contract and calculate the plan-to-north transform.
2. Resolve the primary entrance and each classified room to a centroid or the
   declared placement point.
3. Map the point to one or two sectors using the boundary rule in section 3.
4. Evaluate every applicable table row independently.
5. Return the check key, state, actual sector, preferred sector, and a concise
   explanation. Preserve the bearing and geometry revision used.
6. Render results beside the plan with the north arrow and the advisory
   disclaimer. Do not render a green “approved” plan badge.

## 7. Output contract

```json
{
  "check_key": "kitchen.placement",
  "state": "PASS",
  "actual_sectors": ["SE"],
  "preferred_sectors": ["SE"],
  "basis": {
    "north_bearing_degrees": 12.4,
    "geometry_revision": "user-plan-revision"
  },
  "message": "Kitchen placement matches the selected SE preference.",
  "disclaimer": "Preference guidance only; confirm all design decisions with qualified professionals and applicable requirements."
}
```

## 8. Non-negotiable guardrails

- Never infer true north from a screen orientation, device compass, map tile,
  street name, or a north-looking image.
- Never label a result as sanctioned, compliant, safe, approved, or guaranteed.
- Never use this ruleset to alter structural, fire, accessibility, setback,
  drainage, utility, or statutory constraints.
- Preserve the user’s classifications and overrides as design inputs, not as
  facts about a parcel or building.
