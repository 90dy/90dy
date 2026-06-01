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

## Worktrees (one per workspace, per repo)

Parallel work uses `git worktree`, not branch switching. Worktrees live as a
sibling to the repo directory, and the worktree directory is named after the
VS Code workspace it belongs to — **not** after the branch:

    ~/workspace/<host>/<org>/<repo>.worktrees/<workspace>

`<workspace>` is the basename of the `.code-workspace` file currently in use
(e.g. `containerization.code-workspace` → `containerization`). All worktrees
across different repos that participate in the same cross-repo effort share
the same `<workspace>` segment, so they line up cleanly inside the workspace's
`folders` array.

The **branch** checked out inside the worktree is independent of the
directory name — I will give it to you. Do not derive the branch from the
workspace name or invent one.

Standard flow for starting work in a workspace:

1. Identify the workspace I'm using (basename of the open `.code-workspace`,
   or ask if unclear).
2. Wait for me to provide the branch name for this repo in this workspace.
3. From the repo's main checkout, create the worktree:
   `git worktree add ../<repo>.worktrees/<workspace> -b <branch>`
   (drop `-b` if the branch already exists on the remote).
4. Add the new worktree path to the workspace's `.code-workspace` `folders`
   array if it isn't there yet.

When the workspace's work is done: merge/close the branches, then
`git worktree remove <path>` for each repo and delete the local branches.
Do not leave stale worktrees around.

## Working with me

- Default to `gh` / `glab` for GitHub / GitLab CLI work.
- Treat the main checkout as the long-lived branch (usually `main`); never commit
  task work directly to it — always through a worktree.
- Before suggesting commands that touch repos, confirm which worktree we are
  in; paths under `<repo>.worktrees/<workspace>` are workspace-scoped work,
  the bare `<repo>` is main.
- **Before opening any MR/PR**, rebase the branch on the latest upstream
  default branch:

      git fetch origin
      git pull --rebase origin <default-branch>

  Do this in the worktree, just before `glab mr create` / `gh pr create`. This
  keeps history linear and avoids surprise conflicts after review starts.

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
