SHELL := /bin/bash
NVM := export NVM_DIR="$$HOME/.nvm"; [ -s "$$NVM_DIR/nvm.sh" ] && \. "$$NVM_DIR/nvm.sh"; nvm use

.PHONY: all install dev build test test-watch test-coverage lint deploy clean

all: build

install:
	@$(NVM) && npm install

dev:
	@$(NVM) && npm run dev

build:
	@$(NVM) && npm run build

test:
	@$(NVM) && npm run test

test-watch:
	@$(NVM) && npm run test:watch

test-coverage:
	@$(NVM) && npm run test:coverage

lint:
	@$(NVM) && npx tsc --noEmit

deploy: build
	@echo "Deploying nostr-event-dom..."
	@echo "Build output is ready in ./dist directory."

clean:
	@rm -rf dist node_modules
