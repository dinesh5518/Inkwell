import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { postsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useReadingProgress } from '../hooks';
import MarkdownRenderer from '../components/blog/MarkdownRenderer';
import CommentSection from '../components/comment/CommentSection';
import { PostSkeleton } from '../components/common/Skeletons';
import { timeAgo, formatDate, formatNumber, getAvatarUrl, readingTimeText, getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';

const PostPage = () => {
  const { slug } = useParams();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const progress = useReadingProgress();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await postsAPI.getOne(slug);
        setPost(data.post);
        setLikeCount(data.post.likes?.length || 0);
        setLiked(user ? data.post.likes?.includes(user._id) : false);
        setBookmarked(user ? data.post.bookmarks?.includes(user._id) : false);
      } catch (e) {
        toast.error('Post not found');
        navigate('/blog');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug, user]);

  const handleLike = async () => {
    if (!isAuthenticated) { toast.error('Log in to like this post'); return; }
    try {
      const { data } = await postsAPI.like(post._id);
      setLiked(data.liked);
      setLikeCount(data.likesCount);
    } catch (e) { toast.error(getErrorMessage(e)); }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) { toast.error('Log in to bookmark'); return; }
    try {
      const { data } = await postsAPI.bookmark(post._id);
      setBookmarked(data.bookmarked);
      toast.success(data.bookmarked ? 'Bookmarked!' : 'Removed from bookmarks');
    } catch (e) { toast.error(getErrorMessage(e)); }
  };

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post permanently?')) return;
    try {
      await postsAPI.delete(post._id);
      toast.success('Post deleted');
      navigate('/dashboard');
    } catch (e) { toast.error(getErrorMessage(e)); }
  };

  if (loading) return <PostSkeleton />;
  if (!post) return null;

  const isAuthor = user?._id === post.author?._id;
  const canEdit = isAuthor || isAdmin;

  return (
    <>
      {/* Reading progress bar */}
      <div id="reading-progress" style={{ width: `${progress}%` }} />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Back */}
        <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-ink-600 transition-colors mb-8">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to articles
        </Link>

        {/* Category */}
        {post.category && (
          <Link
            to={`/blog?category=${post.category._id}`}
            className="badge text-white text-xs mb-4 inline-flex"
            style={{ backgroundColor: post.category.color }}
          >
            {post.category.icon} {post.category.name}
          </Link>
        )}

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-4xl sm:text-5xl font-bold leading-tight mb-6"
        >
          {post.title}
        </motion.h1>

        {/* Author + Meta */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between flex-wrap gap-4 mb-8 pb-6 border-b border-gray-100 dark:border-gray-800"
        >
          <div className="flex items-center gap-3">
            <Link to={`/u/${post.author?.username}`}>
              <img
                src={getAvatarUrl(post.author)}
                alt={post.author?.name}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-ink-100 dark:ring-ink-900"
              />
            </Link>
            <div>
              <Link to={`/u/${post.author?.username}`} className="font-semibold hover:text-ink-600 transition-colors block">
                {post.author?.name}
              </Link>
              <div className="text-xs text-gray-400 flex items-center gap-2">
                <span>{formatDate(post.createdAt)}</span>
                <span>·</span>
                <span>{readingTimeText(post.readingTime)}</span>
                <span>·</span>
                <span>{formatNumber(post.views)} views</span>
              </div>
            </div>
          </div>

          {/* Author actions */}
          {canEdit && (
            <div className="flex gap-2">
              <Link to={`/write/${post._id}`} className="btn-secondary text-xs py-1.5 px-3">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                Edit
              </Link>
              <button onClick={handleDelete} className="btn-secondary text-xs py-1.5 px-3 text-red-600 border-red-200 hover:bg-red-50">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Delete
              </button>
            </div>
          )}
        </motion.div>

        {/* Cover image */}
        {post.coverImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="mb-10 rounded-2xl overflow-hidden aspect-[16/9]"
          >
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map(tag => (
              <Link key={tag} to={`/blog?tag=${tag}`} className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-ink-100 hover:text-ink-700 transition-colors">
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <MarkdownRenderer content={post.content} />
        </motion.div>

        {/* Post actions */}
        <div className="flex items-center gap-4 mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-all font-medium text-sm ${
              liked
                ? 'bg-ink-600 text-white border-ink-600'
                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <svg className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {formatNumber(likeCount)}
          </button>

          <button
            onClick={handleBookmark}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm ${
              bookmarked
                ? 'bg-amber-500 text-white border-amber-500'
                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <svg className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            {bookmarked ? 'Saved' : 'Save'}
          </button>

          <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm ml-auto">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            {copied ? 'Copied!' : 'Share'}
          </button>
        </div>

        {/* Author bio card */}
        <div className="card p-6 mt-10 flex gap-4">
          <Link to={`/u/${post.author?.username}`} className="flex-shrink-0">
            <img src={getAvatarUrl(post.author)} alt={post.author?.name} className="w-16 h-16 rounded-full object-cover" />
          </Link>
          <div>
            <p className="text-xs text-gray-400 mb-1">Written by</p>
            <Link to={`/u/${post.author?.username}`} className="font-display font-bold text-lg hover:text-ink-600 transition-colors">
              {post.author?.name}
            </Link>
            <p className="text-sm text-gray-500 mt-1">{post.author?.bio || 'No bio yet.'}</p>
          </div>
        </div>

        {/* Comments */}
        <CommentSection postId={post._id} />
      </article>
    </>
  );
};

export default PostPage;
