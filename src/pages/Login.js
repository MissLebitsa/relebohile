import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';

function Login(){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [headerHeight, setHeaderHeight] = useState('70px'); 
  const navigate = useNavigate();

  useEffect(() => {
    function updateHeaderHeight() {
      const headerEl = document.querySelector('header, nav, .navbar, .header');
      if (headerEl) {
        const h = headerEl.getBoundingClientRect().height;
        setHeaderHeight(`${h}px`);
      } else {
        setHeaderHeight('70px');
      }
    }

    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try{
      await signInWithEmailAndPassword(auth,email,password);
      navigate('/');
    } catch(err){
      console.error(err);
      alert('Login failed: ' + err.message);
    }
  };

  return (
    <div className="container py-4" style={{ paddingTop: headerHeight }}>
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card shadow-sm">
            <div className="card-body">
              <h4 className="card-title mb-3">Login</h4>
              <form onSubmit={submit}>
                <div className="mb-3">
                  <input
                    className="form-control"
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={e=>setEmail(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <input
                    className="form-control"
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={e=>setPassword(e.target.value)}
                  />
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <button className="btn btn-primary" type="submit">LOGIN</button>
                  <small className="text-muted">DON'T HAVE AN ACCOUNT YET? <Link to="/register">REGISTER</Link></small>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Login;