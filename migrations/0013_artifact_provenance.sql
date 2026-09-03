-- W2-400: structured provenance per saved artifact (source + freshness),
-- consistent with the ProvenanceStrip pattern (W2-387) — nullable, since
-- most existing artifact types have no real source/freshness concept yet
-- and this must never invent one to fill the column.
ALTER TABLE saved_artifacts ADD COLUMN provenance_source TEXT;
ALTER TABLE saved_artifacts ADD COLUMN provenance_freshness TEXT;
