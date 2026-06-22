import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import api from '../../services/api';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, AlignLeft, AlignCenter,
  AlignRight, List, ListOrdered, Heading1, Heading2, Quote, Code, Link as LinkIcon,
  Highlighter, Undo2, Redo2, Save, ArrowLeft, Loader2, X, Star
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PostEditorProps {
  postId?: number | null;
  onBack: () => void;
  onSaved?: () => void;
}

interface Category {
  id: number;
  name: string;
}

const PostEditor: React.FC<PostEditorProps> = ({ postId, onBack, onSaved }) => {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');
  const [categoryId, setCategoryId] = useState<number | string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [publishedAt, setPublishedAt] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!postId);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Start writing your post...' }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[300px] px-6 py-4 text-gray-200',
      },
    },
  });

  useEffect(() => {
    api.get('/content/categories').then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (postId && editor) {
      setLoading(true);
      api.get(`/content/posts/${postId}`).then(({ data }) => {
        setTitle(data.title);
        setStatus(data.status);
        setCategoryId(data.categoryId || '');
        setTags(data.tags || []);
        setIsFeatured(data.isFeatured);
        setPublishedAt(data.publishedAt ? new Date(data.publishedAt).toISOString().slice(0, 16) : '');
        editor.commands.setContent(data.content || '');
        setLoading(false);
      }).catch(() => {
        toast.error('Failed to load post');
        setLoading(false);
      });
    }
  }, [postId, editor]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title,
        content: editor?.getHTML() || '',
        status,
        categoryId: categoryId || null,
        tags,
        isFeatured,
        publishedAt: publishedAt || null,
      };

      if (postId) {
        await api.put(`/content/posts/${postId}`, payload);
        toast.success('Post updated');
      } else {
        await api.post('/content/posts', payload);
        toast.success('Post created');
      }
      onSaved?.();
      onBack();
    } catch (error) {
      toast.error('Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-primary-500" />
      </div>
    );
  }

  const MenuButton = ({ onClick, active, children, title: btnTitle }: { onClick: () => void; active?: boolean; children: React.ReactNode; title?: string }) => (
    <button
      onClick={onClick}
      title={btnTitle}
      className={`p-1.5 rounded transition-colors ${active ? 'bg-primary-500/20 text-primary-400' : 'text-gray-400 hover:text-white hover:bg-dark-border/50'}`}
    >
      {children}
    </button>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-dark-border/50 text-gray-400 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {postId ? 'Edit Post' : 'New Post'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="bg-dark-bg/50 border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-300 outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-primary-500/20 flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Editor */}
        <div className="lg:col-span-3 space-y-4">
          {/* Title */}
          <input
            id="post-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title..."
            className="w-full bg-transparent text-3xl font-bold text-white placeholder-gray-600 outline-none border-none"
          />

          {/* Toolbar */}
          <div className="glass-panel rounded-xl p-2 flex flex-wrap gap-0.5">
            <MenuButton onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold')} title="Bold">
              <Bold size={16} />
            </MenuButton>
            <MenuButton onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')} title="Italic">
              <Italic size={16} />
            </MenuButton>
            <MenuButton onClick={() => editor?.chain().focus().toggleUnderline().run()} active={editor?.isActive('underline')} title="Underline">
              <UnderlineIcon size={16} />
            </MenuButton>
            <MenuButton onClick={() => editor?.chain().focus().toggleStrike().run()} active={editor?.isActive('strike')} title="Strikethrough">
              <Strikethrough size={16} />
            </MenuButton>
            <div className="w-px bg-dark-border mx-1"></div>
            <MenuButton onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} active={editor?.isActive('heading', { level: 1 })} title="Heading 1">
              <Heading1 size={16} />
            </MenuButton>
            <MenuButton onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive('heading', { level: 2 })} title="Heading 2">
              <Heading2 size={16} />
            </MenuButton>
            <div className="w-px bg-dark-border mx-1"></div>
            <MenuButton onClick={() => editor?.chain().focus().setTextAlign('left').run()} active={editor?.isActive({ textAlign: 'left' })} title="Align Left">
              <AlignLeft size={16} />
            </MenuButton>
            <MenuButton onClick={() => editor?.chain().focus().setTextAlign('center').run()} active={editor?.isActive({ textAlign: 'center' })} title="Align Center">
              <AlignCenter size={16} />
            </MenuButton>
            <MenuButton onClick={() => editor?.chain().focus().setTextAlign('right').run()} active={editor?.isActive({ textAlign: 'right' })} title="Align Right">
              <AlignRight size={16} />
            </MenuButton>
            <div className="w-px bg-dark-border mx-1"></div>
            <MenuButton onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive('bulletList')} title="Bullet List">
              <List size={16} />
            </MenuButton>
            <MenuButton onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList')} title="Ordered List">
              <ListOrdered size={16} />
            </MenuButton>
            <MenuButton onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive('blockquote')} title="Quote">
              <Quote size={16} />
            </MenuButton>
            <MenuButton onClick={() => editor?.chain().focus().toggleCodeBlock().run()} active={editor?.isActive('codeBlock')} title="Code Block">
              <Code size={16} />
            </MenuButton>
            <MenuButton onClick={() => editor?.chain().focus().toggleHighlight().run()} active={editor?.isActive('highlight')} title="Highlight">
              <Highlighter size={16} />
            </MenuButton>
            <div className="w-px bg-dark-border mx-1"></div>
            <MenuButton onClick={() => editor?.chain().focus().undo().run()} title="Undo">
              <Undo2 size={16} />
            </MenuButton>
            <MenuButton onClick={() => editor?.chain().focus().redo().run()} title="Redo">
              <Redo2 size={16} />
            </MenuButton>
          </div>

          {/* Editor Content */}
          <div className="glass-panel rounded-xl overflow-hidden min-h-[400px]">
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Category */}
          <div className="glass-panel rounded-xl p-4 space-y-3">
            <label className="text-sm font-medium text-gray-300">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-dark-bg/50 border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-300 outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Uncategorized</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="glass-panel rounded-xl p-4 space-y-3">
            <label className="text-sm font-medium text-gray-300">Tags</label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Add tag and press Enter"
              className="w-full bg-dark-bg/50 border border-dark-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-primary-500"
            />
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-500/10 text-primary-400 rounded text-xs">
                  {tag}
                  <button onClick={() => setTags(tags.filter((_, j) => j !== i))} className="hover:text-red-400">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Featured */}
          <div className="glass-panel rounded-xl p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                className={`w-10 h-6 rounded-full transition-colors relative ${isFeatured ? 'bg-primary-500' : 'bg-dark-border'}`}
                onClick={() => setIsFeatured(!isFeatured)}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${isFeatured ? 'translate-x-4.5' : 'translate-x-0.5'}`}></div>
              </div>
              <div className="flex items-center gap-2">
                <Star size={16} className={isFeatured ? 'text-amber-400' : 'text-gray-500'} />
                <span className="text-sm font-medium text-gray-300">Featured Post</span>
              </div>
            </label>
          </div>

          {/* Schedule */}
          <div className="glass-panel rounded-xl p-4 space-y-3">
            <label className="text-sm font-medium text-gray-300">Schedule Publish</label>
            <input
              type="datetime-local"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
              className="w-full bg-dark-bg/50 border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-300 outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostEditor;
