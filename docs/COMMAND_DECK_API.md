# Command Deck API contract

The Command Deck consumes only this project/activity contract. Every request
uses the existing session cookie; no client-provided user ID is accepted.
Unauthenticated requests return `401`. A project or artifact belonging to a
different user returns `404`, not `403`.

## `GET /api/projects`

Returns `{ "projects": [{ "id", "name", "city", "ulpin?" }] }` for the
signed-in user.

## `POST /api/projects`

Creates a project for the signed-in user from exactly:

```json
{ "name": "required string", "city": "required string", "ulpin": "optional string" }
```

## `GET /api/projects/:id`

Returns the owned project and attached artifacts:

```json
{ "id": "prj_123", "name": "Example", "city": "Pune", "ulpin": "optional", "artifacts": [{ "id": "art_123", "type": "boq", "title": "Optional title", "input": {} }] }
```

`input` holds the last engine inputs when available. The UI carries it forward
in resume links together with `project_id` and `artifact_id`.

## `POST /api/projects/:id/attach`

Attaches an artifact owned by the signed-in user using exactly:

```json
{ "artifact_id": "art_123" }
```

Return `404` if the project or artifact is not owned by that session. Do not
create cross-user attachments; duplicate requests must be idempotent or return
a documented client error.

## `GET /api/activity`

Returns `{ "activity": [...] }`, newest first, for the signed-in user. Each
entry may include `id`, `type`, `message`, `project_id`, `project_name`, and
`created_at` (ISO-8601).

Until CRANE implements these endpoints, the UI deliberately shows an
unavailable/empty state rather than sample project data.
