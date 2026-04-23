import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

const QuranAuthContext = createContext(null);

export function QuranAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const refreshTimer = useRef(null);

  function saveTokens({ accessToken, refreshToken, expiresIn, user }) {
    if (accessToken) sessionStorage.setItem("qf_access_token", accessToken);
    if (refreshToken) localStorage.setItem("qf_refresh_token", refreshToken);
    if (expiresIn) {
      const expiresAt = Date.now() + expiresIn * 1000;
      sessionStorage.setItem("qf_expires_at", String(expiresAt));
    }
    if (user) localStorage.setItem("qf_user", JSON.stringify(user));
  }

  function clearTokens() {
    sessionStorage.removeItem("qf_access_token");
    sessionStorage.removeItem("qf_expires_at");
    localStorage.removeItem("qf_refresh_token");
    localStorage.removeItem("qf_user");
  }

  function loadStoredUser() {
    try {
      const raw = localStorage.getItem("qf_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  const silentRefresh = useCallback(async () => {
    const refreshToken = localStorage.getItem("qf_refresh_token");
    if (!refreshToken) return false;

    try {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) throw new Error("Refresh failed");

      const data = await res.json();
      saveTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken || refreshToken,
        expiresIn: data.expiresIn,
      });
      setAccessToken(data.accessToken);
      return true;
    } catch (err) {
      console.warn("Silent refresh failed:", err.message);
      clearTokens();
      setUser(null);
      setAccessToken(null);
      setIsAuthenticated(false);
      return false;
    }
  }, []);

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      const storedToken = sessionStorage.getItem("qf_access_token");
      const expiresAt = Number(sessionStorage.getItem("qf_expires_at") || "0");
      const storedUser = loadStoredUser();

      if (storedToken && expiresAt > Date.now() + 60000) {
        setAccessToken(storedToken);
        setUser(storedUser);
        setIsAuthenticated(true);
      } else {
        const refreshed = await silentRefresh();
        if (refreshed) {
          setUser(loadStoredUser());
          setIsAuthenticated(true);
        }
      }
      setIsLoading(false);
    }
    init();
  }, []);

  const signIn = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/login-url");
      if (!res.ok) throw new Error("Failed to get login URL");
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      console.error("Login redirect failed:", err.message);
      alert("Could not initiate sign in. Please try again.");
    }
  }, []);

  const signOut = useCallback(() => {
    clearTokens();
    setUser(null);
    setAccessToken(null);
    setIsAuthenticated(false);
  }, []);

  const handleCallback = useCallback(async (code, state) => {
    const res = await fetch("/api/auth/exchange", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, state }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Token exchange failed");
    }

    const data = await res.json();

    saveTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
      user: data.user,
    });

    setAccessToken(data.accessToken);
    setUser(data.user);
    setIsAuthenticated(true);

    return data.user;
  }, []);

  return (
    <QuranAuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated,
        isLoading,
        signIn,
        signOut,
        login: signIn,
        logout: signOut,
        handleCallback,
      }}
    >
      {children}
    </QuranAuthContext.Provider>
  );
}

export function useQuranAuth() {
  const ctx = useContext(QuranAuthContext);
  if (!ctx) throw new Error("useQuranAuth must be used within QuranAuthProvider");
  return ctx;
}