"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import type { UserResponse } from "@/lib/types/api";

const schema = z.object({
  is_active: z.boolean(),
  is_superuser: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserResponse | null;
  onSubmit: (userId: string, data: FormData) => void | Promise<void>;
  isLoading?: boolean;
}

export function EditUserDialog({
  open,
  onOpenChange,
  user,
  onSubmit,
  isLoading,
}: EditUserDialogProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { is_active: true, is_superuser: false },
  });

  useEffect(() => {
    if (user) {
      form.reset({ is_active: user.is_active, is_superuser: user.is_superuser });
    }
  }, [user, form]);

  const handleSubmit = async (data: FormData) => {
    if (!user) return;
    await onSubmit(user.id, data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update account status and privileges for{" "}
            <span className="font-mono font-semibold">{user?.username}</span>.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <Label htmlFor="is_active">Active</Label>
                      <p className="text-xs text-muted-foreground">
                        Inactive users cannot log in.
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        id="is_active"
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(checked)}
                        disabled={isLoading}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_superuser"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <Label htmlFor="is_superuser">Superuser</Label>
                      <p className="text-xs text-muted-foreground">
                        Grants full administrative access, bypassing all access checks.
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        id="is_superuser"
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(checked)}
                        disabled={isLoading}
                      />
                    </FormControl>
                  </div>
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
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
