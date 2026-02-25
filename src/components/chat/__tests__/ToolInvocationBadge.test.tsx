import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";

afterEach(() => {
  cleanup();
});

// str_replace_editor commands

test("str_replace_editor create command shows Creating label", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/App.jsx" },
        state: "partial-call",
      }}
    />
  );
  expect(screen.getByText("Creating /App.jsx")).toBeDefined();
});

test("str_replace_editor str_replace command shows Editing label", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: { command: "str_replace", path: "/components/Button.tsx" },
        state: "partial-call",
      }}
    />
  );
  expect(screen.getByText("Editing /components/Button.tsx")).toBeDefined();
});

test("str_replace_editor insert command shows Editing label", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: { command: "insert", path: "/App.jsx" },
        state: "partial-call",
      }}
    />
  );
  expect(screen.getByText("Editing /App.jsx")).toBeDefined();
});

test("str_replace_editor view command shows Viewing label", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: { command: "view", path: "/App.jsx" },
        state: "partial-call",
      }}
    />
  );
  expect(screen.getByText("Viewing /App.jsx")).toBeDefined();
});

test("str_replace_editor undo_edit command shows Undoing edit label", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: { command: "undo_edit", path: "/App.jsx" },
        state: "partial-call",
      }}
    />
  );
  expect(screen.getByText("Undoing edit in /App.jsx")).toBeDefined();
});

// file_manager commands

test("file_manager delete command shows Deleting label", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "file_manager",
        args: { command: "delete", path: "/old.jsx" },
        state: "partial-call",
      }}
    />
  );
  expect(screen.getByText("Deleting /old.jsx")).toBeDefined();
});

test("file_manager rename command with new_path shows arrow label", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "file_manager",
        args: { command: "rename", path: "/old.jsx", new_path: "/new.jsx" },
        state: "partial-call",
      }}
    />
  );
  expect(screen.getByText("Renaming /old.jsx → /new.jsx")).toBeDefined();
});

test("file_manager rename command without new_path omits arrow", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "file_manager",
        args: { command: "rename", path: "/old.jsx" },
        state: "partial-call",
      }}
    />
  );
  expect(screen.getByText("Renaming /old.jsx")).toBeDefined();
});

// State-based rendering

test("state result with non-null result renders green dot", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/App.jsx" },
        state: "result",
        result: "Success",
      }}
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("state partial-call renders spinner", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/App.jsx" },
        state: "partial-call",
      }}
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("state result with null result renders spinner", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/App.jsx" },
        state: "result",
        result: null,
      }}
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

// Missing path fallback

test("missing path falls back to 'file' in label", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: { command: "create" },
        state: "partial-call",
      }}
    />
  );
  expect(screen.getByText("Creating file")).toBeDefined();
});

// Unknown tool and command fallbacks

test("unknown tool name shows raw toolName", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "some_unknown_tool",
        args: {},
        state: "partial-call",
      }}
    />
  );
  expect(screen.getByText("some_unknown_tool")).toBeDefined();
});

test("unknown command within known tool shows command and path", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: { command: "list", path: "/src" },
        state: "partial-call",
      }}
    />
  );
  expect(screen.getByText("list /src")).toBeDefined();
});
