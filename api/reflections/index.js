module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://echoes-of-jannah.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const cookies = {};
  req.headers.cookie?.split(';').forEach(cookie => {
    const [key, value] = cookie.trim().split('=');
    cookies[key] = value;
  });
  
  const accessToken = cookies.access_token;
  
  if (!accessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const CLIENT_ID = '911c5b21-975f-4610-be81-f7158e7e6047';
  const API_BASE_URL = 'https://api.quran.foundation/api/v1';
  
  // GET - Fetch reflections
  if (req.method === 'GET') {
    try {
      const response = await fetch(`${API_BASE_URL}/notes?page=1&per_page=50`, {
        headers: {
          'x-auth-token': accessToken,
          'x-client-id': CLIENT_ID
        }
      });
      const data = await response.json();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch reflections' });
    }
  }
  
  // POST - Save reflection
  if (req.method === 'POST') {
    const { verseKey, content, isPublic = false } = req.body;
    
    try {
      const noteResponse = await fetch(`${API_BASE_URL}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': accessToken,
          'x-client-id': CLIENT_ID
        },
        body: JSON.stringify({
          resource_type: 'verse',
          resource_id: verseKey,
          body: content,
          language: 'en'
        })
      });
      
      const noteData = await noteResponse.json();
      
      if (isPublic && noteData.note) {
        await fetch(`${API_BASE_URL}/notes/${noteData.note.id}/publish`, {
          method: 'POST',
          headers: {
            'x-auth-token': accessToken,
            'x-client-id': CLIENT_ID
          }
        });
      }
      
      return res.status(200).json({ success: true, note: noteData.note });
      
    } catch (error) {
      return res.status(500).json({ error: 'Failed to save reflection' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
};