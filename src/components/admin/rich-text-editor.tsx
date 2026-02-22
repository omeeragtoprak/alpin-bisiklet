"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Placeholder from "@tiptap/extension-placeholder";
import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { html as htmlLang } from "@codemirror/lang-html";
import { oneDark } from "@codemirror/theme-one-dark";
import { html as beautifyHtml } from "js-beautify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Minus,
    Undo,
    Redo,
    Link as LinkIcon,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Code,
    RemoveFormatting,
} from "lucide-react";
import { cn } from "@/lib/utils";

// CodeMirror is DOM-dependent — load only on client
const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), { ssr: false });

function formatHtml(raw: string): string {
    return beautifyHtml(raw, {
        indent_size: 2,
        wrap_line_length: 100,
        preserve_newlines: false,
        end_with_newline: false,
    });
}

interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    className?: string;
    minHeight?: string;
}

function ToolbarButton({
    onClick,
    active,
    disabled,
    title,
    children,
}: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={cn(
                "h-7 w-7 flex items-center justify-center rounded text-sm transition-colors",
                "hover:bg-muted hover:text-foreground",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                active
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                    : "text-muted-foreground",
            )}
        >
            {children}
        </button>
    );
}

function Divider() {
    return <div className="w-px h-5 bg-border mx-0.5 shrink-0" />;
}

export function RichTextEditor({
    value,
    onChange,
    placeholder = "İçerik yazın...",
    className,
    minHeight = "240px",
}: RichTextEditorProps) {
    const [mode, setMode] = useState<"visual" | "html">("visual");
    const [htmlValue, setHtmlValue] = useState(value);
    const [linkDialogOpen, setLinkDialogOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");

    // Prevents useEffect from calling setContent when the change originated from the editor itself
    const isInternalUpdate = useRef(false);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            Underline,
            TextStyle,
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-primary underline" } }),
            Placeholder.configure({ placeholder }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            isInternalUpdate.current = true;
            const html = editor.getHTML();
            setHtmlValue(html);
            onChange(html);
        },
        editorProps: {
            attributes: {
                class: "outline-none prose prose-neutral max-w-none dark:prose-invert",
            },
        },
    });

    // Sync external value changes to the editor (e.g. form reset, initial load)
    useEffect(() => {
        if (!editor) return;
        // Skip if this update originated from the editor itself (prevents feedback loop)
        if (isInternalUpdate.current) {
            isInternalUpdate.current = false;
            return;
        }
        const current = editor.getHTML();
        if (value !== current) {
            editor.commands.setContent(value || "", { emitUpdate: false });
            setHtmlValue(value || "");
        }
    }, [value, editor]);

    const switchToHtml = useCallback(() => {
        const raw = editor ? editor.getHTML() : htmlValue;
        const formatted = formatHtml(raw);
        setHtmlValue(formatted);
        onChange(formatted);
        setMode("html");
    }, [editor, htmlValue, onChange]);

    const switchToVisual = useCallback(() => {
        if (editor) {
            editor.commands.setContent(htmlValue, { emitUpdate: false });
            onChange(htmlValue);
        }
        setMode("visual");
    }, [editor, htmlValue, onChange]);

    const handleCodeMirrorChange = useCallback((val: string) => {
        setHtmlValue(val);
        onChange(val);
    }, [onChange]);

    const openLinkDialog = useCallback(() => {
        if (!editor) return;
        const prev = editor.getAttributes("link").href as string | undefined;
        setLinkUrl(prev ?? "https://");
        setLinkDialogOpen(true);
    }, [editor]);

    const applyLink = useCallback(() => {
        if (!editor) return;
        if (!linkUrl || linkUrl === "https://") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
        } else {
            editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
        }
        setLinkDialogOpen(false);
    }, [editor, linkUrl]);

    const minHeightPx = Number.parseInt(minHeight) || 240;

    return (
        <div className={cn("rounded-lg border bg-background overflow-hidden", className)}>
            {/* Mod seçici */}
            <div className="flex items-center justify-between px-3 py-1.5 border-b bg-muted/30">
                <Tabs
                    value={mode}
                    onValueChange={(v) => {
                        if (v === "html") switchToHtml();
                        else switchToVisual();
                    }}
                >
                    <TabsList className="h-7 gap-0.5 p-0.5">
                        <TabsTrigger value="visual" className="h-6 px-2.5 text-xs">
                            Görsel
                        </TabsTrigger>
                        <TabsTrigger value="html" className="h-6 px-2.5 text-xs">
                            HTML
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Araç çubuğu — yalnızca görsel modda */}
            {mode === "visual" && editor && (
                <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b bg-muted/20">
                    {/* Geçmiş */}
                    <ToolbarButton
                        title="Geri Al"
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                    >
                        <Undo className="h-3.5 w-3.5" />
                    </ToolbarButton>
                    <ToolbarButton
                        title="Yinele"
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                    >
                        <Redo className="h-3.5 w-3.5" />
                    </ToolbarButton>

                    <Divider />

                    {/* Başlıklar */}
                    <ToolbarButton
                        title="Başlık 1"
                        active={editor.isActive("heading", { level: 1 })}
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    >
                        <Heading1 className="h-3.5 w-3.5" />
                    </ToolbarButton>
                    <ToolbarButton
                        title="Başlık 2"
                        active={editor.isActive("heading", { level: 2 })}
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    >
                        <Heading2 className="h-3.5 w-3.5" />
                    </ToolbarButton>
                    <ToolbarButton
                        title="Başlık 3"
                        active={editor.isActive("heading", { level: 3 })}
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    >
                        <Heading3 className="h-3.5 w-3.5" />
                    </ToolbarButton>

                    <Divider />

                    {/* Metin biçimlendirme */}
                    <ToolbarButton
                        title="Kalın"
                        active={editor.isActive("bold")}
                        onClick={() => editor.chain().focus().toggleBold().run()}
                    >
                        <Bold className="h-3.5 w-3.5" />
                    </ToolbarButton>
                    <ToolbarButton
                        title="İtalik"
                        active={editor.isActive("italic")}
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                    >
                        <Italic className="h-3.5 w-3.5" />
                    </ToolbarButton>
                    <ToolbarButton
                        title="Altı Çizili"
                        active={editor.isActive("underline")}
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                    >
                        <UnderlineIcon className="h-3.5 w-3.5" />
                    </ToolbarButton>
                    <ToolbarButton
                        title="Üstü Çizili"
                        active={editor.isActive("strike")}
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                    >
                        <Strikethrough className="h-3.5 w-3.5" />
                    </ToolbarButton>
                    <ToolbarButton
                        title="Kod"
                        active={editor.isActive("code")}
                        onClick={() => editor.chain().focus().toggleCode().run()}
                    >
                        <Code className="h-3.5 w-3.5" />
                    </ToolbarButton>

                    <Divider />

                    {/* Hizalama */}
                    <ToolbarButton
                        title="Sola Hizala"
                        active={editor.isActive({ textAlign: "left" })}
                        onClick={() => editor.chain().focus().setTextAlign("left").run()}
                    >
                        <AlignLeft className="h-3.5 w-3.5" />
                    </ToolbarButton>
                    <ToolbarButton
                        title="Ortala"
                        active={editor.isActive({ textAlign: "center" })}
                        onClick={() => editor.chain().focus().setTextAlign("center").run()}
                    >
                        <AlignCenter className="h-3.5 w-3.5" />
                    </ToolbarButton>
                    <ToolbarButton
                        title="Sağa Hizala"
                        active={editor.isActive({ textAlign: "right" })}
                        onClick={() => editor.chain().focus().setTextAlign("right").run()}
                    >
                        <AlignRight className="h-3.5 w-3.5" />
                    </ToolbarButton>

                    <Divider />

                    {/* Liste */}
                    <ToolbarButton
                        title="Madde İşaretli Liste"
                        active={editor.isActive("bulletList")}
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                    >
                        <List className="h-3.5 w-3.5" />
                    </ToolbarButton>
                    <ToolbarButton
                        title="Numaralı Liste"
                        active={editor.isActive("orderedList")}
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    >
                        <ListOrdered className="h-3.5 w-3.5" />
                    </ToolbarButton>
                    <ToolbarButton
                        title="Alıntı"
                        active={editor.isActive("blockquote")}
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    >
                        <Quote className="h-3.5 w-3.5" />
                    </ToolbarButton>
                    <ToolbarButton
                        title="Yatay Çizgi"
                        onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    >
                        <Minus className="h-3.5 w-3.5" />
                    </ToolbarButton>

                    <Divider />

                    {/* Bağlantı */}
                    <ToolbarButton
                        title="Bağlantı Ekle"
                        active={editor.isActive("link")}
                        onClick={openLinkDialog}
                    >
                        <LinkIcon className="h-3.5 w-3.5" />
                    </ToolbarButton>

                    {/* Biçimlendirmeyi Temizle */}
                    <ToolbarButton
                        title="Biçimlendirmeyi Temizle"
                        onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
                    >
                        <RemoveFormatting className="h-3.5 w-3.5" />
                    </ToolbarButton>
                </div>
            )}

            {/* Editör içeriği */}
            {mode === "visual" ? (
                <div
                    className="px-4 py-3 cursor-text"
                    style={{ minHeight }}
                    onClick={() => editor?.commands.focus()}
                >
                    <EditorContent editor={editor} />
                </div>
            ) : (
                <div style={{ minHeight }}>
                    <CodeMirror
                        value={htmlValue}
                        onChange={handleCodeMirrorChange}
                        extensions={[htmlLang()]}
                        theme={oneDark}
                        minHeight={`${minHeightPx}px`}
                        basicSetup={{
                            lineNumbers: true,
                            foldGutter: true,
                            highlightActiveLine: true,
                            autocompletion: true,
                            bracketMatching: true,
                            indentOnInput: true,
                        }}
                        style={{ fontSize: "13px" }}
                    />
                </div>
            )}

            {/* Bağlantı Dialog */}
            <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Bağlantı Ekle</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 py-2">
                        <Label htmlFor="link-url">URL</Label>
                        <Input
                            id="link-url"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            placeholder="https://ornek.com"
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyLink(); } }}
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>İptal</Button>
                        <Button onClick={applyLink}>Uygula</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
