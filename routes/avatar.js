const express = require('express');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const User = require('../models/User');

const router = express.Router();

// Upload avatar
router.post('/me/avatar', auth, upload.single('avatar'), async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: req.file.path },
      { new: true }
    );
    res.json({ avatar: user.avatar });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
