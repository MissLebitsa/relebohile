import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { auth } from '../firebase';

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

function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [user, setUser] = useState(null);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => setUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/movie/${id}`);
        setMovie(res.data);
      } catch (err) { console.error(err); }

      setLoadingReviews(true);
      try {
        const r = await axios.get(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/reviews/movie/${id}`);
        setReviews(r.data);
      } catch (err) { console.error(err); }
      setLoadingReviews(false);
    };
    fetch();
  }, [id]);

  const submitReview = async () => {
    if (!user) return alert('Please log in to add a review.');
    if (!text.trim()) return alert('Write something for your review.');
    try {
      const token = await user.getIdToken();
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/reviews`, {
        movieId: id,
        movieTitle: movie.title,
        rating,
        text
      }, { headers: { Authorization: `Bearer ${token}` } });
      setReviews(prev => [res.data, ...prev]);
      setRating(5);
      setText('');
    } catch (err) {
      console.error(err);
      alert('Failed to submit review');
    }
  };

  const deleteReview = async (rid) => {
    if (!user) return alert('Please log in.');
    if (!window.confirm('Delete this review?')) return;
    try {
      const token = await user.getIdToken();
      await axios.delete(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/reviews/${rid}`, { headers: { Authorization: `Bearer ${token}` } });
      setReviews(prev => prev.filter(r => r.id !== rid));
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  };

  const editReview = async (rid, current) => {
    if (!user) return alert('Please log in.');
    const newText = prompt('Edit your review text', current.text);
    const newRating = Number(prompt('Edit rating (1-5)', current.rating));
    if (newText === null || isNaN(newRating)) return;
    try {
      const token = await user.getIdToken();
      const res = await axios.put(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/reviews/${rid}`, {
        rating: newRating,
        text: newText
      }, { headers: { Authorization: `Bearer ${token}` } });
      setReviews(prev => prev.map(r => r.id === rid ? res.data : r));
    } catch (err) {
      console.error(err);
      alert('Update failed');
    }
  };

  const onImgError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = placeholderDataUrl;
  };

  return (
    <div className="container py-4">
      {!movie ? (
        <div className="text-center text-muted">MOVIE LOADING...</div>
      ) : (
        <>
          <div className="row g-3">
            <div className="col-md-4">
              {getImageUrl(movie) ? (
                <img src={getImageUrl(movie)} alt={movie.title} className="img-fluid rounded shadow-sm" onError={onImgError} />
              ) : (
                <div className="bg-secondary rounded text-white d-flex align-items-center justify-content-center" style={{height:360}}>No image</div>
              )}
            </div>

            <div className="col-md-8">
              <h2 className="fw-bold">{movie.title}</h2>
              <p className="text-muted">{movie.release_date} • {movie.runtime ? `${movie.runtime} min` : ''}</p>
              <p>{movie.overview}</p>

              <div className="card mt-3">
                <div className="card-body">
                  <h5 className="card-title">WRITE A REVIEW</h5>
                  <div className="mb-2">
                    <select className="form-select w-auto d-inline-block me-2" value={rating} onChange={e => setRating(Number(e.target.value))}>
                      {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} stars</option>)}
                    </select>
                    <button className="btn btn-primary ms-2" onClick={submitReview}>Submit</button>
                  </div>
                  <textarea className="form-control" rows="3" placeholder="Write your review..." value={text} onChange={e => setText(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          <h4 className="mt-4">REVIEWS</h4>
          {loadingReviews ? (
            <div className="text-muted">REVIEWS ARE LOADING…</div>
          ) : reviews.length === 0 ? (
            <div className="text-muted">NO REVIEWS YET.</div>
          ) : (
            <div className="list-group mt-2">
              {reviews.map(r => (
                <div key={r.id} className="list-group-item list-group-item-action mb-2 shadow-sm">
                  <div className="d-flex w-100 justify-content-between">
                    <h6 className="mb-1">{r.userEmail || 'Anonymous'}</h6>
                    <small className="text-muted">{r.rating} ★</small>
                  </div>
                  <p className="mb-1">{r.text}</p>
                  <small className="text-muted">{r.createdAt && r.createdAt.seconds ? new Date(r.createdAt.seconds * 1000).toLocaleString() : ''}</small>
                  {user && user.uid === r.uid && (
                    <div className="mt-2">
                      <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => editReview(r.id, r)}>EDIT</button>
                      <button className="btn btn-sm btn-danger" onClick={() => deleteReview(r.id)}>DELETE</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MovieDetails;