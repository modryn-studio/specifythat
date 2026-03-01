# Copilot Setup — How To Use

## Modes (built into VS Code)

| Mode | When to use | How |
|------|-------------|-----|
| **Ask** | Quick questions about your codebase | Chat → select "Ask" |
| **Plan** | Blueprint a feature before building | Chat → select "Plan" |
| **Agent** | Build, edit files, run commands | Chat → select "Agent" |

Open chat: `Ctrl+Alt+I`

## Custom Agent

**`@check`** — Pre-ship quality gate. Checks for bugs → scans → fixes → lints → builds → commits. Never pushes.

Usage: switch to Agent mode, then type:
```
@check
```

## Slash Commands

**`/init`** — New project setup. Reads `context.md` + `brand.md` + `development-principles.md` and fills in the TODO sections of `copilot-instructions.md` and `src/config/site.ts`. Run this once at the start of every new project.

**`/tool`** — Register this project as a tool on modrynstudio.com. Opens a PR on `modryn-studio/modryn-studio-v2` with the tool JSON. Run it when you add the tool and again when you ship (to flip status to `live`, add URL, screenshot, and launch date).

**`/log`** — Draft a build log post for modrynstudio.com. Reads recent commits from this repo, asks for context, then opens a PR on `modryn-studio/modryn-studio-v2` with a draft MDX post. Fill in the TODOs, merge to publish.

**`/deps`** — Check all dependencies for newer versions. Shows outdated packages, asks before updating.

**`/seo`** — Pre-launch SEO checklist. Auto-generates missing SEO files, then walks you through Google Search Console, Bing, and OG validation.

**`/launch`** — Distribution checklist. Run after `/seo`. Audits and fixes sharing hooks, social footer links, dynamic OG images, and FAQPage schema. Then walks you through the launch day posting sequence: build log → Ship or Die → X → dev.to → HN → Reddit → Product Hunt (optional).

Usage: type any slash command in chat.

## Hooks (auto-runs after edits)

**Format on Save** — Files are automatically formatted with Prettier whenever you save.

Configured via `editor.formatOnSave: true` in `.vscode/settings.json`. Requires the [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extension (VS Code will prompt you to install it — it's listed in `.vscode/extensions.json`). Formatting rules live in `.prettierrc`.

## MCP Servers

- **GitHub** — create issues, PRs, manage repos from chat

## File Map

```
.github/
├── copilot-instructions.md        ← Always-on context (edit per project)
├── instructions/
│   ├── nextjs.instructions.md    ← Auto-applied to .ts/.tsx files
│   └── seo.instructions.md        ← Auto-applied to .ts/.tsx files
├── agents/
│   └── check.agent.md             ← @check agent (pre-ship quality gate)
├── prompts/
│   ├── init.prompt.md             ← /init command (fills copilot-instructions + site.ts from context.md + brand.md)
│   ├── tool.prompt.md             ← /tool command (register/update tool on modrynstudio.com → PR)
│   ├── deps.prompt.md             ← /deps command (update checker)
│   ├── log.prompt.md              ← /log command (draft build log post → PR on modryn-studio-v2)
│   ├── seo.prompt.md              ← /seo command (SEO audit + registration)
│   └── launch.prompt.md           ← /launch command (distribution: sharing hooks, social, community posting)
.vscode/
├── settings.json                  ← Agent mode enabled, formatOnSave, Prettier as default formatter
├── extensions.json                ← Recommends Prettier extension on first open
└── mcp.json                       ← MCP server config (GitHub only)
src/config/
└── site.ts                        ← Single source of truth: site name, URL, description, brand colors, social links
src/lib/
├── cn.ts                          ← Tailwind class merge utility (clsx + tailwind-merge)
├── route-logger.ts                ← API route logging utility (createRouteLogger)
└── analytics.ts                   ← GA4 event tracking abstraction (analytics.track)
context.md                         ← Fill this in per project (product facts + routes)
brand.md                           ← Fill this in per project (voice, visuals, copy examples)
development-principles.md          ← Permanent product philosophy — do not edit per project
```

## New Project Setup

1. Copy `.github/`, `.vscode/`, `src/lib/`, and `src/config/` into the new project
2. Run `npm install` — this installs Prettier automatically (it's in `devDependencies`)
3. Fill in `context.md` — product idea, target user, stack additions, routes, and this project's GitHub URL in Social Profiles
4. Fill in `brand.md` — voice, visual rules, emotional arc, and copy examples
5. Type `/init` — Copilot reads all three files and fills in `.github/copilot-instructions.md` + `src/config/site.ts`
6. Done — everything else applies automatically

## Brand Assets

Drop your logomark, run one script, get all icons and images generated automatically.

**Required:**
- `public/brand/logomark.png` — 1024×1024, your mark on a transparent background

**Optional:**
- `public/brand/logomark-dark.png` — white/light version of the mark. If present, enables light/dark favicon switching. If absent, `logomark.png` is used for both modes (fine for colored marks).
- `public/brand/banner.png` — 1280×320 README header. Auto-generated from your logomark if missing.

Then run (requires [ImageMagick](https://imagemagick.org)):
```powershell
.\scripts\generate-assets.ps1
```

Re-run any time you update the logomark or after filling in `src/config/site.ts` — the script stamps your site name on the OG image and banner.

**What gets generated:**

| File | Purpose |
|---|---|
| `public/icon-light.png` | Favicon in light mode |
| `public/icon-dark.png` | Favicon in dark mode |
| `public/icon.png` | 1024×1024 for manifest + JSON-LD |
| `public/favicon.ico` | Legacy fallback (48/32/16px) |
| `src/app/apple-icon.png` | iOS home screen icon |
| `public/og-image.png` | 1200×630 social card |
| `public/brand/banner.png` | README header (if not provided) |

## Live Log Monitoring

`Ctrl+Shift+B` starts the dev server and pipes all output to `dev.log`.
Once it's running, tell Copilot **"check logs"** at any point — it reads `dev.log` and flags errors, slow API requests, or unexpected responses without you having to paste anything.

Prerequisite: the server must be running and `dev.log` must be capturing output before Copilot can read it. If you haven't started the server yet, do that first.

## Day-to-Day Workflow

1. **Plan** → use Plan mode to scope the feature
2. **Build** → switch to Agent mode and execute
3. **Ship** → type `@check`
4. **Push** → review the commit diff, then `git push` yourself

> Tip: `Configure Chat (gear icon) > Diagnostics` shows all loaded configs and errors.
