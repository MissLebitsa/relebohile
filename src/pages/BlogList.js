import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import QuickCreatePost from '../components/QuickCreatePost';
import { auth } from '../firebase';

function formatDate(value) {
  if (!value) return '';
  if (typeof value.toDate === 'function') {
    try {
      return value.toDate().toLocaleDateString();
    } catch (e) { /* fallthrough */ }
  }
  if (typeof value.seconds === 'number') {
    return new Date(value.seconds * 1000).toLocaleDateString();
  }
  if (typeof value._seconds === 'number') {
    return new Date(value._seconds * 1000).toLocaleDateString();
  }
  if (value instanceof Date) return value.toLocaleDateString();
  if (typeof value === 'number') {
    if (value > 1e12) return new Date(value).toLocaleDateString();
    return new Date(value * 1000).toLocaleDateString();
  }
  if (typeof value === 'string') {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d.toLocaleDateString();
    return value;
  }
  return '';
}

export default function BlogList() {
  const backendBase = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminToken, setAdminToken] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${backendBase.replace(/\/$/, '')}/api/posts`);
        if (!cancelled) {
          setPosts(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        console.error('Failed to load posts', err);
        if (!cancelled) setError(err.response?.data?.message || err.message || 'Failed to load posts');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [backendBase]);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (u) {
        try {
          const t = await u.getIdToken();
          setAdminToken(t);
        } catch (err) {
          setAdminToken('');
        }
      } else {
        setAdminToken('');
      }
    });
    return unsub;
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ marginTop: 120 }}>
        <div className="text-center text-muted">Loading posts…</div>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: 70 }}>
      {}
      <header className="p-4 rounded-3 mb-4 bg-primary bg-gradient text-white">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start">
          <div>
            <h1 className="display-6 fw-bold mb-1">ALL POSTS</h1>
            <p className="mb-0">Browse recent posts, features and community reviews.</p>
          </div>
          <div className="mt-3 mt-md-0">
            <Link to="/blog/featured" className="btn btn-outline-light me-2">Featured</Link>
            <Link to="/blog" className="btn btn-light">All posts</Link>
          </div>
        </div>
      </header>

      {error && <div className="alert alert-danger">{error}</div>}

      {}
      {posts.length === 0 ? (
        <div className="text-center text-muted py-5">No posts yet.</div>
      ) : (
        <div className="row g-4 mb-4">
          {posts.map((p, idx) => (
            <div className="col-12 col-md-6" key={p.id || p._id || p.postId}>
              <article className="card h-100 shadow-sm border-0">
                <div className="row g-0">
                  <div className="col-4 d-none d-sm-block">
                    {}
                    <div className="ratio ratio-4x3 rounded-start" style={{ overflow: 'hidden' }}>
                      <div className="bg-secondary d-flex align-items-center justify-content-center text-white">
                        <div className="text-center px-2">
                          <div className="fw-bold">No Image</div>
                          <small className="d-block">Thumbnail</small>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-sm-8">
                    <div className="card-body d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title mb-0">{p.title || p.headline || 'Untitled'}</h5>
                        <div className="text-end">
                          {p.featured ? (
                            <span className="badge bg-warning text-dark">Featured</span>
                          ) : (
                            <span className="badge bg-light text-muted">Standard</span>
                          )}
                        </div>
                      </div>

                      <div className="mb-2">
                        <small className="text-muted">{formatDate(p.createdAt)}</small>
                      </div>

                      <p className="card-text text-muted mb-3">
                        {p.excerpt || p.summary || (p.body && p.body.slice ? p.body.slice(0, 150) + (p.body.length > 150 ? '…' : '') : '')}
                      </p>

                      <div className="mt-auto d-flex justify-content-between align-items-center">
                        <Link to={`/blog/${p.id || p._id || p.postId}`} className="btn btn-primary btn-sm">Read</Link>
                        <div className="text-muted small">
                          <span className="me-2">👁 {p.views || p.popularity || '—'}</span>
                          <span className="text-muted"> • </span>
                          <span className="ms-2">{p.category || 'General'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>
      )}

      {}
      <div className="card mb-5 shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Quick create post <small className="text-muted">(dev only)</small></h5>
            <div>
              <small className="text-muted">Signed in: {adminToken ? 'Yes' : 'No'}</small>
            </div>
          </div>

          <QuickCreatePost backendBase={backendBase} authToken={adminToken} />
        </div>
      </div>

      <Footer />
    </div>
  );
}