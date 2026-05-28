const Comment = require('../models/Comment');
const Post = require('../models/Post');

// @desc    Get comments for a post
// @route   GET /api/comments/:postId
// @access  Public
exports.getComments = async (req, res, next) => {
  try {
    // Get top-level comments
    const comments = await Comment.find({ post: req.params.postId, parent: null })
      .populate('author', 'name username avatar')
      .populate({
        path: 'replies',
        populate: { path: 'author', select: 'name username avatar' },
        options: { sort: { createdAt: 1 } }
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, comments });
  } catch (error) {
    next(error);
  }
};

// @desc    Create comment
// @route   POST /api/comments
// @access  Private
exports.createComment = async (req, res, next) => {
  try {
    const { content, postId, parentId } = req.body;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const comment = await Comment.create({
      content,
      author: req.user.id,
      post: postId,
      parent: parentId || null
    });

    await comment.populate('author', 'name username avatar');

    res.status(201).json({ success: true, comment });
  } catch (error) {
    next(error);
  }
};

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private (author only)
exports.updateComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    comment.content = req.body.content;
    comment.edited = true;
    await comment.save();
    await comment.populate('author', 'name username avatar');

    res.json({ success: true, comment });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private (author or admin)
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Delete comment and its replies
    await Comment.deleteMany({ $or: [{ _id: req.params.id }, { parent: req.params.id }] });

    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Like/Unlike comment
// @route   PUT /api/comments/:id/like
// @access  Private
exports.likeComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    const liked = comment.likes.includes(req.user.id);
    if (liked) {
      comment.likes.pull(req.user.id);
    } else {
      comment.likes.push(req.user.id);
    }
    await comment.save();

    res.json({ success: true, liked: !liked, likesCount: comment.likes.length });
  } catch (error) {
    next(error);
  }
};
