import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MyReviews from './pages/MyReviews';
import MoviePage from './pages/Movie';
import BlogList from './pages/BlogList';
import BlogPost from './pages/BlogPost';
import FeaturedRedirect from './pages/FeaturedRedirect';
import EditPost from './pages/EditPost';
import { auth } from './firebase';

function AppRoutes({ user, handleLogout }) {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/search" element={<Home />} />
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
      <Route path="/my-reviews" element={user ? <MyReviews /> : <Navigate to="/login" replace />} />
      <Route path="/movie/:id" element={<MoviePage />} />

      <Route path="/blog" element={<BlogList />} />
      <Route path="/blog/featured" element={<FeaturedRedirect />} />

      {/* Edit route should come before the generic /blog/:id route */}
      <Route
        path="/blog/:id/edit"
        element={user ? <EditPost /> : <Navigate to="/login" replace />}
      />

      <Route path="/blog/:id" element={<BlogPost />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function AppWrapper() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => {
      setUser(u);
    });
    return unsub;
  }, []);

  const handleLogout = async () => {
    const ok = window.confirm('Are you sure you want to log out?');
    if (!ok) return;
    try {
      await auth.signOut();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout failed', err);
      alert('Logout failed. Check console for details.');
    }
  };

  return (
    <>
      <NavBar userEmail={user ? user.email : null} onLogout={handleLogout} />
      <AppRoutes user={user} handleLogout={handleLogout} />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

