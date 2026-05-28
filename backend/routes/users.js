const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getProfile, updateProfile, changePassword, followUser, getDashboard } = require('../controllers/userController');

router.get('/dashboard', protect, getDashboard);
router.get('/:username', getProfile);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.put('/:id/follow', protect, followUser);

module.exports = router;
