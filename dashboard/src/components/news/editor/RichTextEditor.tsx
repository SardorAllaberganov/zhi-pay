import { useEffect } from 'react';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { cn } from '@/lib/utils';
import { Toolbar } from './Toolbar';

/**
 * News rich-text editor — TipTap wrapper. Stores body as HTML; the same
 * HTML is rendered (sanitized) by the preview pane and the live mobile.
 *
 * The editor is uncontrolled: it owns the document state and reports
 * changes via `onChange(html)`. `value` is only consumed on mount and
 * when the locale changes (driven by `keyById`).
 *
 * `keyById` should change whenever the active locale flips — TipTap
 * doesn't re-mount cleanly on `value` change alone since the underlying
 * ProseMirror state is independent. Mounting fresh per locale keeps the
 * doc state truthful and the cursor at the start of the new doc.
 */

export const NEWS_EDITOR_PROSE_CLASSES =
  'prose prose-sm dark:prose-invert max-w-none ' +
  'prose-headings:font-semibold prose-headings:tracking-tight ' +
  'prose-h2:text-lg prose-h2:mt-4 prose-h2:mb-2 ' +
  'prose-h3:text-base prose-h3:mt-3 prose-h3:mb-1.5 ' +
  'prose-p:leading-relaxed prose-p:my-2 ' +
  'prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 ' +
  'prose-blockquote:border-brand-300 prose-blockquote:bg-brand-50/40 ' +
  'dark:prose-blockquote:bg-brand-950/20 prose-blockquote:rounded-r-md ' +
  'prose-blockquote:py-1 prose-blockquote:px-3 prose-blockquote:not-italic ' +
  'prose-blockquote:font-normal ' +
  'prose-a:text-brand-700 prose-a:underline ' +
  'prose-img:rounded-md prose-img:border prose-img:border-border ' +
  'prose-hr:border-border';

interface Props {
  /** HTML string (consumed on mount + when `keyById` changes). */
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  /** Bumped when the underlying logical document changes (e.g. locale switch). */
  keyById: string;
  /** When provided, consumer renders its own toolbar rather than the default. */
  renderToolbar?: (editor: Editor | null) => React.ReactNode;
  className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, keyById, renderToolbar, className }: Props) {
  return <EditorInstance key={keyById} value={value} onChange={onChange} placeholder={placeholder} renderToolbar={renderToolbar} className={className} />;
}

function EditorInstance({ value, onChange, placeholder, renderToolbar, className }: Omit<Props, 'keyById'>) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          loading: 'lazy',
          decoding: 'async',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? '',
        emptyEditorClass:
          'before:content-[attr(data-placeholder)] before:text-muted-foreground before:float-left before:pointer-events-none before:h-0',
      }),
    ],
    content: value || '<p></p>',
    editorProps: {
      attributes: {
        class:
          NEWS_EDITOR_PROSE_CLASSES +
          ' min-h-[260px] focus:outline-none px-4 py-3',
      },
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      onChange(html);
    },
  });

  // Keep placeholder live if it changes (locale-flip case)
  useEffect(() => {
    if (!editor || placeholder === undefined) return;
    // The Placeholder extension reads from the data-placeholder attr, which
    // tiptap sets from the configure() call. For locale changes we re-mount
    // the whole editor via `keyById`; this effect is a no-op in that path
    // but stays for non-remount placeholder updates.
    const ext = editor.extensionManager.extensions.find((e) => e.name === 'placeholder');
    if (ext) {
      ext.options.placeholder = placeholder;
    }
  }, [editor, placeholder]);

  return (
    <div className={cn('rounded-md border border-input bg-background overflow-hidden', className)}>
      {renderToolbar ? renderToolbar(editor) : <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}

/**
 * Approximate plain-text length of an HTML body — used for the body
 * minimum-length check (see `BODY_MIN_PLAIN` in `./types`). Strips tags,
 * collapses whitespace, returns the visible length.
 */
export function plainTextLength(html: string): number {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim().length;
}
