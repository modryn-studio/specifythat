---
name: log
description: Drafts a build log post for modrynstudio.com from this project's recent git activity. Opens a PR on modryn-studio-v2 — merge when ready to publish.
agent: agent
---

Run `git log --oneline -20` in the terminal to get the last 20 commits from this repo.

Ask Luke: "Anything in that list I should skip, or any context I should know before drafting?"

Then:

1. Use the GitHub MCP to fetch one existing file from `modryn-studio/modryn-studio-v2` at `content/log/` to confirm the frontmatter format and writing style.
2. Draft a MDX post with:
   - Filename: `YYYY-MM-DD-[slug].mdx` — today's date, slug from the topic
   - Frontmatter:
     ```
     ---
     title: ""
     date: "YYYY-MM-DD"
     tag: ""
     ---
     ```
     The `tag` field must be the project slug. Use:
     - `meta` — process/workflow/how-I-work posts
     - the project slug (e.g. `project-loom`, `trend-detector`) — for anything specific to this project
     Ask Luke which tag to use if it isn't obvious.
   - Post body:

     **What shipped** — bullet list of the 3–5 most significant things as human outcomes. Not "feat: add X" but "X is now live".

     **Why** — 1–2 sentences on the decision or problem it solves. Luke's voice: short, direct, honest.

     **What's next** — 1 sentence. One thing. Not a roadmap.

     Leave a `<!-- TODO: fill in narrative -->` comment after each section.

   - Length: 150–300 words. Luke will expand.
   - Tone: building in public, honest, never hype.

3. Create a new branch in `modryn-studio/modryn-studio-v2` named `log/YYYY-MM-DD-[slug]`.
4. Push the draft MDX file to that branch at `content/log/YYYY-MM-DD-[slug].mdx`.
5. Open a pull request from that branch to `main` with:
   - Title: the post title
   - Body: "Draft log post — fill in narrative before merging."

The PR is the gate. Luke fills in the `<!-- TODO -->` sections in GitHub or by pulling modryn-studio-v2 locally, then merges when ready. Merging = publishing.
