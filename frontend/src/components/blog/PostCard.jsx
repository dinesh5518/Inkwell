import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { timeAgo, formatNumber, getAvatarUrl, stripMarkdown, truncate } from '../../utils/helpers';

const PostCard = ({ post, featured = false, index = 0 }) => {
  const likeCount = post.likes?.length || 0;
  const commentCount = post.commentCount || 0;
  const excerpt = post.excerpt ? stripMarkdown(post.excerpt) : '';

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={`card group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ${featured ? 'md:flex' : ''}`}
    >
      {/* Cover Image */}
      {post.coverImage && (
        <Link
          to={`/post/${post.slug}`}
          className={`block overflow-hidden ${featured ? 'md:w-64 md:flex-shrink-0' : 'aspect-[16/9]'}`}
        >
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>
      )}

      <div className="p-5 flex flex-col flex-1">
        {/* Category & Tags */}
        <div className="flex items-center flex-wrap gap-2 mb-3">
          {post.category && (
            <Link
              to={`/blog?category=${post.category._id}`}
              className="badge text-white text-xs"
              style={{ backgroundColor: post.category.color }}
            >
              {post.category.icon} {post.category.name}
            </Link>
          )}
          {post.tags?.slice(0, 2).map(tag => (
            <Link key={tag} to={`/blog?tag=${tag}`} className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-ink-100 hover:text-ink-700 transition-colors">
              #{tag}
            </Link>
          ))}
        </div>

        {/* Title */}
        <Link to={`/post/${post.slug}`}>
          <h2 className={`font-display font-bold text-gray-900 dark:text-gray-100 group-hover:text-ink-600 dark:group-hover:text-ink-400 transition-colors leading-snug mb-2 ${featured ? 'text-xl' : 'text-lg'}`}>
            {post.title}
          </h2>
        </Link>

        {/* Excerpt */}
        {excerpt && (
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4 flex-1">
            {truncate(excerpt, featured ? 180 : 130)}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Link to={`/u/${post.author?.username}`} className="flex-shrink-0">
              <img
                src={getAvatarUrl(post.author)}
                alt={post.author?.name}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-ink-100 dark:ring-ink-900"
              />
            </Link>
            <div className="text-xs">
              <Link to={`/u/${post.author?.username}`} className="font-medium hover:text-ink-600 transition-colors">
                {post.author?.name}
              </Link>
              <span className="text-gray-400 block">{timeAgo(post.createdAt)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {formatNumber(likeCount)}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {formatNumber(commentCount)}
            </span>
            {post.readingTime && (
              <span>{post.readingTime} min</span>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default PostCard;
