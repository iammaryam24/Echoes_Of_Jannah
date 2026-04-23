// /api/auth/callback.js
export default async function handler(req, res) {
  // This endpoint is not directly used - the client handles the callback
  // It's here for completeness if needed for server-side handling
  res.status(200).json({ message: 'Callback endpoint ready' });
}