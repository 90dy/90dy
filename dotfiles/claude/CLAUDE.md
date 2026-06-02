# Personal working conventions

These are Godefroy's working conventions for any work done on this machine. They apply
to every repo unless a repo-local CLAUDE.md says otherwise.

## Workspace layout

All code lives under `~/workspace/`, organized by remote host → org → repo:

    ~/workspace/<host>/<org>/<repo>

Examples:
- `~/workspace/github.com/ctnr-io/<repo>`
- `~/workspace/gitlab.com/blade-group/<repo>`

Never clone repos outside this tree. When suggesting a `git clone` command, build the
target path from the remote URL so the layout is preserved.

## VS Code workspaces (one per org)

Each org has a sibling `<org>.workspaces/` directory containing `.code-workspace` files
that group related repos / tasks for that org. Examples:

- `~/workspace/gitlab.com/blade-group.workspaces/containerization.code-workspace`
- `~/workspace/github.com/ctnr-io.workspaces/default.code-workspace`

When a task spans multiple repos in the same org, expect to find (or extend) one of
these workspace files rather than opening repos individually.

### Each workspace has a runbook

Alongside every `<name>.code-workspace` file, there is (or should be) a sibling
`<name>.md` runbook in the same `<org>.workspaces/` directory. It captures the
conventions for that workspace's effort: source-of-truth links, per-issue
workflow, reference repos, naming rules, status snapshot.

When working inside a workspace, **read the matching runbook first** before
making structural decisions (Dockerfile shape, CI template, MR description,
target repo paths). If the runbook is missing, create one as the first
deliverable of the effort.

## Worktrees (one per workspace, per repo, per issue)

Parallel work uses `git worktree`, not branch switching. Worktrees live as
a sibling to the repo directory. The worktree directory name surfaces
**both** the VS Code workspace and the issue it implements:

    ~/workspace/<host>/<org>/<repo>.worktrees/<workspace>@<issue-id>

- `<workspace>` is the basename of the `.code-workspace` file in use
  (e.g. `containerization.code-workspace` → `containerization`). All
  worktrees that participate in the same cross-repo effort share the same
  `<workspace>` segment, so they line up cleanly inside the workspace's
  `folders` array.
- `<issue-id>` is the Linear/tracker issue identifier in its canonical
  uppercase form (e.g. `DEVPLAT-38`, `ENG-1234`). Short, flat, no slashes —
  one directory, never nested.
- The git **branch** checked out inside the worktree (e.g.
  `godefroyponsinet/devplat-38-migrate-netbox-proxy`) is independent from
  the directory name. I will give it to you; do not derive or invent.

Standard flow for starting work in a workspace:

1. Identify the workspace I'm using (basename of the open `.code-workspace`,
   or ask if unclear).
2. Wait for me to provide the issue id and branch name.
3. From the repo's main checkout, create the worktree:
   `git worktree add ../<repo>.worktrees/<workspace>@<issue-id> -b <branch>`
   (drop `-b` if the branch already exists on the remote).
4. Add the new worktree path to the workspace's `.code-workspace` `folders`
   array in the **same turn** as the `git worktree add` — not later.

When the workspace's work is done: merge/close the branches, then
`git worktree remove <path>` for each repo and delete the local branches.
Do not leave stale worktrees around.

## Working with me

- Default to `gh` / `glab` for GitHub / GitLab CLI work.
- **Default to `rg` (ripgrep), never `grep`, for any file search.** `rg`
  obeys `.gitignore` and binary detection by default, so the output is
  smaller and more relevant — fewer tokens in context, less noise.
  Prefer flags like `-l` (filenames only), `-n` (line numbers), `-C2`
  (small context window), and a path argument scoping the search. Use
  `grep` only when piping the output of another command or when `rg`
  isn't installed.
- Treat the main checkout as the long-lived branch (usually `main`); never commit
  task work directly to it — always through a worktree.
- **Dockerfiles live at the repo root** (`./Dockerfile`), never in a
  `docker/` subdirectory. Don't set `DOCKERFILE: docker/Dockerfile` in CI —
  let buildah / docker pick up the default root `Dockerfile`. If a reference
  repo uses `docker/Dockerfile`, ignore that detail and put yours at root
  anyway.
- Before suggesting commands that touch repos, confirm which worktree we are
  in; paths under `<repo>.worktrees/<workspace>@<issue-id>` are workspace-
  scoped task work, the bare `<repo>` is main.
- **Before opening any MR/PR**, rebase the branch on the latest upstream
  default branch:

      git fetch origin
      git pull --rebase origin <default-branch>

  Do this in the worktree, just before `glab mr create` / `gh pr create`. This
  keeps history linear and avoids surprise conflicts after review starts.
- **Stop and check in every ~5k tokens of exploration.** If a single
  research thread (file reads + greps + API queries) is approaching ~5k
  tokens of *tool output* without a concrete action or report back, pause:
  summarise what's been learned so far, state the next planned probe, and
  let me redirect. Don't keep digging on a hunch — exploration spirals
  burn context and money without proportional value.

## This file is versioned

This CLAUDE.md is a symlink to
`~/workspace/github.com/90dy/90dy/dotfiles/claude/CLAUDE.md` and is tracked
in the public repo `github.com/90dy/90dy` under `dotfiles/`.

The `dotfiles/` tree mirrors `$HOME` with the leading dots stripped: each
top-level entry `dotfiles/<name>` corresponds to `~/.<name>`. A `Makefile`
inside `dotfiles/` manages the symlinks:

    cd ~/workspace/github.com/90dy/90dy/dotfiles
    make install    # create symlinks (file-level, parents preserved)
    make uninstall  # remove only symlinks pointing back into this repo
    make list       # dry-run

**Whenever you (Claude) edit this file**, finish by committing and pushing
the change from the 90dy repo:

    cd ~/workspace/github.com/90dy/90dy
    git add dotfiles/claude/CLAUDE.md
    git commit -m "<one-line description of the rule changed>"
    git push

Do this in the same turn as the edit — don't leave the working tree dirty.
