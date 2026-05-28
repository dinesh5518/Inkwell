import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { postsAPI, categoriesAPI } from '../services/api';
import PostCard from '../components/blog/PostCard';
import { CardSkeleton } from '../components/common/Skeletons';
import { getErrorMessage } from '../utils/helpers';

const Hero = () => (
  <section className="relative overflow-hidden bg-gradient-to-br from-ink-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-ink-950 pt-24 pb-20">
    {/* Background decorations */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-ink-200/30 dark:bg-ink-900/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-purple-200/30 dark:bg-purple-900/20 rounded-full blur-3xl" />
    </div>

    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="inline-flex items-center gap-2 badge bg-ink-100 dark:bg-ink-900/50 text-ink-700 dark:text-ink-300 mb-6 text-sm px-4 py-1.5">
          ✨ A home for great writing
        </span>

        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
          Where ideas
          <br />
          <span className="text-gradient">come to life</span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Discover thoughtful articles from independent writers. Share your expertise, connect with readers, and grow your audience.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register" className="btn-primary text-base py-3 px-8 shadow-lg shadow-ink-200 dark:shadow-ink-900/30">
            Start writing today
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link to="/blog" className="btn-secondary text-base py-3 px-8">
            Explore articles
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex flex-wrap gap-8 justify-center mt-16 text-center"
      >
        {[
          { label: 'Writers', value: '10K+' },
          { label: 'Articles', value: '50K+' },
          { label: 'Readers', value: '200K+' }
        ].map(stat => (
          <div key={stat.label}>
            <p className="text-3xl font-display font-bold text-ink-600">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </motion.div>
    </div>
  </section>
);

const HomePage = () => {
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [latest, setLatest] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [featRes, catRes] = await Promise.all([
          postsAPI.getFeatured(),
          categoriesAPI.getAll()
        ]);
        setFeatured(featRes.data.featured || []);
        setTrending(featRes.data.trending || []);
        setLatest(featRes.data.latest || []);
        setCategories(catRes.data.categories || []);
      } catch (e) {
        console.error(getErrorMessage(e));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const displayFeatured = featured.length > 0 ? featured : trending;

  return (
    <div>
      <Hero />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-20">

        {/* Categories */}
        {categories.length > 0 && (
          <section>
            <h2 className="font-display text-2xl font-bold mb-6">Browse Topics</h2>
            <div className="flex flex-wrap gap-3">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={`/blog?category=${cat._id}`}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-ink-400 hover:bg-ink-50 dark:hover:bg-ink-950/50 transition-all group text-sm font-medium"
                  >
                    <span className="text-base">{cat.icon}</span>
                    <span>{cat.name}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Featured Posts */}
        {(loading || displayFeatured.length > 0) && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold">Featured Stories</h2>
              <Link to="/blog?sort=popular" className="text-sm text-ink-600 hover:text-ink-700 font-medium">View all →</Link>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayFeatured.slice(0, 3).map((post, i) => (
                  <PostCard key={post._id} post={post} index={i} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Trending + Latest side-by-side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Latest (wider) */}
          <section className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold">Latest Articles</h2>
              <Link to="/blog" className="text-sm text-ink-600 hover:text-ink-700 font-medium">Explore →</Link>
            </div>
            {loading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : latest.length === 0 ? (
              <div className="card p-10 text-center text-gray-400">
                <p>No posts yet. <Link to="/write" className="text-ink-600 hover:underline">Be the first to write!</Link></p>
              </div>
            ) : (
              <div className="space-y-5">
                {latest.slice(0, 5).map((post, i) => (
                  <PostCard key={post._id} post={post} index={i} featured />
                ))}
              </div>
            )}
          </section>

          {/* Trending sidebar */}
          <aside>
            <h2 className="font-display text-2xl font-bold mb-6">Trending</h2>
            <div className="space-y-4">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="skeleton w-10 h-10 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-3 w-full" />
                      <div className="skeleton h-3 w-3/4" />
                    </div>
                  </div>
                ))
              ) : (
                trending.slice(0, 6).map((post, i) => (
                  <motion.div
                    key={post._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex gap-3 group"
                  >
                    <span className="text-3xl font-display font-bold text-gray-100 dark:text-gray-800 flex-shrink-0 w-8 text-right leading-none mt-1">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <Link to={`/post/${post.slug}`} className="text-sm font-medium group-hover:text-ink-600 transition-colors leading-snug block mb-1">
                        {post.title}
                      </Link>
                      <p className="text-xs text-gray-400">{post.author?.name} · {post.readingTime} min read</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </aside>
        </div>

        {/* CTA Newsletter */}
        <section className="card bg-gradient-to-br from-ink-600 to-purple-600 border-0 text-white p-10 text-center">
          <h2 className="font-display text-3xl font-bold mb-3">Never miss a great story</h2>
          <p className="text-ink-100 mb-6 max-w-md mx-auto">Join thousands of readers and writers building the next great ideas.</p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-white text-ink-700 font-semibold px-8 py-3 rounded-xl hover:bg-ink-50 transition-colors shadow-lg">
            Create your free account
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
