import React from "react";
import { Button } from "@/components/ui/button";

type ImportActionsProps = {
  loading?: boolean;
  onStart?: () => void;
  onUndo?: () => void;
  onCancel?: () => void;
  children?: React.ReactNode;
};

export function ImportActions({ loading, onStart, onUndo, onCancel, children }: ImportActionsProps) {
  return (
    <div className="flex gap-2 mt-4">
      <Button type="button" onClick={onStart} disabled={loading}>
        {loading ? "Importing..." : "Start Import"}
      </Button>
      <Button type="button" variant="outline" onClick={onUndo}>
        Undo
      </Button>
      <Button type="button" variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
      {children}
    </div>
  );
} 