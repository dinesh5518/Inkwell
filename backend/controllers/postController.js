const Post = require('../models/Post');
const Comment = require('../models/Comment');

// @desc    Get all published posts with filtering/pagination
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, category, tag, sort = 'latest', author } = req.query;
    const skip = (page - 1) * limit;

    const query = { status: 'published' };

    if (search) {
      query.$text = { $search: search };
    }
    if (category) query.category = category;
    if (tag) query.tags = { $in: [tag.toLowerCase()] };
    if (author) query.author = author;

    const sortOptions = {
      latest: { createdAt: -1 },
      popular: { views: -1 },
      trending: { likes: -1, createdAt: -1 },
      oldest: { createdAt: 1 }
    };

    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate('author', 'name username avatar')
        .populate('category', 'name slug color')
        .populate('commentCount')
        .sort(sortOptions[sort] || sortOptions.latest)
        .skip(skip)
        .limit(parseInt(limit))
        .select('-content'),
      Post.countDocuments(query)
    ]);

    res.json({
      success: true,
      posts,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post by slug or id
// @route   GET /api/posts/:id
// @access  Public (with optional auth for like status)
exports.getPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { slug: id };
    query.status = 'published';

    const post = await Post.findOne(query)
      .populate('author', 'name username avatar bio social followers')
      .populate('category', 'name slug color icon');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Increment views
    await Post.findByIdAndUpdate(post._id, { $inc: { views: 1 } });

    res.json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's own posts (any status)
// @route   GET /api/posts/my/posts
// @access  Private
exports.getMyPosts = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { author: req.user.id };
    if (status) query.status = status;

    const posts = await Post.find(query)
      .populate('category', 'name slug color')
      .populate('commentCount')
      .sort({ updatedAt: -1 })
      .select('-content');

    res.json({ success: true, posts });
  } catch (error) {
    next(error);
  }
};

// @desc    Create post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res, next) => {
  try {
    const { title, content, excerpt, coverImage, tags, category, status, seoTitle, seoDescription } = req.body;

    const post = await Post.create({
      title,
      content,
      excerpt,
      coverImage: coverImage || '',
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      category: category || undefined,
      status: status || 'draft',
      author: req.user.id,
      seoTitle: seoTitle || '',
      seoDescription: seoDescription || ''
    });

    await post.populate('author', 'name username avatar');
    res.status(201).json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private (author or admin)
exports.updatePost = async (req, res, next) => {
  try {
    let post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { title, content, excerpt, coverImage, tags, category, status, featured, seoTitle, seoDescription } = req.body;
    const updates = { title, content, excerpt, coverImage, status, seoTitle, seoDescription };
    if (tags) updates.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
    if (category !== undefined) updates.category = category || null;
    if (req.user.role === 'admin' && featured !== undefined) updates.featured = featured;

    Object.assign(post, updates);
    await post.save();
    await post.populate('author', 'name username avatar');
    await post.populate('category', 'name slug color');

    res.json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private (author or admin)
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Promise.all([
      Post.findByIdAndDelete(req.params.id),
      Comment.deleteMany({ post: req.params.id })
    ]);

    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Like/Unlike post
// @route   PUT /api/posts/:id/like
// @access  Private
exports.likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const liked = post.likes.includes(req.user.id);
    if (liked) {
      post.likes.pull(req.user.id);
    } else {
      post.likes.push(req.user.id);
    }
    await post.save();

    res.json({ success: true, liked: !liked, likesCount: post.likes.length });
  } catch (error) {
    next(error);
  }
};

// @desc    Bookmark/Unbookmark post
// @route   PUT /api/posts/:id/bookmark
// @access  Private
exports.bookmarkPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const User = require('../models/User');
    const user = await User.findById(req.user.id);

    const bookmarked = user.bookmarks.includes(req.params.id);
    if (bookmarked) {
      user.bookmarks.pull(req.params.id);
      post.bookmarks.pull(req.user.id);
    } else {
      user.bookmarks.push(req.params.id);
      post.bookmarks.push(req.user.id);
    }

    await Promise.all([user.save({ validateBeforeSave: false }), post.save()]);

    res.json({ success: true, bookmarked: !bookmarked });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured/trending posts
// @route   GET /api/posts/featured
// @access  Public
exports.getFeatured = async (req, res, next) => {
  try {
    const [featured, trending, latest] = await Promise.all([
      Post.find({ status: 'published', featured: true }).populate('author', 'name username avatar').populate('category', 'name slug color').sort({ createdAt: -1 }).limit(5).select('-content'),
      Post.find({ status: 'published' }).populate('author', 'name username avatar').populate('category', 'name slug color').sort({ views: -1, likes: -1 }).limit(6).select('-content'),
      Post.find({ status: 'published' }).populate('author', 'name username avatar').populate('category', 'name slug color').sort({ createdAt: -1 }).limit(9).select('-content')
    ]);

    res.json({ success: true, featured, trending, latest });
  } catch (error) {
    next(error);
  }
};
