import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import Footer from '../components/Footer';

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Backend URL setup
  let backendBase = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
  backendBase = backendBase.replace(/\/$/, '');

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => setUser(u));
    return unsub;
  }, []);

  // Load post
  useEffect(() => {
    let mounted = true;
    async function loadPost() {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${backendBase}/api/posts/${id}`);
        if (!mounted) return;
        const data = res.data;
        setTitle(data.title || '');
        setExcerpt(data.excerpt || '');
        setBody(data.content || data.body || '');
      } catch (err) {
        console.error('Failed to load post', err);
        if (!mounted) return;
        setError(err.response?.data?.message || err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadPost();
    return () => (mounted = false);
  }, [backendBase, id]);

  // Save handler
  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('You must be signed in to save changes.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const token = await user.getIdToken();
      const payload = {
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: body.trim(),
      };

      await axios.put(`${backendBase}/api/posts/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate(`/blog/${id}`);
    } catch (err) {
      console.error('Save failed', err);
      setError(err.response?.data?.message || err.message);
      alert(`Save failed: ${err.response?.status || 'No status'} — ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ marginTop: 120 }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" />
          <div className="mt-2 text-muted">Loading post…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: 70 }}>
      <div className="card shadow-sm border-0">
        <div className="card-header bg-primary bg-gradient text-white">
          <h3 className="h5 mb-0">Edit Post</h3>
        </div>

        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSave}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Title</label>
              <input
                className="form-control form-control-lg border-primary"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                placeholder="Enter post title"
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Excerpt</label>
              <input
                className="form-control border-info"
                value={excerpt}
                onChange={e => setExcerpt(e.target.value)}
                placeholder="Short summary (optional)"
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Body</label>
              <textarea
                className="form-control border-secondary"
                rows={10}
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Write the full post content here..."
              />
            </div>

            <button
              className="btn btn-primary btn-lg"
              type="submit"
              disabled={saving}
            >
              {saving && (
                <span className="spinner-border spinner-border-sm me-2" />
              )}
              Save changes
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
