import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/blog/PostCard';
import { ProfileSkeleton, CardSkeleton } from '../components/common/Skeletons';
import { getAvatarUrl, formatNumber, formatDate, getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { username } = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await usersAPI.getProfile(username);
        setProfile(data.user);
        setPosts(data.posts);
        setFollowing(data.user.followers?.includes(currentUser?._id));
      } catch (e) {
        toast.error('Profile not found');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [username, currentUser]);

  const handleFollow = async () => {
    if (!isAuthenticated) { toast.error('Please log in to follow'); return; }
    setFollowLoading(true);
    try {
      const { data } = await usersAPI.follow(profile._id);
      setFollowing(data.following);
      setProfile(prev => ({
        ...prev,
        followers: data.following
          ? [...(prev.followers || []), currentUser._id]
          : (prev.followers || []).filter(id => id !== currentUser._id)
      }));
      toast.success(data.following ? `Following ${profile.name}` : 'Unfollowed');
    } catch (e) { toast.error(getErrorMessage(e)); }
    finally { setFollowLoading(false); }
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <ProfileSkeleton />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
      </div>
    </div>
  );

  if (!profile) return (
    <div className="text-center py-20 text-gray-400">Profile not found</div>
  );

  const isOwner = currentUser?._id === profile._id || currentUser?.username === username;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Profile header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Cover image */}
        <div className="h-40 rounded-2xl overflow-hidden bg-gradient-to-r from-ink-600 to-purple-600 mb-0">
          {profile.coverImage && (
            <img src={profile.coverImage} alt="Cover" className="w-full h-full object-cover" />
          )}
        </div>

        {/* Avatar + actions */}
        <div className="flex items-end justify-between px-2 -mt-12 mb-6">
          <img
            src={getAvatarUrl(profile)}
            alt={profile.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-950 shadow-lg"
          />
          <div className="flex gap-2 mb-2">
            {isOwner ? (
              <Link to="/settings" className="btn-secondary text-sm py-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit profile
              </Link>
            ) : (
              <button
                onClick={handleFollow}
                disabled={followLoading}
                className={following ? 'btn-secondary text-sm py-2' : 'btn-primary text-sm py-2'}
              >
                {following ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold">{profile.name}</h1>
          <p className="text-gray-400 text-sm mb-3">@{profile.username}</p>
          {profile.bio && <p className="text-gray-600 dark:text-gray-300 max-w-xl">{profile.bio}</p>}

          {/* Links */}
          <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-400">
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-ink-600 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                Website
              </a>
            )}
            {profile.social?.twitter && (
              <a href={`https://twitter.com/${profile.social.twitter}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-ink-600 transition-colors">
                𝕏 {profile.social.twitter}
              </a>
            )}
            {profile.social?.github && (
              <a href={`https://github.com/${profile.social.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-ink-600 transition-colors">
                GitHub
              </a>
            )}
            <span>Joined {formatDate(profile.createdAt, 'MMMM yyyy')}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6 text-sm border-t border-gray-100 dark:border-gray-800 pt-5 mb-10">
          <div><span className="font-bold text-lg">{formatNumber(posts.length)}</span><span className="text-gray-400 ml-1">posts</span></div>
          <div><span className="font-bold text-lg">{formatNumber(profile.followers?.length || 0)}</span><span className="text-gray-400 ml-1">followers</span></div>
          <div><span className="font-bold text-lg">{formatNumber(profile.following?.length || 0)}</span><span className="text-gray-400 ml-1">following</span></div>
        </div>
      </motion.div>

      {/* Posts */}
      <section>
        <h2 className="font-display text-xl font-bold mb-6">Articles by {profile.name}</h2>
        {posts.length === 0 ? (
          <div className="text-center py-12 text-gray-400 card">
            <p className="text-sm">No published articles yet.</p>
            {isOwner && <Link to="/write" className="btn-primary text-sm mt-4 inline-flex">Write your first post</Link>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post, i) => <PostCard key={post._id} post={post} index={i} />)}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProfilePage;
