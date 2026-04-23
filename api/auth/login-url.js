require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const { generatePkcePair, randomString } = require("../../backend/utils/pkce");

const CLIENT_ID = process.env.QF_CLIENT_ID || "911c5b21-975f-4610-be81-f7158e7e6047";
const AUTH_BASE = process.env.QF_AUTH_BASE || "https://prelive-oauth2.quran.foundation";
const REDIRECT_URI = process.env.QF_REDIRECT_URI || "http://localhost:5173/auth/callback";
const SCOPES = "openid offline_access user note post";

module.exports = async (req, res) => {
  const { codeVerifier, codeChallenge } = generatePkcePair();
  const state = randomString();
  const nonce = randomString();

  const pkcePayload = Buffer.from(JSON.stringify({ codeVerifier, state, nonce })).toString("base64");
  const isProduction = process.env.NODE_ENV === "production";

  res.setHeader("Set-Cookie", [
    `qf_pkce=${pkcePayload}; HttpOnly; Path=/; Max-Age=600; SameSite=Lax${isProduction ? "; Secure" : ""}`,
  ]);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    state,
    nonce,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  const authUrl = `${AUTH_BASE}/oauth2/auth?${params.toString()}`;
  return res.status(200).json({ url: authUrl });
};