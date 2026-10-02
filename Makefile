PLUGIN_ID := paste-to-callout
OBSIDIAN_PLUGINS_DIR ?=
OBSIDIAN_PLUGIN_DIR = $(OBSIDIAN_PLUGINS_DIR)/$(PLUGIN_ID)

-include Makefile.local

.PHONY: deps dev build test lint install

deps:
	npm install

dev:
	npm run dev

build:
	npm run build

test:
	npm test

lint:
	npm run lint

install: build
	@if [ -z "$(OBSIDIAN_PLUGINS_DIR)" ]; then \
		echo "OBSIDIAN_PLUGINS_DIR is not set. Pass it to make or define it in Makefile.local."; \
		exit 1; \
	fi
	mkdir -p "$(OBSIDIAN_PLUGIN_DIR)"
	cp main.js manifest.json styles.css "$(OBSIDIAN_PLUGIN_DIR)/"
