---
name: deps
description: "Check all dependencies for newer versions and report what can be updated."
agent: agent
tools: ['runInTerminal', 'editFiles']
---
# Check Dependencies

Check all project dependencies for newer versions.

## Steps

1. Run `npx npm-check-updates` in the terminal to see available updates.
2. Show a summary table of what's outdated:
   - Package name
   - Current version
   - Latest version
   - Update type (major / minor / patch)
3. Ask me which updates to apply before making any changes.
4. If I approve, run `npx npm-check-updates -u` to update `package.json`, then run `npm install`.
5. After updating, verify nothing broke by running `npm run build` (if a build script exists).

## Rules
- **NEVER auto-update major versions without asking** — major bumps can break things.
- Minor and patch updates can be applied together if I approve.
- Pin all versions to exact (no `^` or `~`) after updating.
- If `npm-check-updates` is not installed, use `npx` to run it directly — do NOT install it globally.
