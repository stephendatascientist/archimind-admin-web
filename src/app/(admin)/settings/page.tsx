"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser, useUpdateInstructions } from "@/lib/queries/auth";

const schema = z.object({
  instructions: z.string(),
});

type FormData = z.infer<typeof schema>;

function UserInstructionsForm() {
  const { data: user, isLoading } = useCurrentUser();
  const updateInstructions = useUpdateInstructions();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { instructions: "" },
  });

  useEffect(() => {
    if (user) {
      form.reset({ instructions: user.instructions ?? user.global_instructions ?? "" });
    }
  }, [user, form]);

  async function onSubmit(data: FormData) {
    try {
      await updateInstructions.mutateAsync({ instructions: data.instructions });
      toast.success("Instructions saved.");
    } catch {
      toast.error("Failed to save instructions. Please try again.");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-9 w-24" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="instructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Personal Instructions</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g. Always reply in Portuguese. Prefer PostgreSQL syntax for queries."
                  rows={6}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                These instructions are sent to the agent with every chat message so it can tailor
                its behaviour to your preferences.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={updateInstructions.isPending} className="gap-2">
          {updateInstructions.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Instructions
        </Button>
      </form>
    </Form>
  );
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your personal preferences.</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>User Instructions</CardTitle>
          <CardDescription>
            Tell the AI how you want it to behave. These are applied globally across all chats.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserInstructionsForm />
        </CardContent>
      </Card>
    </div>
  );
}

