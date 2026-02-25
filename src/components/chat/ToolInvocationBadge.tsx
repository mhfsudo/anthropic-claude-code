"use client";

import { Loader2 } from "lucide-react";

interface ToolInvocationArgs {
  command?: string;
  path?: string;
  new_path?: string;
  [key: string]: unknown;
}

interface ToolInvocationData {
  toolCallId: string;
  toolName: string;
  args: ToolInvocationArgs;
  state: string;
  result?: unknown;
}

interface ToolInvocationBadgeProps {
  toolInvocation: ToolInvocationData;
}

function getToolLabel(toolInvocation: ToolInvocationData): string {
  const { toolName, args } = toolInvocation;
  const { command, path, new_path } = args ?? {};

  if (toolName === "str_replace_editor") {
    switch (command) {
      case "create":     return `Creating ${path ?? "file"}`;
      case "str_replace":
      case "insert":     return `Editing ${path ?? "file"}`;
      case "view":       return `Viewing ${path ?? "file"}`;
      case "undo_edit":  return `Undoing edit in ${path ?? "file"}`;
      default:           return command ? `${command} ${path ?? ""}`.trim() : toolName;
    }
  }

  if (toolName === "file_manager") {
    switch (command) {
      case "delete": return `Deleting ${path ?? "file"}`;
      case "rename": return new_path
        ? `Renaming ${path ?? "file"} \u2192 ${new_path}`
        : `Renaming ${path ?? "file"}`;
      default:       return command ? `${command} ${path ?? ""}`.trim() : toolName;
    }
  }

  return toolName;
}

export function ToolInvocationBadge({ toolInvocation }: ToolInvocationBadgeProps) {
  const isComplete = toolInvocation.state === "result" && toolInvocation.result != null;
  const label = getToolLabel(toolInvocation);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isComplete ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-neutral-700">{label}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{label}</span>
        </>
      )}
    </div>
  );
}
