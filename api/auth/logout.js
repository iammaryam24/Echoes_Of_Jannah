// /api/auth/logout.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { accessToken } = req.body;
    const oauthUrl = process.env.VITE_QURAN_FOUNDATION_OAUTH_URL;
    
    if (accessToken) {
      // Optionally revoke the token
      await fetch(`${oauthUrl}/oauth/revoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          token: accessToken,
          client_id: process.env.VITE_QURAN_FOUNDATION_CLIENT_ID,
          client_secret: process.env.QURAN_FOUNDATION_CLIENT_SECRET
        })
      });
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
}