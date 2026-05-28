const User = require('../models/User');
const Post = require('../models/Post');

// @desc    Get user public profile
// @route   GET /api/users/:username
// @access  Public
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password -bookmarks');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const posts = await Post.find({ author: user._id, status: 'published' })
      .populate('category', 'name slug color')
      .populate('commentCount')
      .sort({ createdAt: -1 })
      .select('-content')
      .limit(20);

    res.json({ success: true, user, posts });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, bio, avatar, coverImage, website, social } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (avatar !== undefined) updates.avatar = avatar;
    if (coverImage !== undefined) updates.coverImage = coverImage;
    if (website !== undefined) updates.website = website;
    if (social) updates.social = social;

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true }).select('-password');

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/users/password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Follow/Unfollow user
// @route   PUT /api/users/:id/follow
// @access  Private
exports.followUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
    }

    const [targetUser, currentUser] = await Promise.all([
      User.findById(req.params.id),
      User.findById(req.user.id)
    ]);

    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

    const isFollowing = currentUser.following.includes(req.params.id);

    if (isFollowing) {
      currentUser.following.pull(req.params.id);
      targetUser.followers.pull(req.user.id);
    } else {
      currentUser.following.push(req.params.id);
      targetUser.followers.push(req.user.id);
    }

    await Promise.all([
      currentUser.save({ validateBeforeSave: false }),
      targetUser.save({ validateBeforeSave: false })
    ]);

    res.json({ success: true, following: !isFollowing, followerCount: targetUser.followers.length });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user dashboard stats
// @route   GET /api/users/dashboard
// @access  Private
exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [totalPosts, publishedPosts, draftPosts, myPosts] = await Promise.all([
      Post.countDocuments({ author: userId }),
      Post.countDocuments({ author: userId, status: 'published' }),
      Post.countDocuments({ author: userId, status: 'draft' }),
      Post.find({ author: userId }).sort({ createdAt: -1 }).limit(5).select('title slug status views likes createdAt')
    ]);

    const totalLikes = myPosts.reduce((acc, p) => acc + (p.likes?.length || 0), 0);
    const totalViews = myPosts.reduce((acc, p) => acc + (p.views || 0), 0);

    res.json({
      success: true,
      stats: { totalPosts, publishedPosts, draftPosts, totalLikes, totalViews },
      recentPosts: myPosts
    });
  } catch (error) {
    next(error);
  }
};
