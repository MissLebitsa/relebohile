import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function FeaturedRedirect() {
  const navigate = useNavigate();
  const backendBase = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(3); 

  useEffect(() => {
    let mounted = true;
    let timer;

    async function loadFeatured() {
      try {
        const res = await axios.get(`${backendBase.replace(/\/$/, '')}/api/posts`, { params: { limit: 1 } });
        const posts = res.data || [];
        if (!mounted) return;

        if (posts.length === 0) {
          setLoading(false);
          setPost(null);
          return;
        }

        const first = posts[0];
        setPost(first);
        setLoading(false);

        setCountdown(3);
        timer = setInterval(() => {
          setCountdown((c) => {
            if (c <= 1) {
              clearInterval(timer);
              const id = first.id || first._id || first.postId;
              if (id) navigate(`/blog/${id}`);
              else navigate('/blog');
              return 0;
            }
            return c - 1;
          });
        }, 1000);
      } catch (err) {
        console.error('Failed to load featured', err);
        if (!mounted) return;
        setError(err.response?.data?.message || err.message || 'Failed to load featured post');
        setLoading(false);
      }
    }

    loadFeatured();
    return () => {
      mounted = false;
      if (timer) clearInterval(timer);
    };
  }, [backendBase, navigate]);

  return (
    <div className="container" style={{ marginTop: 120 }}>
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          {loading && (
            <div className="card shadow-sm">
              <div className="card-body text-center">
                <div className="spinner-border text-primary mb-3" role="status" />
                <h5 className="card-title">Finding featured post…</h5>
                <p className="text-muted mb-0">One moment while we look for the latest featured article.</p>
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="alert alert-danger" role="alert">
              <strong>Oops:</strong> {error}
              <div className="mt-2">
                <Link to="/blog" className="btn btn-outline-primary btn-sm">See all posts</Link>
              </div>
            </div>
          )}

          {!loading && !error && !post && (
            <div className="card shadow-sm">
              <div className="card-body text-center">
                <h5 className="card-title">No featured posts</h5>
                <p className="text-muted">There are no featured posts right now. Browse all posts below.</p>
                <Link to="/blog" className="btn btn-primary">View posts</Link>
              </div>
            </div>
          )}

          {!loading && !error && post && (
            <div className="card shadow-lg">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h5 className="card-title mb-1">{post.title || post.headline || 'Featured Post'}</h5>
                    <small className="text-muted">{post.createdAt ? (typeof post.createdAt === 'string' ? post.createdAt : '') : ''}</small>
                  </div>
                  <span className="badge bg-warning text-dark">Featured</span>
                </div>

                <p className="card-text text-muted">
                  {post.excerpt || post.summary || (post.body && post.body.slice ? post.body.slice(0, 180) + (post.body.length > 180 ? '…' : '') : '')}
                </p>

                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    <Link to={`/blog/${post.id || post._id || post.postId}`} className="btn btn-primary me-2">Open now</Link>
                    <Link to="/blog" className="btn btn-outline-secondary">All posts</Link>
                  </div>

                  <div className="text-muted small">
                    Redirecting in <strong>{countdown}</strong>…
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}