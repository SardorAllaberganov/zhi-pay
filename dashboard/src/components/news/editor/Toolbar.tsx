import { useState } from 'react';
import type { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Quote,
  Minus,
  Image as ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { LinkDialog } from './LinkDialog';
import { InlineImageDialog } from './InlineImageDialog';

interface Props {
  editor: Editor | null;
}

export function Toolbar({ editor }: Props) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);

  if (!editor) {
    return (
      <div
        role="toolbar"
        aria-label={t('admin.news.editor.toolbar.aria')}
        className="flex flex-wrap items-center gap-1 rounded-md border border-border bg-muted/30 p-1.5"
      />
    );
  }

  const initialLinkUrl = (editor.getAttributes('link') as { href?: string }).href ?? '';
  const hasLink = editor.isActive('link');

  return (
    <>
      <div
        role="toolbar"
        aria-label={t('admin.news.editor.toolbar.aria')}
        className="flex flex-wrap items-center gap-1 rounded-md border border-border bg-muted/30 p-1.5"
      >
        <ToolbarButton
          icon={Bold}
          labelKey="admin.news.editor.toolbar.bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          shortcut="⌘B"
        />
        <ToolbarButton
          icon={Italic}
          labelKey="admin.news.editor.toolbar.italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          shortcut="⌘I"
        />
        <ToolbarButton
          icon={Underline}
          labelKey="admin.news.editor.toolbar.underline"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          shortcut="⌘U"
        />

        <Divider />

        <ToolbarButton
          icon={Heading2}
          labelKey="admin.news.editor.toolbar.heading-2"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
        />
        <ToolbarButton
          icon={Heading3}
          labelKey="admin.news.editor.toolbar.heading-3"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
        />

        <Divider />

        <ToolbarButton
          icon={List}
          labelKey="admin.news.editor.toolbar.bullet-list"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
        />
        <ToolbarButton
          icon={ListOrdered}
          labelKey="admin.news.editor.toolbar.numbered-list"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
        />

        <Divider />

        <ToolbarButton
          icon={LinkIcon}
          labelKey="admin.news.editor.toolbar.link"
          onClick={() => setLinkOpen(true)}
          active={hasLink}
        />
        <ToolbarButton
          icon={Quote}
          labelKey="admin.news.editor.toolbar.quote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
        />
        <ToolbarButton
          icon={Minus}
          labelKey="admin.news.editor.toolbar.divider"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        />
        <ToolbarButton
          icon={ImageIcon}
          labelKey="admin.news.editor.toolbar.image"
          onClick={() => setImageOpen(true)}
        />
      </div>

      <LinkDialog
        open={linkOpen}
        onOpenChange={setLinkOpen}
        initialUrl={initialLinkUrl}
        hasExistingLink={hasLink}
        onSubmit={(url) => {
          editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        }}
        onRemove={() => {
          editor.chain().focus().extendMarkRange('link').unsetLink().run();
        }}
      />

      <InlineImageDialog
        open={imageOpen}
        onOpenChange={setImageOpen}
        onSubmit={(src, alt) => {
          editor.chain().focus().setImage({ src, alt }).run();
        }}
      />
    </>
  );
}

function Divider() {
  return <span className="mx-0.5 h-5 w-px bg-border" aria-hidden="true" />;
}

function ToolbarButton({
  icon: Icon,
  labelKey,
  onClick,
  active = false,
  shortcut,
}: {
  icon: typeof Bold;
  labelKey: string;
  onClick: () => void;
  active?: boolean;
  shortcut?: string;
}) {
  const label = t(labelKey);
  return (
    <button
      type="button"
      onClick={onClick}
      title={shortcut ? `${label} (${shortcut})` : label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        active
          ? 'bg-card text-brand-700 dark:text-brand-300 shadow-sm ring-1 ring-brand-300 dark:ring-brand-700/40'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
