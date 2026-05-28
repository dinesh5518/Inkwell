import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { postsAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatNumber, getAvatarUrl, timeAgo, getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';

const StatCard = ({ label, value, icon, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="card p-5"
  >
    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-white mb-3`}>
      {icon}
    </div>
    <p className="text-2xl font-display font-bold">{formatNumber(value)}</p>
    <p className="text-sm text-gray-500">{label}</p>
  </motion.div>
);

const PostRow = ({ post, onDelete }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    setDeleting(true);
    try {
      await postsAPI.delete(post._id);
      onDelete(post._id);
      toast.success('Post deleted');
    } catch (e) { toast.error(getErrorMessage(e)); }
    finally { setDeleting(false); }
  };

  return (
    <tr className="border-t border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <td className="py-3 pr-4">
        <Link to={post.status === 'published' ? `/post/${post.slug}` : `/write/${post._id}`} className="font-medium hover:text-ink-600 transition-colors line-clamp-1">
          {post.title}
        </Link>
        <p className="text-xs text-gray-400 mt-0.5">{timeAgo(post.createdAt)}</p>
      </td>
      <td className="py-3 pr-4">
        <span className={`badge text-xs ${post.status === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
          {post.status}
        </span>
      </td>
      <td className="py-3 pr-4 text-sm text-gray-500">{formatNumber(post.views || 0)}</td>
      <td className="py-3 pr-4 text-sm text-gray-500">{post.likes?.length || 0}</td>
      <td className="py-3">
        <div className="flex gap-2">
          <Link to={`/write/${post._id}`} className="text-xs btn-ghost py-1 px-2">Edit</Link>
          <button onClick={handleDelete} disabled={deleting} className="text-xs text-red-500 hover:text-red-700 btn-ghost py-1 px-2">
            {deleting ? '...' : 'Delete'}
          </button>
        </div>
      </td>
    </tr>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({});
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [postsRes, statsRes] = await Promise.all([
          postsAPI.getMyPosts(),
          usersAPI.getDashboard()
        ]);
        setPosts(postsRes.data.posts);
        setStats(statsRes.data.stats);
      } catch (e) { toast.error(getErrorMessage(e)); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const filteredPosts = filter === 'all' ? posts : posts.filter(p => p.status === filter);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500">Welcome back, {user?.name?.split(' ')[0]}!</p>
        </div>
        <Link to="/write" className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New post
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          label="Total Posts"
          value={stats.totalPosts || 0}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          color="bg-ink-600"
        />
        <StatCard
          label="Published"
          value={stats.publishedPosts || 0}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
          color="bg-green-500"
        />
        <StatCard
          label="Total Views"
          value={stats.totalViews || 0}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
          color="bg-blue-500"
        />
        <StatCard
          label="Total Likes"
          value={stats.totalLikes || 0}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>}
          color="bg-red-500"
        />
      </div>

      {/* Posts table */}
      <div className="card">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="font-semibold">Your Posts</h2>
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
            {['all', 'published', 'draft'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-md text-sm capitalize transition-colors ${filter === f ? 'bg-white dark:bg-gray-700 font-medium shadow-sm' : 'text-gray-500'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 space-y-4">
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-10 rounded-xl" />)}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm mb-3">No {filter === 'all' ? '' : filter + ' '}posts yet</p>
              <Link to="/write" className="btn-primary text-sm py-2 inline-flex">Write your first post</Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 font-medium">
                  <th className="px-5 py-3">Title</th>
                  <th className="pr-4 py-3">Status</th>
                  <th className="pr-4 py-3">Views</th>
                  <th className="pr-4 py-3">Likes</th>
                  <th className="py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="px-5">
                {filteredPosts.map(post => (
                  <tr key={post._id} className="border-t border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-3 px-5 pr-4">
                      <Link to={post.status === 'published' ? `/post/${post.slug}` : `/write/${post._id}`} className="font-medium hover:text-ink-600 transition-colors">
                        {post.title}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">{timeAgo(post.createdAt)}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`badge text-xs ${post.status === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-500">{formatNumber(post.views || 0)}</td>
                    <td className="py-3 pr-4 text-gray-500">{post.likes?.length || 0}</td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        <Link to={`/write/${post._id}`} className="btn-ghost text-xs py-1 px-2">Edit</Link>
                        <button
                          onClick={async () => {
                            if (!confirm('Delete this post?')) return;
                            try { await postsAPI.delete(post._id); setPosts(prev => prev.filter(p => p._id !== post._id)); toast.success('Deleted'); }
                            catch (e) { toast.error(getErrorMessage(e)); }
                          }}
                          className="btn-ghost text-xs py-1 px-2 text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
