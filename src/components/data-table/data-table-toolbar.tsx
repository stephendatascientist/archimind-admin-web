"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { useEffect, useState } from "react";

interface DataTableToolbarProps {
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  actions?: React.ReactNode;
  filters?: React.ReactNode;
  viewToggle?: React.ReactNode;
}

export function DataTableToolbar({
  onSearchChange,
  searchPlaceholder = "Search…",
  actions,
  filters,
  viewToggle,
}: DataTableToolbarProps) {
  const [input, setInput] = useState("");
  const debounced = useDebounce(input);

  useEffect(() => {
    onSearchChange?.(debounced);
  }, [debounced, onSearchChange]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {onSearchChange && (
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="pl-8 pr-8 h-9"
          />
          {input && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-2"
              onClick={() => setInput("")}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      )}
      {filters}
      <div className="ml-auto flex items-center gap-2">
        {viewToggle}
        {actions}
      </div>
    </div>
  );
}
