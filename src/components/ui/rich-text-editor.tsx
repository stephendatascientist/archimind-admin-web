"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Code,
  Quote,
  Undo,
  Redo,
  Minus,
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";

export interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function RichTextEditor({
  value = "",
  onChange,
  placeholder,
  className,
  disabled = false,
}: RichTextEditorProps) {
  const handleUpdate = useCallback(
    ({ editor }: { editor: Editor }) => {
      const html = editor.isEmpty ? "" : editor.getHTML();
      onChange?.(html);
    },
    [onChange]
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "Start typing…",
        emptyEditorClass: "is-empty",
      }),
    ],
    content: value || "",
    editable: !disabled,
    onUpdate: handleUpdate,
    immediatelyRender: false,
  });

  // Sync value when it changes externally (e.g. form reset)
  useEffect(() => {
    if (!editor) return;
    const current = editor.isEmpty ? "" : editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  // Sync editable state
  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  return (
    <div
      className={cn(
        "rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-input px-1 py-1">
        <Toggle
          size="sm"
          pressed={editor?.isActive("bold") ?? false}
          onPressedChange={() => editor?.chain().focus().toggleBold().run()}
          disabled={disabled}
          aria-label="Bold"
        >
          <Bold className="h-3.5 w-3.5" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor?.isActive("italic") ?? false}
          onPressedChange={() => editor?.chain().focus().toggleItalic().run()}
          disabled={disabled}
          aria-label="Italic"
        >
          <Italic className="h-3.5 w-3.5" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor?.isActive("code") ?? false}
          onPressedChange={() => editor?.chain().focus().toggleCode().run()}
          disabled={disabled}
          aria-label="Inline code"
        >
          <Code className="h-3.5 w-3.5" />
        </Toggle>

        <Separator orientation="vertical" className="mx-0.5 h-5" />

        <Toggle
          size="sm"
          pressed={editor?.isActive("heading", { level: 2 }) ?? false}
          onPressedChange={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          disabled={disabled}
          aria-label="Heading 2"
        >
          <Heading2 className="h-3.5 w-3.5" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor?.isActive("heading", { level: 3 }) ?? false}
          onPressedChange={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          disabled={disabled}
          aria-label="Heading 3"
        >
          <Heading3 className="h-3.5 w-3.5" />
        </Toggle>

        <Separator orientation="vertical" className="mx-0.5 h-5" />

        <Toggle
          size="sm"
          pressed={editor?.isActive("bulletList") ?? false}
          onPressedChange={() => editor?.chain().focus().toggleBulletList().run()}
          disabled={disabled}
          aria-label="Bullet list"
        >
          <List className="h-3.5 w-3.5" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor?.isActive("orderedList") ?? false}
          onPressedChange={() => editor?.chain().focus().toggleOrderedList().run()}
          disabled={disabled}
          aria-label="Ordered list"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor?.isActive("blockquote") ?? false}
          onPressedChange={() => editor?.chain().focus().toggleBlockquote().run()}
          disabled={disabled}
          aria-label="Blockquote"
        >
          <Quote className="h-3.5 w-3.5" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={false}
          onPressedChange={() => editor?.chain().focus().setHorizontalRule().run()}
          disabled={disabled}
          aria-label="Horizontal rule"
        >
          <Minus className="h-3.5 w-3.5" />
        </Toggle>

        <Separator orientation="vertical" className="mx-0.5 h-5" />

        <Toggle
          size="sm"
          pressed={false}
          onPressedChange={() => editor?.chain().focus().undo().run()}
          disabled={disabled || !editor?.can().undo()}
          aria-label="Undo"
        >
          <Undo className="h-3.5 w-3.5" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={false}
          onPressedChange={() => editor?.chain().focus().redo().run()}
          disabled={disabled || !editor?.can().redo()}
          aria-label="Redo"
        >
          <Redo className="h-3.5 w-3.5" />
        </Toggle>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} className="px-3 py-2 text-sm" style={{ minHeight: "8rem" }} />
    </div>
  );
}

