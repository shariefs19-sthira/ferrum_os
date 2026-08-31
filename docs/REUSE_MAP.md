# REUSE_MAP.md — ferrum-web trunk reuse verdicts

Governed by AGENTS.md's Reuse policy (docs/seats/CRANE.md, docs/ROLE_MAP.md
for who does the porting): extraction from the stopped project is
read-only, the repos never merge, and anything ported in lands here only
as a normal W2 task under the current stage-gate/quality/protected-paths
rules.

**Source:** ferrum-web trunk (the stopped ferrum project).

## Verdicts

| Area | Verdict | Notes |
|------|---------|-------|
| BOQ logic | PORT-CONTENT | Port the logic/content itself into a W2 task; not a code merge. |
| Design tokens | Design reference only | Consult for visual/spacing/color decisions; do not import the token files or pipeline directly. |
| Content library | Does not exist | No content library to port from ferrum-web trunk — nothing to extract here. |
| Cloudflare setup | Account-pattern only | Reference for how the account/config is structured; not a config or infra port. |

**Repos never merge.** Every row above is a read/reference-only verdict;
none of them permit importing ferrum-web trunk as a dependency, submodule,
or merged history into this repo.
