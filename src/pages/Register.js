import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Registration error', err);

      if (err.code === 'auth/email-already-in-use') {
        try {
          const methods = await fetchSignInMethodsForEmail(auth, email);
          if (methods && methods.length > 0) {
            setError('This email is already registered. Did you mean to log in?');
          } else {
            setError('This email is already in use.');
          }
        } catch (innerErr) {
          console.error('Error checking sign-in methods', innerErr);
          setError('This email is already in use.');
        }
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Use at least 6 characters.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card shadow-sm">
            <div className="card-body">
              <h4 className="card-title mb-3">Register</h4>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error} {error.includes('log in') && <Link to="/login">Login</Link>}
                </div>
              )}

              <form onSubmit={submit}>
                <div className="mb-3">
                  <input
                    className="form-control"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => {
                      setError('');
                      setEmail(e.target.value);
                    }}
                    type="email"
                  />
                </div>

                <div className="mb-3">
                  <input
                    className="form-control"
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setError('');
                      setPassword(e.target.value);
                    }}
                  />
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  <button className="btn btn-primary" type="submit" disabled={loading}>
                    {loading ? 'Registering...' : 'REGISTER'}
                  </button>

                  <small className="text-muted">
                    ALREADY HAVE NA ACCONT? <Link to="/login">LOGIN</Link>
                  </small>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;