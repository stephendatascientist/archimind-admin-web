"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { GroupResponse } from "@/lib/types/api";

const schema = z.object({
  userId: z.string().uuid("Must be a valid user UUID"),
});

type FormData = z.infer<typeof schema>;

interface AssignGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: GroupResponse | null;
  onSubmit: (userId: string, group: GroupResponse) => void | Promise<void>;
  isLoading?: boolean;
}

export function AssignGroupDialog({
  open,
  onOpenChange,
  group,
  onSubmit,
  isLoading,
}: AssignGroupDialogProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { userId: "" },
  });

  const handleSubmit = async ({ userId }: FormData) => {
    if (!group) return;
    await onSubmit(userId, group);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign User to Group</DialogTitle>
          <DialogDescription>
            Assign a user to{" "}
            <code className="text-xs font-mono bg-muted px-1 rounded">{group?.name}</code>. The
            user will gain the permissions associated with this group.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User ID *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      className="font-mono text-xs"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Paste the user&apos;s UUID. You can find it on the Users page.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Assign
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
