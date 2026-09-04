-- W-08 Intent API / WORKSPACE_SPEC.md §1/§4 — new tables for the
-- WorkspaceProject/Artifact object model. Separate from the existing
-- `projects`/`saved_artifacts` tables (0012/0008): those serve a
-- different, already-live shape (Command Deck project ownership, and
-- generic type/title/data saves used by every SaveToWorkspaceButton
-- call site today) and are not touched here — reusing them for a
-- richer, differently-shaped object model risks breaking what's
-- already working, per WORKSPACE_SPEC.md §1's verbatim object model.
CREATE TABLE IF NOT EXISTS workspace_projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  units_pref TEXT NOT NULL DEFAULT 'm' CHECK (units_pref IN ('m', 'ft')),
  primary_area_unit TEXT NOT NULL DEFAULT 'sqm',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_workspace_projects_user ON workspace_projects(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS workspace_artifacts (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES workspace_projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('PARCEL', 'MASSING', 'PLAN', 'STRUCTURAL', 'BOQ', 'INVEST', 'MARKET', 'PROCURE')),
  version INTEGER NOT NULL DEFAULT 1,
  inputs TEXT NOT NULL,
  outputs TEXT NOT NULL,
  provenance_source TEXT NOT NULL,
  provenance_freshness TEXT NOT NULL,
  provenance_status TEXT NOT NULL CHECK (provenance_status IN ('INDICATIVE', 'VERIFIED')),
  saved_at TEXT NOT NULL DEFAULT (datetime('now')),
  source_tool TEXT NOT NULL,
  source_row TEXT NOT NULL,
  lineage TEXT NOT NULL DEFAULT '[]'
);
CREATE INDEX IF NOT EXISTS idx_workspace_artifacts_project_type ON workspace_artifacts(project_id, type, version DESC);
