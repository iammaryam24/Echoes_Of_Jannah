require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });

const CLIENT_ID = process.env.QF_CLIENT_ID || "911c5b21-975f-4610-be81-f7158e7e6047";
const CLIENT_SECRET = process.env.QF_CLIENT_SECRET || "oESUyMXqqRSkQP8HBRmATrZlwp";
const AUTH_BASE = process.env.QF_AUTH_BASE || "https://prelive-oauth2.quran.foundation";

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: "Missing refreshToken" });
  }

  try {
    const params = new URLSearchParams();
    params.append("grant_type", "refresh_token");
    params.append("refresh_token", refreshToken);

    const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

    const tokenRes = await fetch(`${AUTH_BASE}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: params.toString(),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error("Refresh failed:", tokenRes.status, errText);
      return res.status(tokenRes.status).json({ error: "Failed to refresh" });
    }

    const tokenData = await tokenRes.json();

    return res.status(200).json({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
    });
  } catch (err) {
    console.error("Refresh error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};