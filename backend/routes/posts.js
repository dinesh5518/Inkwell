const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const {
  getPosts, getPost, createPost, updatePost, deletePost,
  likePost, bookmarkPost, getFeatured, getMyPosts
} = require('../controllers/postController');

router.get('/featured', getFeatured);
router.get('/my/posts', protect, getMyPosts);
router.get('/', optionalAuth, getPosts);
router.get('/:id', optionalAuth, getPost);
router.post('/', protect, createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.put('/:id/like', protect, likePost);
router.put('/:id/bookmark', protect, bookmarkPost);

module.exports = router;
