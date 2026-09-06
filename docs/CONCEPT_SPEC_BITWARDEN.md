# CONCEPT_SPEC_BITWARDEN.md — W-77 concept spec

**Deliverable is this document only.** Per `docs/TASK_BOARD.md` W-77's acceptance: no vault feature is built in this pass; no Bitwarden code is adapted or linked. The reusable idea researched in `docs/TECH_SCOUT.md` #5 (`bitwarden/clients`, GPLv3-lineage per Bitwarden's actual license despite GitHub's `NOASSERTION` report) is the **zero-knowledge, client-side-encryption architecture pattern** — not Bitwarden's own code, which stays untouched and unreferenced beyond this citation.

## Why this pattern, for what future feature

A plausible future Ferrum feature: a **project document vault** — letting a user store sensitive project documents (title deeds, sanction letters, contracts) attached to a workspace project, where Ferrum's own servers (and by extension anyone with database access) cannot read the document contents. This is a materially different trust model from the current `saved_artifacts`/`workspace_artifacts` tables, which store plaintext JSON the server can read (correctly so, since analysis engines need to read that data to compute results — feasibility scores, cost breakdowns, etc.). A document vault has no such need: nothing server-side has to *read* a stored PDF's contents, only store and later return the exact bytes to the owning user.

## The architecture pattern (zero-knowledge vault)

1. **Key derivation, client-side only.** A vault-specific encryption key is derived from the user's own credentials (e.g. via PBKDF2/Argon2 over the user's password plus a per-user salt) entirely in the browser. This key is never transmitted to or stored on the server in any form — not encrypted, not hashed, not as a derived value.
2. **Encrypt before upload.** Every document is encrypted client-side (e.g. AES-256-GCM) using that derived key before any network request. The server only ever receives and stores ciphertext plus non-secret metadata (filename, size, upload timestamp, content-type) needed for listing/retrieval.
3. **Decrypt after download.** Retrieval is the mirror: the server returns ciphertext, the browser decrypts it locally using the same client-derived key. The server is never in the decryption path at any point.
4. **Server compromise yields nothing.** Because the key never leaves the client and the server only ever holds ciphertext, a full database breach (or a malicious/compelled server operator) exposes encrypted blobs only — this is the "zero-knowledge" property: the vault operator has zero knowledge of the vault's contents.
5. **Key recovery is the hard, honestly-labeled trade-off.** If a user forgets their password, there is no "reset and keep your files" path without either (a) a recovery-key mechanism the user must separately back up (Bitwarden's own approach), or (b) permanent data loss. This is not a solvable-away limitation — it is the direct, necessary cost of the zero-knowledge property, and must be disclosed to the user up front, not discovered after the fact.

## Where this would attach in Ferrum's existing architecture (not built, for future reference)

- **Storage:** could reuse the existing D1 `workspace_artifacts`-style table shape (id, project_id, type, created_at) plus a new `ciphertext` blob column and a `content_type`/`filename` metadata pair — no new database technology needed.
- **Key handling:** would need a new client-side crypto module (Web Crypto API's `SubtleCrypto` — no external library required, browser-native, zero new dependency) sitting alongside the existing `lib/auth/` password-hashing code, but architecturally separate from it (the auth password hash and the vault-derivation key must use different salts/derivations so a server-side auth breach doesn't also expose vault keys).
- **UI:** a new artifact type (e.g. `type: "vault_document"`) in the existing `SaveToWorkspaceButton`/`SavedArtifactsPanel` pattern, with the crypto step inserted before the existing `POST /api/workspace/artifacts` call — the API contract itself barely changes, only the payload's *content* becomes opaque ciphertext instead of readable JSON.

## What this spec explicitly does NOT authorize

- No Bitwarden source code, forked or adapted, enters this repository.
- No vault feature is implemented, wired, or exposed in this pass — this document is the entire W-77 deliverable.
- Building the actual feature (if approved later) is separate, code-level work outside a concept-spec row's scope, and outside ATLAS's own permanent envelope (`docs/seats/ATLAS.md`, 2026-09-06) regardless of who picks it up.
