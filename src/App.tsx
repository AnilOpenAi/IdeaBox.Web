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
    <div className="app-shell">
      <header className="app-header">
        <div className="app-title">
          IdeaBox
          <span className="app-title-badge">alpha</span>
        </div>
        <p className="app-subtitle">
          Simple playground for ideas – JWT auth, pagination and voting on top
          of a .NET backend.
        </p>
      </header>

      {!isAuthenticated ? (
        <main className="app-grid">
          <section className="card">
            <div className="card-header">
              <h2 className="card-title">
                {authMode === "login" ? "Login" : "Create an account"}
              </h2>
            </div>

            <div className="btn-row" style={{ marginBottom: "0.75rem" }}>
              <button
                type="button"
                className={
                  "btn btn-pill btn-sm " +
                  (authMode === "register" ? "btn-primary" : "btn-outline")
                }
                onClick={() => setAuthMode("register")}
              >
                Register
              </button>
              <button
                type="button"
                className={
                  "btn btn-pill btn-sm " +
                  (authMode === "login" ? "btn-primary" : "btn-outline")
                }
                onClick={() => setAuthMode("login")}
              >
                Login
              </button>
            </div>

            <form onSubmit={handleAuthSubmit}>
              <div className="form-group">
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="label">Password</label>
                <input
                  type="password"
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && <div className="error">{error}</div>}

              <div style={{ marginTop: "0.75rem" }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? "Please wait..." : "Continue"}
                </button>
              </div>
            </form>
          </section>

          <section className="card">
            <div className="card-header">
              <h2 className="card-title">How it works</h2>
            </div>
            <ul className="ideas-list">
              <li className="idea-item">
                <div className="idea-title">1. Register or login</div>
                <p className="idea-body">
                  We call the IdeaBox API you already built in .NET and get a
                  real JWT token back.
                </p>
              </li>
              <li className="idea-item">
                <div className="idea-title">2. Create ideas</div>
                <p className="idea-body">
                  Ideas are stored in your SQLite database via EF Core.
                </p>
              </li>
              <li className="idea-item">
                <div className="idea-title">3. Vote & paginate</div>
                <p className="idea-body">
                  Like/unlike uses your voting table, and listing uses the
                  paged endpoint.
                </p>
              </li>
            </ul>
          </section>
        </main>
      ) : (
        <>
          <section className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Welcome back</div>
                <div className="card-muted">Signed in as {email}</div>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>

            <form onSubmit={handleCreateIdea}>
              <div className="form-group">
                <label className="label">Title</label>
                <input
                  type="text"
                  className="input"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="label">Description</label>
                <textarea
                  className="textarea"
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>

              {error && <div className="error">{error}</div>}

              <div style={{ marginTop: "0.75rem" }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  Create idea
                </button>
              </div>
            </form>
          </section>

          <section className="card" style={{ marginTop: "1rem" }}>
            <div className="ideas-header">
              <div>
                <h2 className="card-title">Ideas</h2>
                <div className="card-muted">
                  Paginated list backed by your .NET API.
                </div>
              </div>
              {loading && <div className="banner">Refreshing…</div>}
            </div>

            {ideas.length === 0 && !loading && (
              <p className="card-muted">No ideas yet. Create your first one.</p>
            )}

            <ul className="ideas-list">
              {ideas.map((idea) => (
                <li key={idea.id} className="idea-item">
                  <div className="idea-header">
                    <div>
                      <div className="idea-title">{idea.title}</div>
                      <div className="idea-meta">
                        {new Date(idea.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="btn-row">
                      <span className="card-muted">👍 {idea.voteCount}</span>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => handleLike(idea.id)}
                      >
                        Like
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => handleUnlike(idea.id)}
                      >
                        Unlike
                      </button>
                    </div>
                  </div>
                  <p className="idea-body">{idea.description}</p>
                </li>
              ))}
            </ul>

            {ideas.length > 0 && (
              <div className="pagination">
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  ◀ Prev
                </button>
                <span>
                  Page {page} / {totalPages || 1}
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={() =>
                    setPage((p) => (p < totalPages ? p + 1 : p))
                  }
                  disabled={page >= totalPages}
                >
                  Next ▶
                </button>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default App;
