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

## Worktrees (one per task)

Parallel tasks on the same repo use `git worktree`, not branch switching. Worktrees
live as a sibling to the repo directory:

    ~/workspace/<host>/<org>/<repo>.worktrees/<task-branch>

The `<task-branch>` segment is the branch name I will give you for the task.
Use that name verbatim for both the branch and the worktree directory; slashes
in the branch name are preserved as nested directories on disk.

Standard flow for starting a task:

1. Wait for me to provide the branch name — do not invent one.
2. From the repo's main checkout, create the worktree:
   `git worktree add ../<repo>.worktrees/<branch> -b <branch>`
   (or without `-b` if the branch already exists on the remote).
3. Add the new worktree path to the relevant `<org>.workspaces/*.code-workspace`
   file's `folders` array if the task warrants it.

When finishing a task: merge/close, then `git worktree remove <path>` and delete the
branch — do not leave stale worktrees around.

## Working with me

- Default to `gh` / `glab` for GitHub / GitLab CLI work.
- Treat the main checkout as the long-lived branch (usually `main`); never commit
  task work directly to it — always through a worktree.
- Before suggesting commands that touch repos, confirm which worktree we are in;
  paths under `<repo>.worktrees/<branch>` are the task, the bare `<repo>` is main.

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
