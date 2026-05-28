import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { postsAPI, categoriesAPI } from '../services/api';
import PostCard from '../components/blog/PostCard';
import { CardSkeleton } from '../components/common/Skeletons';
import { useDebounce } from '../hooks';

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'popular', label: 'Most viewed' },
  { value: 'trending', label: 'Trending' },
];

const BlogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const tag = searchParams.get('tag') || '';
  const sort = searchParams.get('sort') || 'latest';
  const page = parseInt(searchParams.get('page') || '1');

  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, 500);

  useEffect(() => {
    if (debouncedSearch !== search) {
      setSearchParams(p => { const n = new URLSearchParams(p); n.set('search', debouncedSearch); n.set('page', '1'); return n; });
    }
  }, [debouncedSearch]);

  useEffect(() => {
    categoriesAPI.getAll().then(r => setCategories(r.data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 9, sort };
        if (search) params.search = search;
        if (category) params.category = category;
        if (tag) params.tag = tag;

        const { data } = await postsAPI.getAll(params);
        setPosts(data.posts);
        setPagination(data.pagination);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [search, category, tag, sort, page]);

  const setParam = (key, value) => {
    setSearchParams(prev => {
      const n = new URLSearchParams(prev);
      if (value) n.set(key, value); else n.delete(key);
      n.set('page', '1');
      return n;
    });
  };

  const clearFilters = () => setSearchParams({});

  const hasFilters = search || category || tag || sort !== 'latest';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold mb-2">Explore Articles</h1>
        <p className="text-gray-500">Discover stories, ideas, and expertise from writers on any topic.</p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        {/* Search */}
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search articles..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="input pl-10"
          />
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={e => setParam('sort', e.target.value)}
          className="input w-full lg:w-48"
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setParam('category', '')}
          className={`badge transition-colors ${!category ? 'bg-ink-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'}`}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat._id}
            onClick={() => setParam('category', cat._id === category ? '' : cat._id)}
            className={`badge transition-colors ${category === cat._id ? 'text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            style={category === cat._id ? { backgroundColor: cat.color } : {}}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Active tag filter */}
      {tag && (
        <div className="flex items-center gap-2 mb-6 p-3 bg-ink-50 dark:bg-ink-950/30 rounded-xl border border-ink-100 dark:border-ink-900">
          <span className="text-sm text-gray-600 dark:text-gray-400">Filtered by tag:</span>
          <span className="badge bg-ink-600 text-white">#{tag}</span>
          <button onClick={() => setParam('tag', '')} className="ml-auto text-xs text-gray-400 hover:text-red-500 transition-colors">
            × Clear
          </button>
        </div>
      )}

      {hasFilters && (
        <button onClick={clearFilters} className="text-sm text-ink-600 hover:underline mb-4 block">
          Clear all filters
        </button>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : posts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 text-gray-400"
        >
          <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-500 mb-2">No articles found</h3>
          <p className="text-sm">Try adjusting your search or filters</p>
        </motion.div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{pagination.total} article{pagination.total !== 1 ? 's' : ''} found</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, i) => <PostCard key={post._id} post={post} index={i} />)}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <button
                disabled={page <= 1}
                onClick={() => setParam('page', String(page - 1))}
                className="btn-secondary py-2 px-4 disabled:opacity-40"
              >
                ← Prev
              </button>

              {[...Array(pagination.pages)].map((_, i) => {
                const p = i + 1;
                if (Math.abs(p - page) > 2 && p !== 1 && p !== pagination.pages) {
                  if (p === 2 || p === pagination.pages - 1) return <span key={p} className="text-gray-400">…</span>;
                  return null;
                }
                return (
                  <button
                    key={p}
                    onClick={() => setParam('page', String(p))}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-ink-600 text-white' : 'btn-secondary py-0 px-0'}`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                disabled={page >= pagination.pages}
                onClick={() => setParam('page', String(page + 1))}
                className="btn-secondary py-2 px-4 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BlogPage;
