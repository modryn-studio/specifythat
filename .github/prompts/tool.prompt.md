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
5. **Screenshot URL** — (optional) path or public URL to a preview image
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
- Do NOT commit anything to the current repo — this change belongs in modryn-studio-v2 only
- Confirm the PR URL when done
