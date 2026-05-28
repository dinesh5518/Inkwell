const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { getStats, getUsers, updateUser, deletePost, createCategory, deleteCategory } = require('../controllers/adminController');

router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/posts/:id', deletePost);
router.post('/categories', createCategory);
router.delete('/categories/:id', deleteCategory);

module.exports = router;
