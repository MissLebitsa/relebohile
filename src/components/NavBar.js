import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function NavBar({ userEmail, onLogout }) {
  const navRef = useRef(null);

  useEffect(() => {
    const navEl = navRef.current;
    if (!navEl) return;
    function updateBodyPadding() {
      const height = navEl.getBoundingClientRect().height;
      document.body.style.paddingTop = `${height}px`;
    }

    updateBodyPadding();
    window.addEventListener('resize', updateBodyPadding);

    return () => {
      window.removeEventListener('resize', updateBodyPadding);
      document.body.style.paddingTop = '';
    };
  }, []);

  return (
    <nav
      ref={navRef}
      className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top"
    >
      <div
        className="container-fluid"
        style={{ width: '90vw', margin: '0 auto', display: 'flex', alignItems: 'center' }}
      >
        <Link className="navbar-brand fw-bold me-4" to="/">EXPLORE MOVIES</Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navMenu"
          aria-controls="navMenu"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navMenu">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/search">Search</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/my-reviews">My Reviews</Link>
            </li>
          </ul>

          <div className="d-flex align-items-center">
            {userEmail ? (
              <>
                <span className="navbar-text text-white me-3 text-truncate" style={{ maxWidth: '220px' }}>{userEmail}</span>
                <button className="btn btn-outline-light btn-sm" onClick={onLogout}>Logout</button>
              </>
            ) : (
              <Link to="/login" className="btn btn-outline-light btn-sm">Login</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}