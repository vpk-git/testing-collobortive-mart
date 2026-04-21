// frontend/src/pages/Login.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import apiClient from '../api/client';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    if (location.state?.successMessage) {
      // eslint-disable-next-line
      setSuccess(location.state.successMessage);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await apiClient.post('/api/login', { email, password });

      // Delegate ALL state + localStorage work to AuthContext.login()
      await login(response.data);

      const role = response.data.role;
      if (role === 'PRODUCER') {
        navigate('/producer/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }

    } catch (err) {
      if (err.response) {
        setError(err.response?.data?.detail || "An unexpected server error occurred.");
      } else {
        setError("Cannot connect to the server. Please check your network or if the backend is running.");
      }
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await apiClient.post('/api/auth/google', {
        token: credentialResponse.credential
      });

      // Delegate ALL state + localStorage work to AuthContext.login()
      await login(response.data);

      const role = response.data.role;
      if (role === 'PRODUCER') {
        navigate('/producer/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }

    } catch (err) {
      console.error(err);
      setError("Google authentication failed.");
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* ✅ Two-column wrapper — both sides live inside this single div */}
      <div style={{ display: 'flex', width: '100%', maxWidth: 900, margin: '20px', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB' }}>

        {/* Left Side — Login Form */}
        <div style={{ background: '#1F2937', padding: 40, flex: 1 }}>
          <div>
            <h2 style={{ color: '#F9FAFB', fontSize: '24px', fontWeight: 800, textAlign: 'center' }}>Welcome Back</h2>
            <p style={{ color: '#6B7280', marginTop: '8px', fontSize: '14px', textAlign: 'center' }}>Sign in to your BuildMart account.</p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="admin@buildmart.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && <div className="text-sm text-red-400 bg-red-900/30 p-4 rounded-md border border-red-800">{error}</div>}
            {success && <div className="text-sm text-green-400 bg-green-900/30 p-4 rounded-md border border-green-800 shadow-sm">{success}</div>}

            <button type="submit" className="w-full rounded-md bg-blue-600 py-3 font-medium text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/50">
              Sign In
            </button>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-gray-800 px-2 text-gray-400">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError("Google Login was closed or failed.")}
                  theme="filled_black"
                  shape="rectangular"
                />
              </div>
            </div>
          </form>

          <p className="text-center text-sm text-gray-400 mt-4">
            Don't have an account? <Link to="/register" className="text-blue-400 hover:text-blue-300 hover:underline font-medium">Register here</Link>
          </p>
        </div>

        {/* ✅ Right Side — Branding (now correctly INSIDE the two-column wrapper) */}
        <div className="hidden md:flex md:w-1/2 bg-gray-800 flex-col justify-center items-center p-12 relative overflow-hidden border-l border-gray-700">
          <div className="relative z-10 text-center">
            <div className="text-6xl mb-6">🏗️</div>
            <h2 className="text-3xl font-bold text-white mb-4">Manage Your Operations</h2>
            <p className="text-lg text-gray-400 max-w-sm mx-auto">
              Log in to view your personalized dashboard, track orders, and manage logistics in real-time.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}