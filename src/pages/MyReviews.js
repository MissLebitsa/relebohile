import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { auth } from '../firebase';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

export default function MyReviews() {
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingDeleteId, setLoadingDeleteId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [loadingEditId, setLoadingEditId] = useState(null);

  const backendBase = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  const loadMyReviews = useCallback(async (u) => {
    setLoading(true);
    try {
      const token = await u.getIdToken();
      const res = await axios.get(`${backendBase.replace(/\/$/, '')}/api/my-reviews`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(res.data || []);
    } catch (err) {
      console.error('Failed to load my reviews', err, err?.response?.data);
      alert('Failed to load your reviews. Open console for details.');
    } finally {
      setLoading(false);
    }
  }, [backendBase]);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => {
      setUser(u);
      if (u) loadMyReviews(u);
      else setReviews([]);
    });
    return unsub;
  }, [loadMyReviews]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    setLoadingDeleteId(id);
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.delete(`${backendBase.replace(/\/$/, '')}/api/reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Failed to delete review', err, err?.response?.data);
      alert('Failed to delete review. See console for details.');
    } finally {
      setLoadingDeleteId(null);
    }
  };

  const startEdit = (r) => {
    setEditingId(r.id);
    setEditText(r.text || '');
    setEditRating(r.rating ?? 5);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
    setEditRating(5);
  };

  const handleSaveEdit = async (id) => {
    // Basic validation
    if (!editText || editText.trim().length < 1) {
      alert('Review text cannot be empty.');
      return;
    }
    const ratingNum = Number(editRating);
    if (Number.isNaN(ratingNum) || ratingNum < 0 || ratingNum > 10) {
      alert('Rating must be a number between 0 and 10.');
      return;
    }

    setLoadingEditId(id);
    try {
      // ensure we have a logged-in user
      const current = auth.currentUser || user;
      if (!current) throw new Error('Not authenticated');

      const token = await current.getIdToken();
      const payload = {
        text: editText.trim(),
        rating: ratingNum
      };

      const res = await axios.patch(`${backendBase.replace(/\/$/, '')}/api/reviews/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // If backend returns updated review, use it; otherwise merge payload locally
      const updated = res.data && res.data.id === id ? res.data : null;
      setReviews(prev => prev.map(r => (r.id === id ? (updated || { ...r, ...payload, updatedAt: new Date() }) : r)));

      setEditingId(null);
      setEditText('');
      setEditRating(5);
    } catch (err) {
      // Show detailed info in console to help debugging (status, server body)
      console.error('Failed to save edited review', err);
      if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
      } else {
        console.error('Request error:', err.message);
      }
      // show a more descriptive alert to the user
      const serverMsg = err.response?.data?.error || err.response?.data?.message;
      alert(`Failed to save your changes: ${serverMsg || err.message}. See console for details.`);
    } finally {
      setLoadingEditId(null);
    }
  };

  return (
    <div className="container-fluid" style={{ width: '90vw', minHeight: '90vh', margin: '100px auto 20px', padding: 0 }}>
      <div className="d-flex flex-column h-100">
        <div
          style={{
            borderRadius: 12,
            padding: '1.25rem 1.5rem',
            background: 'linear-gradient(90deg,#06b6d4,#7c3aed)',
            color: 'white',
            boxShadow: '0 10px 30px rgba(12,20,40,0.08)'
          }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold mb-1" style={{ letterSpacing: '-0.5px' }}>MY REVIEWS</h2>
              <p className="mb-0" style={{ opacity: 0.95 }}>Your reviews and ratings — manage, revisit and share your thoughts.</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              {user ? (
                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.92)' }}>{user.email}</div>
              ) : (
                <Link to="/login" className="btn btn-light btn-sm">LOGIN</Link>
              )}
            </div>
          </div>
        </div>

        {!user && (
          <div className="mt-3" style={{ borderRadius: 10 }}>
            <div className="alert" role="alert" style={{ background: 'linear-gradient(90deg,#fff7ed,#fff1f2)', borderRadius: 10 }}>
              <strong style={{ color: '#c2410c' }}>PLEASE SIGN IN</strong>
              <div style={{ color: '#92400e' }}>You must be logged in to see and manage your reviews.</div>
            </div>
          </div>
        )}

        <div className="flex-grow-1 overflow-auto mt-3">
          {loading && (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '30vh' }}>
              <div className="spinner-border text-primary" role="status" aria-hidden="true"></div>
              <div className="ms-3 text-muted">LOADING YOUR REVIEWS…</div>
            </div>
          )}

          {!loading && user && reviews.length === 0 && (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '30vh' }}>
              <div className="text-center">
                <h4 style={{ color: '#334155' }}>NO REVIEWS YET</h4>
                <p className="text-muted">Write a review from any movie page — your reviews will appear here.</p>
                <Link to="/" className="btn btn-primary">DISCOVER MOVIES</Link>
              </div>
            </div>
          )}

          <div className="row g-3">
            {reviews.map(r => (
              <div key={r.id} className="col-12">
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ width: 8, borderRadius: 8, background: '#7c3aed', marginTop: 6 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      borderRadius: 12,
                      padding: '0.9rem',
                      background: 'linear-gradient(180deg,#ffffff,#f8fafc)',
                      boxShadow: '0 8px 24px rgba(14,30,70,0.06)'
                    }}>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h5 className="mb-1" style={{ marginBottom: 6 }}>{r.movieTitle}</h5>
                          <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                            {r.createdAt && r.createdAt.seconds ? new Date(r.createdAt.seconds * 1000).toLocaleString() : ''}
                          </div>
                        </div>
                        <div className="text-end">
                          <span style={{
                            background: '#ffd166',
                            color: '#111827',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            padding: '0.45rem 0.6rem',
                            borderRadius: 8,
                            display: 'inline-block'
                          }}>
                            {r.rating} ★
                          </span>
                        </div>
                      </div>

                      {/* If this review is being edited, render the edit form inline */}
                      {editingId === r.id ? (
                        <>
                          <div className="mt-2">
                            <label className="form-label" style={{ fontSize: '0.85rem' }}>Edit your review</label>
                            <textarea
                              className="form-control"
                              rows={4}
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              placeholder="Write your updated review..."
                            />
                          </div>

                          <div className="mt-2 d-flex justify-content-between align-items-center">
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <label className="form-label mb-0" style={{ marginRight: 8 }}>Rating</label>
                              <input
                                type="number"
                                min={0}
                                max={10}
                                className="form-control"
                                style={{ width: 96 }}
                                value={editRating}
                                onChange={(e) => setEditRating(e.target.value)}
                              />
                              <span style={{ marginLeft: 8, color: '#6b7280' }}>★</span>
                            </div>

                            <div>
                              <button
                                className="btn btn-primary btn-sm me-2"
                                onClick={() => handleSaveEdit(r.id)}
                                disabled={loadingEditId === r.id}
                              >
                                {loadingEditId === r.id ? 'SAVING…' : 'SAVE'}
                              </button>
                              <button
                                className="btn btn-outline-secondary btn-sm"
                                onClick={cancelEdit}
                                disabled={loadingEditId === r.id}
                              >
                                CANCEL
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="mt-2 mb-3" style={{ color: '#0f172a', lineHeight: 1.5 }}>{r.text}</p>

                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <Link to={`/movie/${r.movieId}`} className="btn btn-outline-primary btn-sm me-2">VIEW</Link>
                              <button
                                className="btn btn-outline-secondary btn-sm me-2"
                                onClick={() => startEdit(r)}
                              >
                                EDIT
                              </button>
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleDelete(r.id)}
                                disabled={loadingDeleteId === r.id}
                              >
                                {loadingDeleteId === r.id ? 'DELETING…' : 'DELETE'}
                              </button>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                              {r.userEmail || 'You'}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}