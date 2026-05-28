import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { adminAPI } from '../services/api';
import { formatNumber, timeAgo, getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';

const AdminPage = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [usersPage, setUsersPage] = useState(1);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data } = await adminAPI.getStats();
        setStats(data.stats);
        setStats(data);
      } catch (e) { toast.error(getErrorMessage(e)); }
      finally { setLoading(false); }
    };
    loadStats();
  }, []);

  useEffect(() => {
    if (tab !== 'users') return;
    adminAPI.getUsers({ page: usersPage }).then(r => setUsers(r.data.users)).catch(() => {});
  }, [tab, usersPage]);

  const handleToggleAdmin = async (userId, currentRole) => {
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      await adminAPI.updateUser(userId, { role: newRole });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
      toast.success('User role updated');
    } catch (e) { toast.error(getErrorMessage(e)); }
  };

  const handleToggleActive = async (userId, isActive) => {
    try {
      await adminAPI.updateUser(userId, { isActive: !isActive });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !isActive } : u));
      toast.success(isActive ? 'User deactivated' : 'User activated');
    } catch (e) { toast.error(getErrorMessage(e)); }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Delete this post permanently?')) return;
    try {
      await adminAPI.deletePost(postId);
      setStats(prev => ({ ...prev, recentPosts: prev.recentPosts.filter(p => p._id !== postId) }));
      toast.success('Post deleted');
    } catch (e) { toast.error(getErrorMessage(e)); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-ink-600 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-ink-600 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">Admin Panel</h1>
          <p className="text-sm text-gray-500">Platform management</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 dark:border-gray-800 mb-8 gap-1">
        {['overview', 'users', 'posts'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${tab === t ? 'border-ink-600 text-ink-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && stats && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Users', value: stats.stats?.totalUsers, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
              { label: 'Total Posts', value: stats.stats?.totalPosts, color: 'text-ink-600', bg: 'bg-ink-50 dark:bg-ink-950/30' },
              { label: 'Total Comments', value: stats.stats?.totalComments, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30' },
              { label: 'Categories', value: stats.stats?.totalCategories, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
            ].map(item => (
              <div key={item.label} className={`card p-5 ${item.bg}`}>
                <p className={`text-3xl font-display font-bold ${item.color}`}>{formatNumber(item.value || 0)}</p>
                <p className="text-sm text-gray-500 mt-1">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent users */}
            <div className="card">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 font-semibold text-sm">Recent Users</div>
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {stats.recentUsers?.map(u => (
                  <div key={u._id} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-8 h-8 rounded-full bg-ink-100 dark:bg-ink-900 flex items-center justify-center text-ink-600 font-bold text-xs flex-shrink-0">
                      {u.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                    <span className={`badge text-xs ${u.role === 'admin' ? 'bg-ink-100 text-ink-700 dark:bg-ink-900 dark:text-ink-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>{u.role}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent posts */}
            <div className="card">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 font-semibold text-sm">Recent Posts</div>
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {stats.recentPosts?.map(p => (
                  <div key={p._id} className="flex items-start gap-3 px-5 py-3">
                    <div className="flex-1 min-w-0">
                      <Link to={`/post/${p.slug}`} className="font-medium text-sm hover:text-ink-600 transition-colors truncate block">{p.title}</Link>
                      <p className="text-xs text-gray-400">{p.author?.name} · {timeAgo(p.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`badge text-xs ${p.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{p.status}</span>
                      <button onClick={() => handleDeletePost(p._id)} className="text-xs text-red-400 hover:text-red-600">×</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {tab === 'users' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 dark:border-gray-800">
                <tr className="text-left text-xs text-gray-400">
                  <th className="px-5 py-3">User</th>
                  <th className="pr-4 py-3">Email</th>
                  <th className="pr-4 py-3">Role</th>
                  <th className="pr-4 py-3">Status</th>
                  <th className="py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className="border-t border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-5 py-3">
                      <div className="font-medium">{u.name}</div>
                      <div className="text-xs text-gray-400">@{u.username}</div>
                    </td>
                    <td className="pr-4 py-3 text-gray-500">{u.email}</td>
                    <td className="pr-4 py-3">
                      <span className={`badge text-xs ${u.role === 'admin' ? 'bg-ink-100 text-ink-700 dark:bg-ink-900 dark:text-ink-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>{u.role}</span>
                    </td>
                    <td className="pr-4 py-3">
                      <span className={`badge text-xs ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{u.isActive ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        <button onClick={() => handleToggleAdmin(u._id, u.role)} className="btn-ghost text-xs py-1 px-2">
                          {u.role === 'admin' ? 'Remove admin' : 'Make admin'}
                        </button>
                        <button onClick={() => handleToggleActive(u._id, u.isActive)} className={`btn-ghost text-xs py-1 px-2 ${u.isActive ? 'text-red-500' : 'text-green-500'}`}>
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {tab === 'posts' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="card">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800">
              <p className="text-sm text-gray-500">All recent posts — admins can delete any post</p>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {stats?.recentPosts?.map(p => (
                <div key={p._id} className="flex items-center gap-4 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <Link to={`/post/${p.slug}`} className="font-medium hover:text-ink-600 transition-colors block truncate">{p.title}</Link>
                    <p className="text-xs text-gray-400 mt-0.5">{p.author?.name} · {timeAgo(p.createdAt)} · {formatNumber(p.views || 0)} views</p>
                  </div>
                  <span className={`badge text-xs flex-shrink-0 ${p.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{p.status}</span>
                  <button onClick={() => handleDeletePost(p._id)} className="btn-ghost text-xs py-1.5 px-3 text-red-500 flex-shrink-0">Delete</button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminPage;
