# Entrypoint

Thin always-loaded entrypoint. The actual content — rules, knowledge, memory, skills — lives in the **`mind`** repo (`github.com/90dy/mind`, a private git-backed Obsidian vault). This file just wires it in.

## Always-on imports

@~/Workspace/github.com/90dy/mind/README.md
@~/Workspace/github.com/90dy/mind/shared/user.md
@~/Workspace/github.com/90dy/mind/shared/conventions/README.md
@~/Workspace/github.com/90dy/mind/shared/conventions/workspace.md
@~/Workspace/github.com/90dy/mind/shared/conventions/worktrees.md
@~/Workspace/github.com/90dy/mind/shared/conventions/communication.md
@~/Workspace/github.com/90dy/mind/shared/conventions/planning.md
@~/Workspace/github.com/90dy/mind/shared/conventions/search.md
@~/Workspace/github.com/90dy/mind/shared/conventions/mind-maintenance.md

First: the **navigation map** (`mind/README.md`).
Then: **who I am** (`shared/user.md`).
Then: the **working rules** — `conventions/README.md` for the TOC + each module listed directly. The README's own nested `@import` lines don't get expanded by the harness, so each module is imported explicitly above. When new convention modules land in `shared/conventions/`, add a matching `@import` line here.

First time Claude loads this file with the external imports, it asks once to approve — accept.

## This file is versioned

This CLAUDE.md is a symlink to `~/Workspace/github.com/90dy/90dy/dotfiles/claude/CLAUDE.md`, tracked in the **public** repo `github.com/90dy/90dy` under `dotfiles/`. Keep it a thin entrypoint — secrets and infra detail belong in the private `mind` repo, never here.

The `dotfiles/` tree mirrors `$HOME` with leading dots stripped: `dotfiles/<name>` ↔ `~/.<name>`. A `Makefile` inside `dotfiles/` manages the symlinks:

    cd ~/Workspace/github.com/90dy/90dy/dotfiles
    make install    # create symlinks (file-level, parents preserved)
    make uninstall  # remove only symlinks pointing back into this repo
    make list       # dry-run

**Whenever you (Claude) edit this file**, finish by committing and pushing from the 90dy repo:

    cd ~/Workspace/github.com/90dy/90dy
    git add dotfiles/claude/CLAUDE.md
    git commit -m "<one-line description>"
    git push

Edits to **content** (rules, knowledge, memory, skills) go in the `mind` repo — commit and push there. Do either in the same turn as the edit; don't leave a working tree dirty.
