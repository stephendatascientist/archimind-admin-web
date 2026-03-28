"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GroupForm, type GroupFormData } from "./group-form";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: GroupFormData) => void | Promise<void>;
  isLoading?: boolean;
}

export function CreateGroupDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: CreateGroupDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Group</DialogTitle>
          <DialogDescription>
            Groups control access levels. Use{" "}
            <code className="text-xs font-mono bg-muted px-1 rounded">ADMIN</code> for full
            administrative privileges.
          </DialogDescription>
        </DialogHeader>

        <GroupForm
          onSubmit={onSubmit}
          isLoading={isLoading}
          submitLabel="Create Group"
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
