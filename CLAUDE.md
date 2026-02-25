# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup       # First-time setup: install deps, generate Prisma client, run migrations
npm run dev         # Start dev server (Next.js with Turbopack) at http://localhost:3000
npm run build       # Production build
npm run lint        # ESLint
npm run test        # Run all Vitest tests
npm run db:reset    # Reset and re-migrate the SQLite database
```

Run a single test file:
```bash
npx vitest run src/lib/__tests__/file-system.test.ts
```

## Environment

Copy `.env` and set `ANTHROPIC_API_KEY`. Without it, the app runs using a mock provider that returns static placeholder components instead of calling Claude.

## Architecture

UIGen is an AI-powered React component generator. Users describe components in a chat, Claude generates code using tool calls that operate on an in-memory virtual file system, and the result is previewed in a sandboxed iframe.

### Core Data Flow

1. User submits prompt → `MessageInput` → Vercel AI `useChat` hook in `ChatInterface`
2. Request hits `/api/chat` → streams response from Claude via `@ai-sdk/anthropic`
3. Claude calls tools (`str_replace_editor`, `file_manager`) to create/modify files in the virtual FS
4. Tool calls update `VirtualFileSystem` in memory → UI re-renders preview iframe
5. On completion, if user is authenticated with a `projectId`, file system + messages are persisted to SQLite via Prisma

### Virtual File System (`src/lib/file-system.ts`)

The `VirtualFileSystem` class is central to the app. It's an in-memory Map-based tree — no disk I/O. It serializes to JSON for persistence in the `Project.data` database column. The AI always targets `/App.jsx` as the root entrypoint. Import paths use `@/` aliases (e.g., `@/components/Button`).

### State Management

Two React contexts wrap the entire app:
- **`FileSystemContext`** (`src/lib/contexts/file-system-context.tsx`): owns the `VirtualFileSystem` instance, selected file, and refresh triggers
- **`ChatContext`** (`src/lib/contexts/chat-context.tsx`): wraps Vercel AI `useChat`, handles tool call results, syncs file system mutations, and tracks anonymous work

### AI Tools (`src/lib/tools/`)

- `str_replace_editor`: View/create/replace content in virtual files (used for targeted edits)
- `file_manager`: Create/delete files and directories in bulk

The system prompt is in `src/lib/prompts/generation.tsx`. It constrains Claude to React + Tailwind CSS, requires `/App.jsx` as the entry point, and explains the virtual FS tool interface.

### Authentication (`src/lib/auth.ts`, `src/actions/index.ts`)

JWT-based sessions via the `jose` library, stored as HTTP-only cookies (7-day expiry). Server actions handle sign-up/sign-in/sign-out. Passwords are bcrypt-hashed. The middleware (`src/middleware.ts`) protects API routes at `/api/projects` and `/api/filesystem`.

Anonymous users can generate components without signing in; their work is tracked client-side only via `src/lib/anon-work-tracker.ts`. Project persistence requires authentication.

### Database (`prisma/schema.prisma`)

SQLite with two models:
- `User`: `id`, `email`, `password`
- `Project`: `id`, `name`, `userId` (nullable), `messages` (JSON string), `data` (JSON string)

`messages` and `data` are serialized JSON strings, not structured columns.

### Preview (`src/components/preview/PreviewFrame.tsx`)

The preview renders `App.jsx` from the virtual file system inside an iframe using `@babel/standalone` for JSX transformation in the browser.

### UI Layout

Three-panel layout via `react-resizable-panels`:
- Left (35%): Chat (MessageList + MessageInput)
- Right (65%): Tabs switching between Preview (iframe) and Code (FileTree + Monaco editor)

### Path Aliases

`@/*` resolves to `./src/*` (configured in `tsconfig.json` and Vitest).
