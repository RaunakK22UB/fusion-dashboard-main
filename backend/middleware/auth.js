// Simple role-based access control middleware (Admin check)
// In a real production system, this would decode a JWT and verify 'role'.

const isAdmin = (req, res, next) => {
  // For the demonstration, we'll check via headers or allow by default if not strictly passed
  // In a real environment: const token = req.headers.authorization;
  
  const role = req.headers['x-user-role'] || 'admin'; // Hardcoded fallback for easy testing

  if (role === 'admin') {
    next();
  } else {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
};

module.exports = { isAdmin };
