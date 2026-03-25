"use client";

import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CredentialSchemaField } from "@/lib/types/api";

interface DynamicCredentialsFormProps {
  schema: CredentialSchemaField[];
  /** Called whenever any field changes; receives the new JSON string (or "" to clear). */
  onChange: (credJson: string) => void;
  /** Whether the instance already has encrypted credentials stored. */
  hasExisting?: boolean;
}

function PasswordInput({
  value,
  onChange,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  id: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="new-password"
        className="pr-10"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Hide" : "Show"}
      >
        {show ? (
          <EyeOff className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Eye className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
}

export function DynamicCredentialsForm({
  schema,
  onChange,
  hasExisting,
}: DynamicCredentialsFormProps) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(schema.map((f) => [f.key, f.default ?? ""]))
  );

  // When the schema changes (user picks a different app) reset all fields.
  const prevSchemaRef = useRef(schema);
  useEffect(() => {
    if (prevSchemaRef.current === schema) return;
    prevSchemaRef.current = schema;
    const initial = Object.fromEntries(schema.map((f) => [f.key, f.default ?? ""]));
    setValues(initial);
    notifyParent(initial);
  });

  function notifyParent(vals: Record<string, string>) {
    const compact = Object.fromEntries(Object.entries(vals).filter(([, v]) => v !== ""));
    onChange(Object.keys(compact).length > 0 ? JSON.stringify(compact) : "");
  }

  function update(key: string, val: string) {
    const next = { ...values, [key]: val };
    setValues(next);
    notifyParent(next);
  }

  return (
    <div className="space-y-3 rounded-md border p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Shield className="h-4 w-4 text-muted-foreground" />
        Credentials
        {hasExisting && (
          <span className="ml-auto text-xs font-normal text-amber-600">
            Existing credentials stored — fill fields to replace
          </span>
        )}
      </div>

      {schema.map((field) => (
        <div key={field.key} className="space-y-1">
          <Label htmlFor={`cred-${field.key}`}>
            {field.label}
            {field.required && <span className="ml-0.5 text-destructive">*</span>}
          </Label>

          {field.type === "select" ? (
            <Select
              value={values[field.key] ?? ""}
              onValueChange={(val) => update(field.key, val as string)}
            >
              <SelectTrigger id={`cred-${field.key}`}>
                <SelectValue placeholder={`Select ${field.label}…`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : field.type === "password" ? (
            <PasswordInput
              id={`cred-${field.key}`}
              value={values[field.key] ?? ""}
              onChange={(val) => update(field.key, val)}
            />
          ) : (
            <Input
              id={`cred-${field.key}`}
              type={field.type === "number" ? "number" : "text"}
              value={values[field.key] ?? ""}
              onChange={(e) => update(field.key, e.target.value)}
              autoComplete="off"
            />
          )}
        </div>
      ))}
    </div>
  );
}
