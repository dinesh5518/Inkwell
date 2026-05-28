import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { postsAPI, categoriesAPI } from '../services/api';
import MarkdownRenderer from '../components/blog/MarkdownRenderer';
import { getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';

const WritePage = () => {
  const { id } = useParams(); // If editing existing post
  const navigate = useNavigate();
  const isEditing = !!id;

  const [form, setForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    coverImage: '',
    tags: '',
    category: '',
    status: 'draft',
    seoTitle: '',
    seoDescription: ''
  });
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('write'); // write | preview | settings
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    categoriesAPI.getAll().then(r => setCategories(r.data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEditing) return;
    const load = async () => {
      try {
        const { data } = await postsAPI.getOne(id);
        const p = data.post;
        setForm({
          title: p.title || '',
          content: p.content || '',
          excerpt: p.excerpt || '',
          coverImage: p.coverImage || '',
          tags: (p.tags || []).join(', '),
          category: p.category?._id || '',
          status: p.status || 'draft',
          seoTitle: p.seoTitle || '',
          seoDescription: p.seoDescription || ''
        });
      } catch (e) {
        toast.error('Post not found');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isEditing]);

  useEffect(() => {
    const words = form.content.trim() ? form.content.trim().split(/\s+/).length : 0;
    setWordCount(words);
  }, [form.content]);

  const handleChange = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = async (status = form.status) => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.content.trim()) { toast.error('Content is required'); return; }

    setSaving(true);
    try {
      const payload = { ...form, status };
      if (isEditing) {
        await postsAPI.update(id, payload);
        toast.success(status === 'published' ? 'Post published!' : 'Draft saved!');
      } else {
        const { data } = await postsAPI.create(payload);
        toast.success(status === 'published' ? 'Post published!' : 'Draft saved!');
        navigate(status === 'published' ? `/post/${data.post.slug}` : '/dashboard');
        return;
      }
      if (status === 'published') {
        const { data } = await postsAPI.getOne(id);
        navigate(`/post/${data.post.slug}`);
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-ink-600 border-t-transparent rounded-full" />
    </div>
  );

  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Toolbar */}
      <div className="sticky top-16 z-30 bg-white/90 dark:bg-gray-950/90 backdrop-blur border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-0.5">
            {['write', 'preview', 'settings'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors capitalize ${
                  activeTab === tab ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{wordCount} words · ~{readingTime} min read</span>
            <button
              onClick={() => handleSave('draft')}
              disabled={saving}
              className="btn-secondary text-sm py-1.5"
            >
              {saving ? 'Saving...' : 'Save draft'}
            </button>
            <button
              onClick={() => handleSave('published')}
              disabled={saving}
              className="btn-primary text-sm py-1.5"
            >
              {form.status === 'published' ? 'Update' : 'Publish'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'write' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Cover image */}
            {form.coverImage && (
              <div className="relative rounded-2xl overflow-hidden aspect-[3/1]">
                <img src={form.coverImage} alt="Cover" className="w-full h-full object-cover" />
                <button onClick={() => handleChange('coverImage', '')} className="absolute top-3 right-3 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors">×</button>
              </div>
            )}

            {!form.coverImage && (
              <div>
                <input
                  type="url"
                  placeholder="Cover image URL (optional)"
                  value={form.coverImage}
                  onChange={e => handleChange('coverImage', e.target.value)}
                  className="input text-sm"
                />
              </div>
            )}

            {/* Title */}
            <textarea
              placeholder="Your story title..."
              value={form.title}
              onChange={e => handleChange('title', e.target.value)}
              className="w-full text-4xl font-display font-bold placeholder-gray-200 dark:placeholder-gray-700 bg-transparent border-none outline-none resize-none leading-tight"
              rows={2}
              maxLength={150}
            />

            {/* Divider */}
            <div className="border-t border-gray-100 dark:border-gray-800" />

            {/* Content editor */}
            <textarea
              placeholder="Tell your story...

You can use Markdown:
# Heading 1
## Heading 2
**bold**, *italic*
`inline code`
```
code block
```
> blockquote
- list item"
              value={form.content}
              onChange={e => handleChange('content', e.target.value)}
              className="w-full min-h-[60vh] font-mono text-sm placeholder-gray-300 dark:placeholder-gray-700 bg-transparent border-none outline-none resize-none leading-relaxed"
            />
          </motion.div>
        )}

        {activeTab === 'preview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {form.coverImage && (
              <div className="rounded-2xl overflow-hidden aspect-[2/1] mb-10">
                <img src={form.coverImage} alt="Cover" className="w-full h-full object-cover" />
              </div>
            )}
            <h1 className="font-display text-5xl font-bold mb-8">{form.title || 'Your title here...'}</h1>
            {form.content ? (
              <MarkdownRenderer content={form.content} />
            ) : (
              <p className="text-gray-400 italic">Start writing to see the preview...</p>
            )}
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Excerpt</label>
              <textarea
                value={form.excerpt}
                onChange={e => handleChange('excerpt', e.target.value)}
                placeholder="A brief description of your post (auto-generated if left blank)"
                className="input resize-none"
                rows={3}
                maxLength={300}
              />
              <p className="text-xs text-gray-400 mt-1">{form.excerpt.length}/300</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select value={form.category} onChange={e => handleChange('category', e.target.value)} className="input">
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <input
                type="text"
                value={form.tags}
                onChange={e => handleChange('tags', e.target.value)}
                placeholder="react, javascript, webdev (comma-separated)"
                className="input"
              />
              <p className="text-xs text-gray-400 mt-1">Separate tags with commas</p>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
              <h3 className="font-semibold mb-4">SEO Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">SEO Title</label>
                  <input value={form.seoTitle} onChange={e => handleChange('seoTitle', e.target.value)} placeholder="Custom title for search engines" className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">SEO Description</label>
                  <textarea value={form.seoDescription} onChange={e => handleChange('seoDescription', e.target.value)} placeholder="Description for search engines (150-160 chars)" className="input resize-none" rows={2} maxLength={160} />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={() => handleSave('draft')} disabled={saving} className="btn-secondary flex-1 justify-center">
                Save as Draft
              </button>
              <button onClick={() => handleSave('published')} disabled={saving} className="btn-primary flex-1 justify-center">
                {form.status === 'published' ? 'Update Post' : 'Publish Now'}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default WritePage;
