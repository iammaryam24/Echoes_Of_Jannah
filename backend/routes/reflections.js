// src/api/reflections.js
// Syncs reflections with Quran Foundation APIs:
// - Private reflections → POST /auth/v1/notes
// - Public posts → POST /auth/v1/posts
// All calls use x-auth-token + x-client-id headers via authFetch from context.

/**
 * Create a private note (reflection) on Quran Foundation
 * @param {Function} authFetch - from useQuranAuth()
 * @param {{ verseKey: string, text: string, chapterId?: number, verseNumber?: number }} data
 */
export async function createNote(authFetch, { verseKey, text, chapterId, verseNumber }) {
  const body = {
    verse_key: verseKey,
    body: text,
    ...(chapterId && { chapter_id: chapterId }),
    ...(verseNumber && { verse_number: verseNumber }),
  };

  const res = await authFetch("/auth/v1/notes", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to save note");
  }

  return res.json();
}

/**
 * Publish a note (makes it public on Quran Reflect)
 * @param {Function} authFetch
 * @param {string} noteId
 */
export async function publishNote(authFetch, noteId) {
  const res = await authFetch(`/auth/v1/notes/${noteId}/publish`, {
    method: "POST",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to publish note");
  }

  return res.json();
}

/**
 * Create a public post directly on Quran Reflect
 * @param {Function} authFetch
 * @param {{ verseKey: string, text: string }} data
 */
export async function createPost(authFetch, { verseKey, text }) {
  const body = {
    verse_key: verseKey,
    body: text,
  };

  const res = await authFetch("/auth/v1/posts", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create post");
  }

  return res.json();
}

/**
 * Get all notes for the current user
 * @param {Function} authFetch
 */
export async function getUserNotes(authFetch) {
  const res = await authFetch("/auth/v1/notes", { method: "GET" });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch notes");
  }

  return res.json();
}

/**
 * Save reflection — tries QF API first, falls back to localStorage
 * @param {Function|null} authFetch - null if not authenticated
 * @param {{ verseKey: string, text: string, isPublic?: boolean }} data
 */
export async function saveReflection(authFetch, { verseKey, text, isPublic = false }) {
  // Always save locally as backup
  const local = JSON.parse(localStorage.getItem("reflections") || "[]");
  const entry = { id: Date.now(), verseKey, text, isPublic, createdAt: new Date().toISOString() };
  local.unshift(entry);
  localStorage.setItem("reflections", JSON.stringify(local.slice(0, 100))); // keep last 100

  if (!authFetch) return { local: entry, synced: false };

  try {
    if (isPublic) {
      const post = await createPost(authFetch, { verseKey, text });
      return { local: entry, synced: true, remote: post };
    } else {
      const note = await createNote(authFetch, { verseKey, text });
      return { local: entry, synced: true, remote: note };
    }
  } catch (err) {
    console.warn("Could not sync to QF, saved locally only:", err.message);
    return { local: entry, synced: false, error: err.message };
  }
}