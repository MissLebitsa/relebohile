import React, { useState } from 'react';
import axios from 'axios';

export default function QuickCreatePost({
  backendBase = (process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'),
  authToken = ''
}) {
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [body, setBody] = useState('');
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState(''); 

  const canCreate = Boolean(authToken);
  const EXCERPT_MAX = 160;
  const BODY_MAX = 2000;

  const create = async () => {
    setMsg('');
    setMsgType('');
    if (!title.trim()) {
      setMsg('Please enter a title');
      setMsgType('error');
      return;
    }

    if (!canCreate) {
      setMsg('You must be signed in to create posts.');
      setMsgType('error');
      return;
    }

    setCreating(true);
    try {
      const url = `${backendBase.replace(/\/$/, '')}/api/posts`;
      const headers = { 'Content-Type': 'application/json' };
      if (authToken) headers.Authorization = `Bearer ${authToken}`;

      const payload = {
        title: title.trim(),
        excerpt: excerpt.trim() || (body ? body.trim().slice(0, EXCERPT_MAX) : ''),
        body: body.trim(),
        featured: false
      };

      const res = await axios.post(url, payload, { headers });
      setMsg('Created: ' + (res.data?.title || res.data?.id || 'OK'));
      setMsgType('success');
      setTitle('');
      setExcerpt('');
      setBody('');
    } catch (err) {
      console.error('Create post failed', err);
      setMsg('Create failed: ' + (err.response?.data?.message || err.message));
      setMsgType('error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="card shadow-lg rounded-4 border-0">
      <div
        className="card-header text-white d-flex justify-content-between align-items-center"
        style={{
          background: 'linear-gradient(90deg, rgba(59,130,246,1) 0%, rgba(124,58,237,1) 100%)',
          borderTopLeftRadius: '0.5rem',
          borderTopRightRadius: '0.5rem'
        }}
      >
        <div>
          <h6 className="mb-0 fw-bold">Quick create post</h6>
          <small className="text-white-50">Dev only — create test posts quickly</small>
        </div>
        <span className="badge bg-light text-dark">Dev</span>
      </div>

      <div className="card-body">
        {msg && (
          <div className={`alert ${msgType === 'success' ? 'alert-success' : 'alert-danger'} d-flex align-items-center`} role="alert">
            <div className="me-2">
              {msgType === 'success' ? '✅' : '⚠️'}
            </div>
            <div className="small mb-0">{msg}</div>
          </div>
        )}

        <div className="mb-3">
          <label className="form-label small text-muted">Title</label>
          <input
            className="form-control form-control-lg"
            placeholder="Enter a catchy title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            aria-label="Post title"
          />
        </div>

        <div className="mb-3">
          <label className="form-label small text-muted">Excerpt <small className="text-muted">({excerpt.length}/{EXCERPT_MAX})</small></label>
          <input
            className="form-control"
            placeholder="Short summary or teaser (auto-generated if left blank)"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value.slice(0, EXCERPT_MAX))}
            maxLength={EXCERPT_MAX}
            aria-label="Post excerpt"
          />
        </div>

        <div className="mb-3">
          <label className="form-label small text-muted">Body <small className="text-muted">({body.length}/{BODY_MAX})</small></label>
          <textarea
            className="form-control"
            placeholder="Write the full post content here..."
            rows={6}
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, BODY_MAX))}
            maxLength={BODY_MAX}
            aria-label="Post body"
          />
        </div>

        <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2">
          <div className="d-flex gap-2">
            <button
              className="btn btn-primary btn-lg d-flex align-items-center"
              onClick={create}
              disabled={creating || !canCreate}
            >
              {creating && (
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              )}
              {creating ? 'Creating…' : 'Create post'}
            </button>

            <button
              type="button"
              className="btn btn-outline-secondary btn-lg"
              onClick={() => { setTitle(''); setExcerpt(''); setBody(''); setMsg(''); setMsgType(''); }}
            >
              Clear
            </button>
          </div>

          <div className="text-end small">
            {!canCreate ? (
              <span className="text-danger">Sign in to create posts</span>
            ) : (
              <span className="text-muted">Posting as authenticated user</span>
            )}
          </div>
        </div>

        {}
        <div className="mt-4">
          <h6 className="mb-2">Preview</h6>
          <div className="border rounded-3 p-3 bg-light">
            <h5 className="mb-1">{title || <span className="text-muted">Post title</span>}</h5>
            <p className="mb-1 text-muted small">{excerpt || (body ? body.slice(0, 120) + (body.length > 120 ? '…' : '') : <span className="text-muted">Excerpt preview</span>)}</p>
            <div className="small text-muted">{body ? body.slice(0, 240) + (body.length > 240 ? '…' : '') : <span className="text-muted">Body preview (first 240 chars)</span>}</div>
          </div>
        </div>
      </div>
    </div>
  );
}