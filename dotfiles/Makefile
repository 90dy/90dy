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

# Top-level meta files that are not dotfile sources
SKIP_RE := ^(Makefile|README|README\.md|\.git|\.gitignore|\.DS_Store)$$

.PHONY: help install uninstall list
.DEFAULT_GOAL := help

help:
	@echo 'Manage symlinks between this dotfiles tree and $$HOME.'
	@echo ''
	@echo 'Targets:'
	@echo '  install    Symlink each entry as ~/.<name>  (claude/CLAUDE.md -> ~/.claude/CLAUDE.md)'
	@echo '  uninstall  Remove only symlinks that still point back into this repo'
	@echo '  list       Show what install would do (dry-run)'

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
