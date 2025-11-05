import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const IMAGE_BASE = 'https://image.tmdb.org/t/p/';

function getImageUrl(movie, size = 'w342') {
  if (!movie) return null;
  const candidate = movie.poster_path || movie.backdrop_path;
  if (!candidate) return null;
  const path = candidate.startsWith('/') ? candidate : `/${candidate}`;
  return `${IMAGE_BASE}${size}${path}`;
}

const placeholderDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='500' height='750'><rect width='100%' height='100%' fill='%23efefef'/><text x='50%' y='50%' fill='%23999' font-family='Arial' font-size='24' text-anchor='middle' dominant-baseline='middle'>No Image</text></svg>`
)}`;

export default function Home() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const backendBase = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    async function loadPosts() {
      setLoadingPosts(true);
      try {
        const res = await axios.get(`${backendBase}/api/posts`, { params: { limit: 6 } });
        setPosts(res.data || []);
      } catch (err) {
        console.error('Failed to load posts', err);
      } finally {
        setLoadingPosts(false);
      }
    }
    loadPosts();
  }, [backendBase]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    const query = q.trim();
    if (!query) return;
    setLoading(true);
    try {
      const res = await axios.get(`${backendBase}/api/search`, { params: { q: query } });
      setResults(res.data.results || []);
    } catch (err) {
      console.error('Search error', err);
      alert('Search failed. Check the backend or console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleExplore = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendBase}/api/popular`);
      setResults(res.data.results || []);
      setQ('');
    } catch (err) {
      console.error('Explore error', err);
      alert('Explore failed. Check backend or console for details.');
    } finally {
      setLoading(false);
    }
  };

  const onImgError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = placeholderDataUrl;
  };

  return (
    <div className="container-fluid" style={{ width: '90vw', height: '90vh', margin: '80px auto 20px', padding: 0 }}>
      <div className="d-flex flex-column h-100">
        <div
          className="card mb-3 flex-shrink-0 border-0"
          style={{
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(30, 60, 120, 0.12)'
          }}
        >
          <div
            className="p-4"
            style={{
              background: 'linear-gradient(90deg, rgba(59,130,246,1) 0%, rgba(124,58,237,1) 60%)',
              color: 'white'
            }}
          >
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h1 className="h1 fw-bold mb-1" style={{ letterSpacing: '-0.5px' }}>FIND MOVIES YOU LOVE</h1>
                <p className="mb-0" style={{ opacity: 0.95 }}>Search titles, read reviews and write your own.</p>
              </div>
              <div>
                <button className="btn btn-light btn-lg" onClick={handleExplore} style={{ fontWeight: 600 }}>
                  EXPLORE
                </button>
              </div>
            </div>

            <form className="mt-4" onSubmit={handleSearch}>
              <div className="input-group shadow-sm" style={{ borderRadius: 999 }}>
                <input
                  type="search"
                  className="form-control form-control-lg"
                  placeholder="Try Avengers, Inception, The Godfather..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  aria-label="Search movies"
                  style={{ borderRadius: '999px', border: 0 }}
                />
                <button
                  className="btn btn-primary btn-lg"
                  type="submit"
                  style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderRadius: 999, marginLeft: 6 }}
                >
                  SEARCH
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="row g-4 flex-grow-1 overflow-auto">
          <div className="col-12 col-lg-8 d-flex flex-column">
            <div className="mb-3 text-center">
              {!loading && results.length === 0 && <p className="text-muted">Start a search to see results</p>}
              {loading && <div className="text-muted">Loading...</div>}
            </div>

            <div className="row g-4">
              {results.map(movie => (
                <div key={movie.id} className="col-6 col-sm-6 col-md-4 col-lg-6 d-flex">
                  <div
                    className="card w-100 h-100 d-flex flex-column"
                    style={{
                      borderRadius: 12,
                      overflow: 'hidden',
                      transition: 'transform 180ms ease',
                      boxShadow: '0 6px 18px rgba(32, 45, 67, 0.08)'
                    }}
                  >
                    {getImageUrl(movie) ? (
                      <div className="ratio ratio-2x3">
                        <img
                          src={getImageUrl(movie, 'w342')}
                          className="card-img-top img-fluid"
                          alt={movie.title}
                          style={{ objectFit: 'cover' }}
                          onError={onImgError}
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="d-flex align-items-center justify-content-center bg-light" style={{ height: '300px' }}>
                        <span className="text-muted">No Image</span>
                      </div>
                    )}
                    <div className="card-body d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title mb-0" style={{ fontSize: '1.05rem' }}>{movie.title}</h5>
                        <span className="badge" style={{ background: '#ffd166', color: '#111', fontWeight: 700 }}>
                          {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
                        </span>
                      </div>
                      <p className="text-muted small mb-2">{movie.release_date}</p>
                      <p className="card-text small text-truncate" style={{ WebkitLineClamp: 3, display: '-webkit-box', WebkitBoxOrient: 'vertical' }}>
                        {movie.overview || ''}
                      </p>
                      <div className="mt-auto d-flex justify-content-between align-items-center pt-3">
                        <Link to={`/movie/${movie.id}`} className="btn btn-outline-primary btn-sm">VIEW</Link>
                        <div className="text-muted small">Popularity: <strong>{Math.round(movie.popularity || 0)}</strong></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {results.length === 0 && (
                <div className="col-12">
                  <div className="d-flex justify-content-center align-items-center" style={{ height: '40vh' }}>
                    <div className="text-center">
                      <h3 style={{ color: '#6b7280', fontWeight: 700 }}>DISCOVER GREAT FILMS</h3>
                      <p className="text-muted">Use Explore to see trending titles or search for something specific.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="col-12 col-lg-4 d-flex flex-column">
            <div
              className="card text-white mb-3"
              style={{
                borderRadius: 12,
                background: 'linear-gradient(180deg, rgba(99,102,241,1) 0%, rgba(56,189,248,1) 100%)',
                boxShadow: '0 12px 30px rgba(14,30,70,0.12)'
              }}
            >
              <div className="card-body d-flex flex-column" style={{ padding: '2rem' }}>
                <h2 className="fw-bold mb-2" style={{ fontSize: '1.6rem' }}>FROM THE BLOG</h2>
                <p className="mb-3" style={{ opacity: 0.95 }}>
                  LATEST ARTICLES, RECOMMENDATIONS AND REVIEWS — TIPS, LISTS AND FEATURED REVIEWS FROM OUR COMMUNITY.
                </p>
                <div className="d-flex gap-2 mt-auto">
                  <Link to="/blog/featured" className="btn btn-light btn-lg" style={{ fontWeight: 700 }}>READ FEATURED</Link>
                  <Link to="/blog" className="btn btn-outline-light btn-lg">ALL POSTS</Link>
                </div>
              </div>
            </div>

            <div className="card flex-grow-1 overflow-auto" style={{ borderRadius: 12, boxShadow: '0 8px 20px rgba(32,45,67,0.06)' }}>
              <div className="card-body">
                <h5 className="mb-3 fw-bold">RECENT POSTS</h5>
                {loadingPosts ? (
                  <div className="text-muted">Loading posts…</div>
                ) : posts.length === 0 ? (
                  <div className="text-muted">No posts yet.</div>
                ) : (
                  <ul className="list-group list-group-flush">
                    {posts.map(p => (
                      <li
                        className="list-group-item d-flex justify-content-between align-items-start"
                        key={p.id}
                        style={{ border: 'none', paddingLeft: 0, paddingRight: 0 }}
                      >
                        <div>
                          <Link to={`/blog/${p.id}`} style={{ textDecoration: 'none', color: '#0f172a' }}>
                            <div className="fw-bold" style={{ fontSize: '0.98rem' }}>{p.title}</div>
                          </Link>
                          <div className="text-muted small">{p.excerpt}</div>
                        </div>
                        <div className="text-end ms-3">
                          <small className="text-muted">
                            {p.createdAt && p.createdAt.seconds ? new Date(p.createdAt.seconds * 1000).toLocaleDateString() : ''}
                          </small>
                          <div className="mt-2">
                            <Link to={`/blog/${p.id}`} className="btn btn-sm btn-outline-primary">Read</Link>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="mt-3 text-center">
              <small className="text-muted"> </small>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}