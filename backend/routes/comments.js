const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getComments, createComment, updateComment, deleteComment, likeComment } = require('../controllers/commentController');

router.get('/:postId', getComments);
router.post('/', protect, createComment);
router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);
router.put('/:id/like', protect, likeComment);

module.exports = router;
