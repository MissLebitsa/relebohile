import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import Footer from '../components/Footer';

const IMAGE_BASE = 'https://image.tmdb.org/t/p/';
const placeholderDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='500' height='750'><rect width='100%' height='100%' fill='%23efefef'/><text x='50%' y='50%' fill='%23999' font-family='Arial' font-size='24' text-anchor='middle' dominant-baseline='middle'>No Image</text></svg>`
)}`;

function getImageUrl(movie, size = 'w500') {
  const candidate = movie?.poster_path || movie?.backdrop_path;
  if (!candidate) return null;
  const path = candidate.startsWith('/') ? candidate : `/${candidate}`;
  return `${IMAGE_BASE}${size}${path}`;
}

export default function Movie() {
  const { id } = useParams();
  const navigate = useNavigate();
  const backendBase = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingMovie, setLoadingMovie] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [user, setUser] = useState(null);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => setUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    async function fetchMovie() {
      setLoadingMovie(true);
      try {
        const res = await axios.get(`${backendBase.replace(/\/$/, '')}/api/movie/${id}`);
        setMovie(res.data);
      } catch (err) {
        console.error('Failed to load movie', err);
        alert('Failed to load movie. See console for details.');
        navigate('/');
      } finally {
        setLoadingMovie(false);
      }
    }
    fetchMovie();
  }, [id, backendBase, navigate]);

  useEffect(() => {
    async function fetchReviews() {
      setLoadingReviews(true);
      try {
        const res = await axios.get(`${backendBase.replace(/\/$/, '')}/api/reviews/movie/${id}`);
        setReviews(res.data || []);
      } catch (err) {
        console.error('Failed to load reviews', err);
      } finally {
        setLoadingReviews(false);
      }
    }
    fetchReviews();
  }, [id, backendBase]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    setSubmitting(true);
    try {
      const token = await user.getIdToken();
      const payload = {
        movieId: id,
        movieTitle: movie?.title || '',
        rating: Number(rating),
        text: text.trim()
      };
      await axios.post(`${backendBase.replace(/\/$/, '')}/api/reviews`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const res = await axios.get(`${backendBase.replace(/\/$/, '')}/api/reviews/movie/${id}`);
      setReviews(res.data || []);
      setText('');
      setRating(5);
    } catch (err) {
      console.error('Failed to post review', err);
      alert('Failed to post review. See console for details.');
    } finally {
      setSubmitting(false);
    }
  };

  const onImgError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = placeholderDataUrl;
  };

  return (
    <div className="container-fluid" style={{ width: '90vw', height: '90vh', margin: '80px auto 20px', padding: 0 }}>
      <div className="row g-4 h-100">
        <div className="col-12 col-md-4 h-100">
          <div className="card h-100">
            {movie && getImageUrl(movie) ? (
              <img
                src={getImageUrl(movie)}
                className="card-img-top"
                alt={movie.title}
                style={{ objectFit: 'cover', height: '50vh' }}
                onError={onImgError}
              />
            ) : (
              <div className="p-5 text-center bg-light">No image</div>
            )}
            <div className="card-body">
              {loadingMovie ? (
                <p className="text-muted">Loading movie…</p>
              ) : (
                <>
                  <h4 className="card-title">{movie?.title}</h4>
                  <p className="text-muted mb-1">Release: {movie?.release_date || 'N/A'}</p>
                  <p className="mb-2">Rating: {movie?.vote_average ?? 'N/A'}</p>
                  <Link to="/" className="btn btn-outline-secondary btn-sm">Back to search</Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-md-8 d-flex flex-column h-100">
          <div className="mb-4 flex-shrink-0">
            <h3 className="h5">Overview</h3>
            <p className="text-muted">{movie?.overview || (loadingMovie ? 'Loading…' : 'No overview available')}</p>
          </div>

          <div className="flex-grow-1 overflow-auto mb-3">
            <h4 className="h6">Reviews</h4>
            {loadingReviews ? (
              <p className="text-muted">Loading reviews…</p>
            ) : reviews.length === 0 ? (
              <p className="text-muted">No reviews yet — be the first to write one.</p>
            ) : (
              reviews.map(r => (
                <div className="card mb-3" key={r.id}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <div>
                        <strong>{r.userEmail || 'Anonymous'}</strong>
                        <div className="text-muted small">{new Date(r.createdAt?.seconds ? r.createdAt.seconds * 1000 : Date.now()).toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="badge bg-primary">{r.rating} ★</span>
                      </div>
                    </div>
                    <p className="mt-2 mb-0">{r.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="card flex-shrink-0">
            <div className="card-body">
              <h5 className="card-title">Write a review</h5>
              {user ? (
                <form onSubmit={handleSubmitReview}>
                  <div className="mb-3">
                    <label className="form-label">Rating</label>
                    <select className="form-select" value={rating} onChange={(e) => setRating(e.target.value)}>
                      <option value={5}>5 - Excellent</option>
                      <option value={4}>4 - Very good</option>
                      <option value={3}>3 - Good</option>
                      <option value={2}>2 - Fair</option>
                      <option value={1}>1 - Poor</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Review</label>
                    <textarea className="form-control" rows="4" value={text} onChange={(e) => setText(e.target.value)} required />
                  </div>

                  <div className="d-flex gap-2">
                    <button className="btn btn-primary" type="submit" disabled={submitting}>
                      {submitting ? 'Submitting…' : 'Submit Review'}
                    </button>
                    <button className="btn btn-outline-secondary" type="button" onClick={() => { setText(''); setRating(5); }}>
                      Reset
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <p className="text-muted">You must be signed in to write a review.</p>
                  <Link to="/login" className="btn btn-primary btn-sm">Login</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}