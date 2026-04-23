// src/pages/AuthCallback.jsx
// This page is the OAuth2 redirect target: /auth/callback
// It reads `code` and `state` from the URL, exchanges them for tokens,
// then redirects to the home page (LifeTimeline).

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuranAuth } from "../contexts/QuranAuthContext";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { handleCallback } = useQuranAuth();
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("Completing sign in…");

  useEffect(() => {
    async function exchange() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state");
      const oauthError = params.get("error");

      if (oauthError) {
        setError(`Sign in was cancelled or denied: ${params.get("error_description") || oauthError}`);
        return;
      }

      if (!code || !state) {
        setError("Missing authorization code or state. Please try signing in again.");
        return;
      }

      try {
        setStatus("Verifying your account…");
        await handleCallback(code, state);
        setStatus("Success! Redirecting…");
        // Redirect to LifeTimeline (home) after successful sign in
        navigate("/", { replace: true });
      } catch (err) {
        console.error("Callback error:", err.message);
        setError(err.message || "Sign in failed. Please try again.");
      }
    }

    exchange();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-semibold mb-2 text-red-400">Sign In Failed</h1>
          <p className="text-gray-300 mb-6 text-sm">{error}</p>
          <button
            onClick={() => navigate("/", { replace: true })}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white text-sm font-medium transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <div className="w -12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-300 text-sm">{status}</p>
      </div>
    </div>
  );
}