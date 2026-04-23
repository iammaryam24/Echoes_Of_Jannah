import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Proxy Quran API requests with authentication
router.get('/verses/:chapter/:verse', authenticateToken, async (req, res) => {
  try {
    const { chapter, verse } = req.params;
    const accessToken = req.accessToken;
    
    const response = await fetch(
      `https://api.quran.foundation/v1/quran/verses/${chapter}/${verse}`,
      {
        headers: {
          'x-auth-token': accessToken,
          'x-client-id': process.env.QURAN_CLIENT_ID,
        },
      }
    );
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/chapters', authenticateToken, async (req, res) => {
  try {
    const accessToken = req.accessToken;
    
    const response = await fetch('https://api.quran.foundation/v1/quran/chapters', {
      headers: {
        'x-auth-token': accessToken,
        'x-client-id': process.env.QURAN_CLIENT_ID,
      },
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;