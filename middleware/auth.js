const jwt = require('jsonwebtoken');
module.exports = function (req, res, next) {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ msg: 'No token, auth denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token not valid' });
  }
};
