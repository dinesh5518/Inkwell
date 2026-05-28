import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { commentsAPI } from '../../services/api';
import { timeAgo, getAvatarUrl, getErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';

const CommentItem = ({ comment, onUpdate, onDelete, depth = 0 }) => {
  const { user, isAuthenticated } = useAuth();
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [editText, setEditText] = useState(comment.content);
  const [liked, setLiked] = useState(comment.likes?.includes(user?._id));
  const [likeCount, setLikeCount] = useState(comment.likes?.length || 0);
  const [submitting, setSubmitting] = useState(false);
  const [showReplies, setShowReplies] = useState(true);

  const isAuthor = user?._id === comment.author?._id;

  const handleLike = async () => {
    if (!isAuthenticated) { toast.error('Please log in to like'); return; }
    try {
      const { data } = await commentsAPI.like(comment._id);
      setLiked(data.liked);
      setLikeCount(data.likesCount);
    } catch (e) { toast.error(getErrorMessage(e)); }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await commentsAPI.create({ content: replyText, postId: comment.post, parentId: comment._id });
      onUpdate({ ...comment, replies: [...(comment.replies || []), data.comment] });
      setReplyText('');
      setReplying(false);
      toast.success('Reply added!');
    } catch (e) { toast.error(getErrorMessage(e)); }
    finally { setSubmitting(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editText.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await commentsAPI.update(comment._id, { content: editText });
      onUpdate({ ...comment, content: data.comment.content, edited: true });
      setEditing(false);
      toast.success('Comment updated!');
    } catch (e) { toast.error(getErrorMessage(e)); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this comment?')) return;
    try {
      await commentsAPI.delete(comment._id);
      onDelete(comment._id);
      toast.success('Comment deleted');
    } catch (e) { toast.error(getErrorMessage(e)); }
  };

  return (
    <div className={`${depth > 0 ? 'ml-8 pl-4 border-l-2 border-gray-100 dark:border-gray-800' : ''}`}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-3 py-4"
      >
        <img
          src={getAvatarUrl(comment.author)}
          alt={comment.author?.name}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{comment.author?.name}</span>
            <span className="text-gray-400 text-xs">@{comment.author?.username}</span>
            <span className="text-gray-300 dark:text-gray-600 text-xs">·</span>
            <span className="text-gray-400 text-xs">{timeAgo(comment.createdAt)}</span>
            {comment.edited && <span className="text-gray-400 text-xs italic">(edited)</span>}
          </div>

          {editing ? (
            <form onSubmit={handleEdit} className="space-y-2">
              <textarea
                value={editText}
                onChange={e => setEditText(e.target.value)}
                className="input text-sm resize-none"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2">
                <button type="submit" disabled={submitting} className="btn-primary text-xs py-1.5 px-3">Save</button>
                <button type="button" onClick={() => setEditing(false)} className="btn-secondary text-xs py-1.5 px-3">Cancel</button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 mt-2">
            <button onClick={handleLike} className={`flex items-center gap-1 text-xs transition-colors ${liked ? 'text-ink-600' : 'text-gray-400 hover:text-ink-600'}`}>
              <svg className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {likeCount > 0 && likeCount}
            </button>

            {isAuthenticated && depth === 0 && (
              <button onClick={() => setReplying(r => !r)} className="text-xs text-gray-400 hover:text-ink-600 transition-colors">
                Reply
              </button>
            )}

            {comment.replies?.length > 0 && (
              <button onClick={() => setShowReplies(r => !r)} className="text-xs text-gray-400 hover:text-ink-600 transition-colors">
                {showReplies ? 'Hide' : `Show ${comment.replies.length}`} replies
              </button>
            )}

            {isAuthor && !editing && (
              <>
                <button onClick={() => setEditing(true)} className="text-xs text-gray-400 hover:text-ink-600 transition-colors">Edit</button>
                <button onClick={handleDelete} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Delete</button>
              </>
            )}
          </div>

          {/* Reply form */}
          <AnimatePresence>
            {replying && (
              <motion.form
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                onSubmit={handleReply}
                className="mt-3 space-y-2 overflow-hidden"
              >
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder={`Reply to ${comment.author?.name}...`}
                  className="input text-sm resize-none"
                  rows={2}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button type="submit" disabled={submitting || !replyText.trim()} className="btn-primary text-xs py-1.5 px-3">Reply</button>
                  <button type="button" onClick={() => setReplying(false)} className="btn-secondary text-xs py-1.5 px-3">Cancel</button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Nested replies */}
      <AnimatePresence>
        {showReplies && comment.replies?.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {comment.replies.map(reply => (
              <CommentItem
                key={reply._id}
                comment={reply}
                onUpdate={(updated) => {
                  onUpdate({
                    ...comment,
                    replies: comment.replies.map(r => r._id === updated._id ? updated : r)
                  });
                }}
                onDelete={(id) => {
                  onUpdate({ ...comment, replies: comment.replies.filter(r => r._id !== id) });
                }}
                depth={depth + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CommentSection = ({ postId }) => {
  const { isAuthenticated, user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useState(() => {
    const load = async () => {
      try {
        const { data } = await commentsAPI.getByPost(postId);
        setComments(data.comments);
      } catch (e) {}
      finally { setLoading(false); }
    };
    load();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await commentsAPI.create({ content: newComment, postId });
      setComments(prev => [data.comment, ...prev]);
      setNewComment('');
      toast.success('Comment posted!');
    } catch (e) { toast.error(getErrorMessage(e)); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
      <h3 className="font-display text-2xl font-bold mb-6">
        Discussion {comments.length > 0 && <span className="text-gray-400 text-lg font-normal">({comments.length})</span>}
      </h3>

      {/* Add comment */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
          <img src={getAvatarUrl(user)} alt={user?.name} className="w-9 h-9 rounded-full flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="input text-sm resize-none mb-2"
              rows={3}
            />
            <button type="submit" disabled={submitting || !newComment.trim()} className="btn-primary text-sm py-2">
              {submitting ? 'Posting...' : 'Post comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="card p-5 text-center mb-8 bg-ink-50 dark:bg-ink-950/30 border-ink-100 dark:border-ink-900">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Join the discussion</p>
          <div className="flex gap-3 justify-center">
            <a href="/login" className="btn-primary text-sm py-2">Log in to comment</a>
            <a href="/register" className="btn-secondary text-sm py-2">Sign up</a>
          </div>
        </div>
      )}

      {/* Comment list */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="skeleton w-8 h-8 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3 w-32" />
                <div className="skeleton h-3 w-full" />
                <div className="skeleton h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <svg className="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-sm">No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
          {comments.map(comment => (
            <CommentItem
              key={comment._id}
              comment={comment}
              onUpdate={(updated) => setComments(prev => prev.map(c => c._id === updated._id ? updated : c))}
              onDelete={(id) => setComments(prev => prev.filter(c => c._id !== id))}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
