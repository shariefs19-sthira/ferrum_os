# DEPLOY_SECRETS.md — Cloudflare deploy secrets for CI auto-deploy

This file contains no secret values, ever — only the recipe for
generating them. `.github/workflows/ci.yml`'s `deploy` job (runs on
every push to `main`, after tests pass) needs two GitHub Actions repo
secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## Generating the Cloudflare API token

1. Cloudflare dashboard → **My Profile** → **API Tokens**.
2. **Create Token** → **Custom token**.
3. Permissions, exactly:
   - **Workers Scripts: Edit**
   - **Account Settings: Read**
4. Scope to the account this project deploys under (not "All accounts"
   unless that's genuinely intended).
5. Create, copy the token once (Cloudflare will not show it again).

## Finding the Account ID

Cloudflare dashboard → right sidebar (on the Workers & Pages overview,
or any account-level page) → **Account ID**.

## Setting the secrets

Run `scripts/set-deploy-secrets.ps1` and paste both values when
prompted (input is masked, `Read-Host -AsSecureString`; nothing is
echoed, logged, or written to disk by the script). It uses `gh secret
set` if the `gh` CLI is already authenticated in this environment, or
falls back to the GitHub REST API with a one-time prompted Personal
Access Token (`repo` scope) if not.

Run `scripts/set-deploy-secrets.ps1 -CheckOnly` any time to verify,
without prompting for anything: that `ci.yml`'s `deploy` job actually
references both secret names, and whether both secrets are currently
present on the repo (name/last-updated only — GitHub never returns a
secret's value once set, to anyone, so this check cannot leak one).

## Rotating or revoking

Regenerate the Cloudflare token the same way (Cloudflare tokens can be
individually revoked from the same API Tokens page) and re-run
`scripts/set-deploy-secrets.ps1` — `gh secret set` / the REST API both
overwrite an existing secret of the same name.
