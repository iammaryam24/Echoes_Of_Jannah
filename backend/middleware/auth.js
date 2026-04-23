export function authenticateToken(req, res, next) {
  // Get token from Authorization header or cookie
  const authHeader = req.headers.authorization;
  let token;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    // Fallback to cookie
    const cookies = req.headers.cookie?.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});
    token = cookies?.quran_access_token;
  }
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  req.accessToken = token;
  next();
}