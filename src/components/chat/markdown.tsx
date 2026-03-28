"use client";

import { useMemo } from "react";
import MarkdownIt from "markdown-it";
import { cn } from "@/lib/utils";

const md = new MarkdownIt({
    html: false,
    linkify: true,
    typographer: true,
});

interface MarkdownProps {
    content: string;
    className?: string;
}

export function Markdown({ content, className }: MarkdownProps) {
    const html = useMemo(() => md.render(content), [content]);
    return (
        <div
            className={cn("tiptap ProseMirror prose-sm max-w-none", className)}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
