const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('Notification service interrupted! Missing or invalid Authorization header');
    return res.status(401).json({ message: 'Notification service interrupted! Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
    };

    next();
  } catch (err) {
    console.log('Notification service interrupted! Invalid or expired token');
    return res.status(401).json({ message: 'Notification service interrupted! Invalid or expired token' });
  }
};
