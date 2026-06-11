# Manage symlinks from $HOME into this dotfiles tree.
#
# Layout convention: each top-level entry "X" under dotfiles/ corresponds to
# "$HOME/.X". For files we create one symlink; for directories we recurse and
# symlink each file individually so existing state in ~/.X (caches, sessions,
# tokens) is preserved.
#
# Targets:
#   make install    Create symlinks
#   make uninstall  Remove symlinks (only those still pointing into this repo)
#   make list       Print what install would do, without changing anything

SHELL       := /bin/bash
.SHELLFLAGS := -eu -o pipefail -c

DOTFILES_DIR := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))
HOME_DIR     := $(HOME)

# mind/ vault location (override with MIND_DIR=... if cloned elsewhere)
MIND_DIR     ?= $(HOME)/Workspace/github.com/90dy/mind
# Claude Code project-memory path: $HOME with `/` → `-` (Claude convention)
PROJECT_PATH := $(shell echo "$(HOME)" | sed 's|/|-|g')

# Top-level meta files that are not dotfile sources
SKIP_RE := ^(Makefile|README|README\.md|\.git|\.gitignore|\.DS_Store)$$

.PHONY: help install uninstall list mind mind-list mind-uninstall
.DEFAULT_GOAL := help

help:
	@echo 'Manage symlinks between this dotfiles tree and $$HOME.'
	@echo ''
	@echo 'Targets:'
	@echo '  install         Symlink each dotfiles/<entry> as ~/.<name>'
	@echo '  uninstall       Remove only symlinks that still point back into this repo'
	@echo '  list            Show what install would do (dry-run)'
	@echo '  mind            Symlink the mind/ vault into ~/.claude/ (CLAUDE.md, memory, agents, skills, workflows)'
	@echo '  mind-list       Print the mind symlinks (dry-run)'
	@echo '  mind-uninstall  Remove only mind symlinks'

install uninstall list:
	@mode="$@"; \
	shopt -s nullglob; \
	for entry in $(DOTFILES_DIR)/*; do \
	  name=$$(basename "$$entry"); \
	  if [[ $$name =~ $(SKIP_RE) ]]; then continue; fi; \
	  src_root="$$entry"; \
	  dst_root="$(HOME_DIR)/.$$name"; \
	  srcs=(); dsts=(); \
	  if [ -f "$$src_root" ]; then \
	    srcs+=("$$src_root"); dsts+=("$$dst_root"); \
	  else \
	    while IFS= read -r -d '' f; do \
	      srcs+=("$$f"); dsts+=("$$dst_root/$${f#$$src_root/}"); \
	    done < <(find "$$src_root" -type f -print0); \
	  fi; \
	  for i in "$${!srcs[@]}"; do \
	    src="$${srcs[$$i]}"; dst="$${dsts[$$i]}"; \
	    case $$mode in \
	      install) \
	        if [ -L "$$dst" ] && [ "$$dst" -ef "$$src" ]; then \
	          printf '  ok    %s\n' "$$dst"; \
	        elif [ -e "$$dst" ] || [ -L "$$dst" ]; then \
	          printf '  skip  %s (exists, not our symlink)\n' "$$dst" >&2; \
	        else \
	          mkdir -p "$$(dirname "$$dst")"; \
	          ln -s "$$src" "$$dst"; \
	          printf '  link  %s -> %s\n' "$$dst" "$$src"; \
	        fi ;; \
	      uninstall) \
	        if [ -L "$$dst" ] && [ "$$dst" -ef "$$src" ]; then \
	          rm "$$dst"; \
	          printf '  rm    %s\n' "$$dst"; \
	        else \
	          printf '  skip  %s (not our symlink)\n' "$$dst" >&2; \
	        fi ;; \
	      list) \
	        printf '  %s -> %s\n' "$$dst" "$$src" ;; \
	    esac; \
	  done; \
	  if [ "$$mode" = uninstall ] && [ -d "$$dst_root" ]; then \
	    find "$$dst_root" -type d -empty -delete 2>/dev/null || true; \
	  fi; \
	done

# ─── mind/ vault symlinks ────────────────────────────────────────────────
# Layout:
#   ~/.claude/CLAUDE.md                                          → mind/tools/claude/CLAUDE.md
#   ~/.claude/projects/<PROJECT_PATH>/memory                     → mind/tools/claude/memory
#   ~/.claude/{agents,skills,workflows}/  (real dirs)
#     root                                                       → mind/{agents,skills,workflows}     (agnostic fleet)
#     <ctx>                                                      → mind/contexts/<ctx>/{agents,…}     (per-context, discovered)
#
# Override MIND_DIR=... if cloned elsewhere.

mind mind-list mind-uninstall:
	@mode="$@"; \
	if [ ! -d "$(MIND_DIR)" ]; then \
	  echo "mind/ not found at $(MIND_DIR); set MIND_DIR=... or clone first" >&2; \
	  exit 1; \
	fi; \
	apply() { \
	  local dst="$$1" src="$$2"; \
	  case $$mode in \
	    mind) \
	      if [ -L "$$dst" ] && [ "$$(readlink "$$dst")" = "$$src" ]; then \
	        printf '  ok    %s\n' "$$dst"; \
	      elif [ -e "$$dst" ] && [ ! -L "$$dst" ]; then \
	        printf '  skip  %s (exists, not a symlink)\n' "$$dst" >&2; \
	      else \
	        mkdir -p "$$(dirname "$$dst")"; \
	        ln -sfn "$$src" "$$dst"; \
	        printf '  link  %s -> %s\n' "$$dst" "$$src"; \
	      fi ;; \
	    mind-uninstall) \
	      if [ -L "$$dst" ] && [ "$$(readlink "$$dst")" = "$$src" ]; then \
	        rm "$$dst"; printf '  rm    %s\n' "$$dst"; \
	      else \
	        printf '  skip  %s (not our symlink)\n' "$$dst" >&2; \
	      fi ;; \
	    mind-list) printf '  %s -> %s\n' "$$dst" "$$src" ;; \
	  esac; \
	}; \
	apply "$(HOME_DIR)/.claude/CLAUDE.md"                                "$(MIND_DIR)/tools/claude/CLAUDE.md"; \
	apply "$(HOME_DIR)/.claude/projects/$(PROJECT_PATH)/memory"          "$(MIND_DIR)/tools/claude/memory"; \
	shopt -s nullglob; \
	for f in "$(MIND_DIR)/tools/claude/commands"/*.md; do \
	  apply "$(HOME_DIR)/.claude/commands/$$(basename "$$f")"             "$$f"; \
	done; \
	for d in "$(MIND_DIR)/agents"/; do : ; done; \
	apply "$(HOME_DIR)/.claude/agents/root"                              "$(MIND_DIR)/agents"; \
	for ctx in "$(MIND_DIR)/contexts"/*/; do \
	  name=$$(basename "$$ctx"); \
	  [ -d "$$ctx""agents" ] && apply "$(HOME_DIR)/.claude/agents/$$name" "$$ctx""agents"; \
	done; \
	for d in "$(MIND_DIR)/skills"/*/; do \
	  apply "$(HOME_DIR)/.claude/skills/$$(basename "$$d")"               "$$d"; \
	done; \
	for ctx in "$(MIND_DIR)/contexts"/*/; do \
	  name=$$(basename "$$ctx"); \
	  for d in "$$ctx""skills"/*/; do \
	    [ -d "$$d" ] || continue; \
	    apply "$(HOME_DIR)/.claude/skills/$$name-$$(basename "$$d")"      "$$d"; \
	  done; \
	done; \
	for f in "$(MIND_DIR)/workflows"/*.js; do \
	  apply "$(HOME_DIR)/.claude/workflows/$$(basename "$$f")"            "$$f"; \
	done; \
	for ctx in "$(MIND_DIR)/contexts"/*/; do \
	  name=$$(basename "$$ctx"); \
	  for f in "$$ctx""workflows"/*.js; do \
	    [ -f "$$f" ] || continue; \
	    apply "$(HOME_DIR)/.claude/workflows/$$name-$$(basename "$$f" .js).js" "$$f"; \
	  done; \
	done; \
	shopt -u nullglob; \
	if [ "$$mode" = mind-uninstall ]; then \
	  for kind in agents skills workflows commands; do \
	    rmdir "$(HOME_DIR)/.claude/$$kind" 2>/dev/null || true; \
	  done; \
	fi
