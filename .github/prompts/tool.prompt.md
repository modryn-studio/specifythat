---
name: tool
description: "Register or update a tool on modrynstudio.com via PR."
agent: agent
---

You are in a project repo that is not `modryn-studio/modryn-studio-v2`. Register or update a tool entry on modrynstudio.com by opening a PR on that repo.

Ask for the following if not already provided:

1. **Name** — display name of the tool
2. **Description** — one sentence. What it does, who it's for.
3. **Status** — one of: `live`, `beta`, `building`, `coming-soon`
4. **URL** — (optional) external URL if the tool lives at a separate domain
5. **Screenshots** — Check if `public/screenshots/<slug>-light.png` and `public/screenshots/<slug>-dark.png` exist in the current repo (use the slug derived in the step below).
   - If both exist: use them. Commit any uncommitted screenshots before opening the PR.
   - If only one exists: use it for `screenshotUrl` only.
   - If neither exists: ask the user to drop screenshots into `public/screenshots/`. Preferred: `<slug>-light.png` + `<slug>-dark.png`. A single `<slug>.gif` is also accepted for an animated preview.
   - Derive public URLs from the tool's `url` hostname: `https://<domain>/screenshots/<slug>-light.png` (light) and `https://<domain>/screenshots/<slug>-dark.png` (dark).
   - Set `screenshotUrl` = light URL, `screenshotUrlDark` = dark URL (omit `screenshotUrlDark` if no dark variant exists).
6. **Launched date** — (optional, only if status is `live` or `beta`) ISO date, e.g. `2026-03-01`
7. **Log slug** — (optional) slug of the `/log` post documenting this build

Then:
- Derive the slug from the name (lowercase, spaces → hyphens, strip special chars)
- Check if `content/tools/<slug>.json` already exists on `modryn-studio/modryn-studio-v2` main branch using the GitHub MCP
- If it exists: update the file with the new values
- If it does not exist: create it
- Use a branch named `tool/<slug>` and open a PR against `main` on `modryn-studio/modryn-studio-v2` with:
  - Title: `tool: add/update <tool name>`
  - Body: the JSON that was written, plus a one-line summary of what changed
- Do NOT commit anything to the current repo except screenshots (which belong in `public/screenshots/`)
- Confirm the PR URL when done
