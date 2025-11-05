import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import Footer from '../components/Footer';

function formatDate(value) {
  if (!value) return '';
  if (typeof value.toDate === 'function') {
    try {
      return value.toDate().toLocaleDateString();
    } catch (e) {}
  }
  if (typeof value.seconds === 'number') return new Date(value.seconds * 1000).toLocaleDateString();
  if (typeof value._seconds === 'number') return new Date(value._seconds * 1000).toLocaleDateString();
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

export default function BlogPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const backendBase = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => setUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${backendBase.replace(/\/$/, '')}/api/posts/${id}`);
        if (!mounted) return;
        setPost(res.data || null);
      } catch (err) {
        console.error('Failed to load post', err);
        if (!mounted) return;
        setError(err.response?.data?.message || err.message || 'Failed to load post');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [backendBase, id]);

  const handleDelete = async () => {
    if (!user) {
      alert('Sign in to delete posts.');
      return;
    }
    if (!window.confirm('Delete this post?')) return;
    setLoadingDelete(true);
    try {
      const token = await user.getIdToken();
      const url = `${backendBase.replace(/\/$/, '')}/api/posts/${id}`;
      console.log('DELETE', url);

      const res = await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Delete response', res.status, res.data);
      navigate('/blog');
    } catch (err) {
      console.error('Delete failed', err);
      const status = err.response?.status;
      const data = err.response?.data;
      alert('Delete failed: ' + (data?.message || `${status || 'NO_RESPONSE'} ${err.message}`));
    } finally {
      setLoadingDelete(false);
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

  if (error) {
    return (
      <div className="container" style={{ marginTop: 80 }}>
        <div className="alert alert-danger">{error}</div>
        <div className="mt-3">
          <Link to="/blog" className="btn btn-outline-primary">Back to posts</Link>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container" style={{ marginTop: 80 }}>
        <div className="text-center text-muted">Post not found.</div>
        <div className="mt-3 text-center">
          <Link to="/blog" className="btn btn-outline-primary">Back to posts</Link>
        </div>
      </div>
    );
  }

  const author = post.userEmail || post.author || post.authorEmail || '';

  return (
    <div className="container" style={{ marginTop: 70 }}>
      <div className="mb-3">
        <Link to="/blog" className="text-decoration-none text-primary">
          ← Back to posts
        </Link>
      </div>

      <article className="card shadow-sm border-0">
        <div className="card-header bg-gradient bg-primary text-white d-flex justify-content-between align-items-center">
          <div>
            <h2 className="h4 mb-0">{post.title || 'Untitled'}</h2>
            <div className="small text-white-50">{formatDate(post.createdAt)} {post.category ? ` • ${post.category}` : ''}</div>
          </div>
          <div className="text-end">
            {post.featured && <span className="badge bg-warning text-dark me-2">Featured</span>}
            <span className="badge bg-light text-dark">{post.views || '—'} views</span>
          </div>
        </div>

        <div className="card-body">
          <div className="d-flex align-items-center mb-3">
            <div className="me-3">
              <div className="rounded-circle bg-info text-white d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                <strong>{author ? author[0]?.toUpperCase() : 'A'}</strong>
              </div>
            </div>
            <div>
              <div className="fw-bold text-primary">{author || 'Anonymous'}</div>
              <div className="small text-muted">{post.subtitle || post.excerpt || ''}</div>
            </div>
          </div>

          <div className="mb-4 text-body" style={{ whiteSpace: 'pre-wrap' }}>
            {post.body || post.content || <span className="text-muted">No content available.</span>}
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <div>
              <Link to="/blog" className="btn btn-outline-secondary me-2">Back</Link>
              <Link to={`/blog/${id}/edit`} className="btn btn-outline-primary me-2">Edit</Link>
              <button className="btn btn-danger" onClick={handleDelete} disabled={loadingDelete}>
                {loadingDelete ? (<span className="spinner-border spinner-border-sm me-2" />) : null}
                Delete
              </button>
            </div>

            <div className="text-muted small">
              Posted: {formatDate(post.createdAt)}
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}