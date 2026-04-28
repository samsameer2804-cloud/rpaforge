# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RPAForge is an open-source RPA (Robotic Process Automation) studio providing a visual process designer, recorder, debugger, and automation libraries. It combines a Python execution engine with an Electron + React desktop IDE.

## Commands

### Python

```bash
make install          # Install packages/core and packages/libraries in editable mode
make dev              # Install dev deps + pre-commit hooks + studio npm deps
make test             # Run all tests (pytest packages/ -v --tb=short)
make test-cov         # Run tests with HTML + terminal coverage report
make lint             # ruff check + mypy on both Python packages
make format           # ruff format + isort on packages/
make build            # Build distributable packages (core + libraries)
```

Run a single test file:
```bash
pytest packages/core/tests/test_engine.py -v
```

### Studio (Electron + React)

```bash
make studio-install   # npm install in packages/studio
make studio-dev       # npm run dev (Vite dev server)
make studio-build     # npm run build (Vite + electron-builder)
make studio-test      # npm test (Vitest)
```

Run a single UI test:
```bash
cd packages/studio && npx vitest run src/path/to/test.spec.ts
```

Lint/format Studio:
```bash
cd packages/studio && npm run lint
cd packages/studio && npm run lint:fix
```

## Architecture

This is a monorepo with four packages:

### `packages/core` (Python)
The execution engine. Entry point is `StudioEngine` in `src/rpaforge/`. Key sub-packages:
- `engine/` — `executor.py` runs Robot Framework suites; `suite_builder.py` / `diagram_converter.py` convert visual diagrams to executable format; `safe_evaluator.py` evaluates breakpoint conditions via AST (no `eval()`)
- `debugger/` — debug session management and event emission
- `bridge/` — WebSocket IPC server (`server.py`) that Electron connects to; `protocol.py` defines the message contract; all handlers validate incoming payloads before processing
- `recorder/` — action recording subsystem
- `utils/` — shared utilities

Activities run in isolated subprocesses (see `subprocess_executor.py`) to allow clean timeout handling without resource leaks.

### `packages/libraries` (Python)
Fourteen self-contained RPA libraries (Robot Framework keyword libraries): `DesktopUI` (pywinauto), `WebUI` (Playwright), `OCR`, `Excel`, `Database` (SQLAlchemy), `Credentials` (encrypted), `DateTime`, `File`, `Flow`, `HTTP`, `String`, `Variables`. Each library inherits from the RF library system and declares its keywords with `@keyword`.

### `packages/studio` (TypeScript / Electron + React)
Desktop IDE. Electron main process lives in `electron/`; renderer is in `src/`:
- `components/` — Designer, Debugger, Recorder, Common UI components
- `stores/` — Zustand global state slices
- `hooks/` — custom React hooks
- `bridge/` — IPC client that talks to the Python WebSocket server
- `domain/` — domain model types
- Path alias: `@/*` → `src/*`

Security: production builds enforce a strict Content Security Policy; all IPC handlers validate payloads with JSON Schema; file operations validate paths against traversal.

### `packages/orchestrator` (planned)
Control Tower backend — not yet implemented.

## Code Style

### Python
- Formatter: `ruff format` (88-char line length, Black-compatible)
- Imports: `isort` with `multi_line_output=5` (hanging grid grouped); always start files with `from __future__ import annotations`
- Import order: `__future__` → stdlib → third-party → first-party (`rpaforge`, `rpaforge_libraries`)
- Type hints required on all public APIs; `mypy` strict mode is enabled
- Docstrings: PEP-257, required for public APIs

### TypeScript / React
- Strict TypeScript mode; no unused locals or parameters
- Functional components with hooks; Zustand for global state; TailwindCSS for styling
- Naming: `PascalCase` for components/types, `camelCase` for functions/variables, `PascalCase` for React component files, `snake_case` for Python files

## Important Rules

- **Never commit unless explicitly asked.** Run `ruff format packages/` before any Python changes land. Run `pytest packages/` and `cd packages/studio && npm test -- --run` to verify changes.
- Python 3.10+ required; CI tests against 3.10, 3.11, 3.12, 3.13.
- Node.js 20+ and npm 9+ required for Studio work.
- Maintain backward compatibility; avoid breaking public APIs.
