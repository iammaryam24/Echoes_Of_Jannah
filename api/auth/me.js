// /api/auth/me.js
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const accessToken = authHeader.substring(7);
    const oauthUrl = process.env.VITE_QURAN_FOUNDATION_OAUTH_URL;
    
    const response = await fetch(`${oauthUrl}/oauth/userinfo`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch user info' });
    }
    
    const userInfo = await response.json();
    res.status(200).json(userInfo);
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ error: 'Failed to fetch user info' });
  }
}