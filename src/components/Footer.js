import React from 'react';

export default function Footer() {
  return (
    <div className="container-fluid" style={{ width: '90vw', margin: '24px auto', padding: 0 }}>
      <div
        className="card text-center"
        style={{
          borderRadius: 12,
          padding: '0.6rem 1rem',
          boxShadow: '0 8px 20px rgba(32,45,67,0.06)',
          background: 'linear-gradient(90deg, rgba(255,255,255,0.98), rgba(250,250,255,0.98))'
        }}
      >
        <div className="card-body py-2">
          <div className="fw-bold" style={{ letterSpacing: 0.6, fontSize: '0.95rem' }}>
            MADE FOR EVERY AGE <span style={{ color: '#e11d48' }}>❤️</span> MAKE-A-REVIEW
          </div>
        </div>
      </div>
    </div>
  );
}