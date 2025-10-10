.PHONY: help dev test watch-tests docker-up parallel-dev work-status new-feature

# Default target
help:
	@echo "╔════════════════════════════════════════════════════╗"
	@echo "║     AutoCrate Development Tasks                    ║"
	@echo "╚════════════════════════════════════════════════════╝"
	@echo ""
	@echo "Development:"
	@echo "  make dev              Start Next.js development server"
	@echo "  make docker-up        Start Docker containers"
	@echo "  make parallel-dev     Run dev + tests + docker in parallel"
	@echo ""
	@echo "Testing:"
	@echo "  make test             Run all tests once"
	@echo "  make watch-tests      Run tests in watch mode"
	@echo "  make test-e2e         Run Playwright E2E tests"
	@echo "  make test-all         Run complete test suite"
	@echo ""
	@echo "Code Quality:"
	@echo "  make lint             Run ESLint"
	@echo "  make type-check       Run TypeScript type checking"
	@echo "  make format           Format code with Prettier"
	@echo ""
	@echo "Workflow:"
	@echo "  make work-status      Show current work status"
	@echo "  make new-feature NAME=<name>  Create new feature branch"
	@echo "  make tmux             Start tmux development environment"
	@echo ""
	@echo "Build:"
	@echo "  make build            Production build"
	@echo "  make clean            Clean build artifacts"
	@echo ""

# Development
dev:
	npm run dev

docker-up:
	cd ../container && docker compose up

# Run multiple tasks in parallel
parallel-dev:
	@echo "Starting parallel development environment..."
	@echo "  • Next.js dev server"
	@echo "  • Test watcher"
	@echo "  • Docker containers"
	@echo ""
	@$(MAKE) -j3 dev watch-tests docker-up

# Testing
test:
	npm test

watch-tests:
	npm run test:watch

test-e2e:
	npm run test:e2e

test-all:
	npm run test:all

# Code quality
lint:
	npm run lint

type-check:
	npm run type-check

format:
	npx prettier --write "**/*.{json,md,yml,yaml}"

# Build
build:
	npm run build

clean:
	rm -rf .next
	rm -rf node_modules/.cache
	rm -rf coverage

# Workflow helpers
work-status:
	@bash scripts/parallel-work.sh

new-feature:
ifndef NAME
	@echo "Error: NAME required. Usage: make new-feature NAME=my-feature"
	@exit 1
endif
	@echo "Creating feature branch: feature/$(NAME)"
	@git checkout -b feature/$(NAME)
	@echo ""
	@echo "✓ Branch created: feature/$(NAME)"
	@echo ""
	@echo "Next steps:"
	@echo "  1. Add work to PROJECT_STATUS.md (Active Work section)"
	@echo "  2. Start development: make dev"
	@echo "  3. Run tests: make watch-tests"
	@echo ""

# Tmux environment
tmux:
	@bash scripts/tmux-autocrate.sh

# Install dependencies
install:
	npm install

# Version management
version-patch:
	npm run version:patch
	npm run version:sync

version-minor:
	npm run version:minor
	npm run version:sync

version-major:
	npm run version:major
	npm run version:sync
