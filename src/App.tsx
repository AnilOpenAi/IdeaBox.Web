import React, { useEffect, useState } from "react";
import {
  register,
  login,
  getIdeas,
  createIdea,
  likeIdea,
  unlikeIdea,
} from "./api";
import type { Idea, PagedResult } from "./types";

const PAGE_SIZE = 5;

function App() {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("token")
  );
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("Test123!");
  const [authMode, setAuthMode] = useState<"login" | "register">("register");

  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!token;

  useEffect(() => {
    if (isAuthenticated) {
      void loadIdeas(page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, page]);

  async function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      const fn = authMode === "login" ? login : register;
      const res = await fn(email, password);
      setToken(res.token);
      localStorage.setItem("token", res.token);
    } catch (err: any) {
      setError(err.message ?? "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function loadIdeas(p: number) {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const res: PagedResult<Idea> = await getIdeas(token, p, PAGE_SIZE);
      setIdeas(res.items);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      setError(err.message ?? "Failed to load ideas");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateIdea(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (!newTitle.trim() || !newDescription.trim()) {
      setError("Title and description are required");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await createIdea(token, newTitle.trim(), newDescription.trim());
      setNewTitle("");
      setNewDescription("");
      setPage(1);
      await loadIdeas(1);
    } catch (err: any) {
      setError(err.message ?? "Failed to create idea");
    } finally {
      setLoading(false);
    }
  }

  async function handleLike(id: string) {
    if (!token) return;
    try {
      await likeIdea(token, id);
      await loadIdeas(page);
    } catch (err: any) {
      setError(err.message ?? "Failed to like");
    }
  }

  async function handleUnlike(id: string) {
    if (!token) return;
    try {
      await unlikeIdea(token, id);
      await loadIdeas(page);
    } catch (err: any) {
      setError(err.message ?? "Failed to unlike");
    }
  }

  function handleLogout() {
    setToken(null);
    localStorage.removeItem("token");
    setIdeas([]);
  }

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "2rem",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <h1>IdeaBox</h1>
      <p style={{ color: "#555" }}>
        Simple frontend for the IdeaBox backend (login, list, like/unlike).
      </p>

      {!isAuthenticated ? (
        <section
          style={{
            marginTop: "2rem",
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: "1.5rem",
          }}
        >
          <h2>{authMode === "login" ? "Login" : "Register"}</h2>

          <div style={{ marginBottom: "1rem" }}>
            <button
              type="button"
              onClick={() => setAuthMode("register")}
              style={{
                marginRight: "0.5rem",
                padding: "0.25rem 0.75rem",
                borderRadius: 6,
                border:
                  authMode === "register" ? "2px solid #007acc" : "1px solid #ccc",
                background:
                  authMode === "register" ? "#e6f2ff" : "transparent",
              }}
            >
              Register
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("login")}
              style={{
                padding: "0.25rem 0.75rem",
                borderRadius: 6,
                border:
                  authMode === "login" ? "2px solid #007acc" : "1px solid #ccc",
                background: authMode === "login" ? "#e6f2ff" : "transparent",
              }}
            >
              Login
            </button>
          </div>

          <form onSubmit={handleAuthSubmit}>
            <div style={{ marginBottom: "0.75rem" }}>
              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ display: "block", width: "100%", padding: "0.5rem" }}
                />
              </label>
            </div>

            <div style={{ marginBottom: "0.75rem" }}>
              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ display: "block", width: "100%", padding: "0.5rem" }}
                />
              </label>
            </div>

            {error && (
              <div style={{ color: "red", marginBottom: "0.75rem" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "0.5rem 1.25rem",
                borderRadius: 6,
                border: "none",
                background: "#007acc",
                color: "white",
                cursor: "pointer",
              }}
            >
              {loading ? "Please wait..." : "Submit"}
            </button>
          </form>
        </section>
      ) : (
        <>
          <section
            style={{
              marginTop: "1rem",
              marginBottom: "1.5rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>Logged in as: {email}</div>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                padding: "0.25rem 0.75rem",
                borderRadius: 6,
                border: "1px solid #ccc",
                background: "white",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </section>

          <section
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: "1.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <h2>Create new idea</h2>
            <form onSubmit={handleCreateIdea}>
              <div style={{ marginBottom: "0.75rem" }}>
                <label>
                  Title
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    style={{ display: "block", width: "100%", padding: "0.5rem" }}
                  />
                </label>
              </div>

              <div style={{ marginBottom: "0.75rem" }}>
                <label>
                  Description
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    style={{ display: "block", width: "100%", padding: "0.5rem" }}
                    rows={3}
                  />
                </label>
              </div>

              {error && (
                <div style={{ color: "red", marginBottom: "0.75rem" }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "0.5rem 1.25rem",
                  borderRadius: 6,
                  border: "none",
                  background: "#28a745",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Create
              </button>
            </form>
          </section>

          <section
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: "1.5rem",
            }}
          >
            <h2>Ideas</h2>

            {loading && ideas.length === 0 && <p>Loading ideas...</p>}

            {ideas.length === 0 && !loading && <p>No ideas yet.</p>}

            <ul style={{ listStyle: "none", padding: 0 }}>
              {ideas.map((idea) => (
                <li
                  key={idea.id}
                  style={{
                    borderBottom: "1px solid #eee",
                    padding: "0.75rem 0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <strong>{idea.title}</strong>
                      <div style={{ fontSize: 12, color: "#666" }}>
                        {new Date(idea.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span style={{ marginRight: "0.75rem" }}>
                        👍 {idea.voteCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleLike(idea.id)}
                        style={{
                          marginRight: "0.25rem",
                          padding: "0.25rem 0.5rem",
                          borderRadius: 6,
                          border: "1px solid #ccc",
                          background: "white",
                          cursor: "pointer",
                        }}
                      >
                        Like
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUnlike(idea.id)}
                        style={{
                          padding: "0.25rem 0.5rem",
                          borderRadius: 6,
                          border: "1px solid #ccc",
                          background: "white",
                          cursor: "pointer",
                        }}
                      >
                        Unlike
                      </button>
                    </div>
                  </div>
                  <p style={{ marginTop: "0.5rem" }}>{idea.description}</p>
                </li>
              ))}
            </ul>

            <div
              style={{
                marginTop: "1rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                ◀ Prev
              </button>
              <span>
                Page {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
                disabled={page >= totalPages}
              >
                Next ▶
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default App;
