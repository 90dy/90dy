# Entrypoint

This is the always-loaded entrypoint. The actual content — working rules, knowledge, and
memory — lives in the **`mind`** repo (`github.com/90dy/mind`, a private git-backed Obsidian
vault). This file just wires it in and points you at it.

## Always-on working rules (imported)

@~/Workspace/github.com/90dy/mind/shared/working-conventions.md

The line above `@import`s Godefroy's working conventions; Claude Code expands it into context at
launch, so those rules are always active. (First time you load this with the external import,
Claude Code asks once to approve external imports — accept it.)

## Knowledge base — read on demand

`mind` is your persistent documentation and memory. Use it:

- **Reference / navigation** (`mind/shared/contexts/<domain>/`) — how to access and navigate tools,
  repos, and infra (IDs, layouts, shortcuts). Start at `mind/shared/contexts/shadow/README.md` for
  Shadow. **Read the relevant note before navigating a tool, and append whatever you newly learn.**
  This is reference knowledge, *not* a log of work done.
- **Who I am** — `mind/shared/user.md`.
- **Recalled memory** — `mind/claude/memory/` is the symlink target for this machine's Claude Code
  memory dir, so `MEMORY.md` and relevant notes are surfaced automatically; they're versioned and
  Obsidian-browsable here too.

Full map: `mind/README.md`. Local path: `~/Workspace/github.com/90dy/mind`.

## This file is versioned

This CLAUDE.md is a symlink to
`~/Workspace/github.com/90dy/90dy/dotfiles/claude/CLAUDE.md`, tracked in the **public** repo
`github.com/90dy/90dy` under `dotfiles/`. Keep it a thin entrypoint — secrets and infra detail
belong in the private `mind` repo, never here.

The `dotfiles/` tree mirrors `$HOME` with the leading dots stripped: each top-level entry
`dotfiles/<name>` corresponds to `~/.<name>`. A `Makefile` inside `dotfiles/` manages the symlinks:

    cd ~/Workspace/github.com/90dy/90dy/dotfiles
    make install    # create symlinks (file-level, parents preserved)
    make uninstall  # remove only symlinks pointing back into this repo
    make list       # dry-run

**Whenever you (Claude) edit this file**, finish by committing and pushing from the 90dy repo:

    cd ~/Workspace/github.com/90dy/90dy
    git add dotfiles/claude/CLAUDE.md
    git commit -m "<one-line description>"
    git push

Edits to **content** (rules, knowledge, memory) instead go in the `mind` repo — commit and push
there. Do either in the same turn as the edit; don't leave a working tree dirty.
