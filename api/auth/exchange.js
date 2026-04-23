require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });

const CLIENT_ID = process.env.QF_CLIENT_ID || "911c5b21-975f-4610-be81-f7158e7e6047";
const CLIENT_SECRET = process.env.QF_CLIENT_SECRET || "oESUyMXqqRSkQP8HBRmATrZlwp";
const AUTH_BASE = process.env.QF_AUTH_BASE || "https://prelive-oauth2.quran.foundation";
const REDIRECT_URI = process.env.QF_REDIRECT_URI || "http://localhost:5173/auth/callback";

function parseCookies(cookieHeader = "") {
  return Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, decodeURIComponent(v.join("="))];
    }).filter(([k]) => k)
  );
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { code, state } = req.body;
    if (!code || !state) {
      return res.status(400).json({ error: "Missing code or state" });
    }

    const cookies = parseCookies(req.headers.cookie || "");
    const pkceRaw = cookies["qf_pkce"];
    if (!pkceRaw) {
      return res.status(400).json({ error: "PKCE cookie missing or expired. Please sign in again." });
    }

    let pkce;
    try {
      pkce = JSON.parse(Buffer.from(pkceRaw, "base64").toString("utf8"));
    } catch {
      return res.status(400).json({ error: "Invalid PKCE cookie" });
    }

    if (pkce.state !== state) {
      return res.status(400).json({ error: "State mismatch" });
    }

    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", REDIRECT_URI);
    params.append("code_verifier", pkce.codeVerifier);

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
      console.error("Token exchange failed:", tokenRes.status, errText);
      return res.status(tokenRes.status).json({ error: "Token exchange failed" });
    }

    const tokenData = await tokenRes.json();

    res.setHeader("Set-Cookie", [`qf_pkce=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`]);

    let user = null;
    if (tokenData.id_token) {
      try {
        const payload = tokenData.id_token.split(".")[1];
        user = JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
      } catch {}
    }

    return res.status(200).json({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      idToken: tokenData.id_token,
      expiresIn: tokenData.expires_in,
      scope: tokenData.scope,
      user,
    });
  } catch (err) {
    console.error("Exchange error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};