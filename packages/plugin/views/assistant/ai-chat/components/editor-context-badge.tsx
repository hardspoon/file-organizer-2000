import React from "react";
import { EditorSelectionContext } from "../use-editor-selection";
import { StyledContainer } from "@/components/ui/utils";
import { tw } from "@/lib/utils";

interface EditorContextBadgeProps {
  context: EditorSelectionContext;
  onClear?: () => void;
}

/**
 * Visual indicator showing what editor context the AI has access to.
 * Helps users understand what "this" refers to in their messages.
 */
export function EditorContextBadge({
  context,
  onClear,
}: EditorContextBadgeProps) {
  // Don't show if no context
  if (!context.hasSelection && !context.currentLine) {
    return null;
  }

  const truncate = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  return (
    <StyledContainer>
      <div
        className={tw(
          "flex items-center gap-2 px-3 py-1.5 text-xs bg-[--background-secondary] border border-[--background-modifier-border] text-[--text-muted]"
        )}
      >
        <span className="font-medium">📝 Selection:</span>
        {context.hasSelection ? (
          <span className="text-[--text-normal]">
            "{truncate(context.selectedText)}"
          </span>
        ) : (
          <span className="text-[--text-normal]">
            Line {context.lineNumber + 1}: "{truncate(context.currentLine)}"
          </span>
        )}
        {onClear && (
          <div
            onClick={onClear}
            className={tw(
              "ml-auto text-[--text-muted] hover:text-[--text-normal] cursor-pointer"
            )}
            title="Clear selection context"
            aria-label="Clear selection context"
          >
            ×
          </div>
        )}
      </div>
    </StyledContainer>
  );
}
