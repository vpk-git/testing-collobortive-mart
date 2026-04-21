// frontend/src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/client';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CONSUMER');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await apiClient.post('/api/register', { name, email, password, role });

      // Delegate ALL state + localStorage work to AuthContext.login()
      await login(response.data);

      const registeredRole = response.data.role;
      if (registeredRole === 'PRODUCER') {
        navigate('/producer/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }

    } catch (err) {
      if (err.response) {
        // The server responded with a status code that falls out of the range of 2xx
        setError(err.response?.data?.detail || "An unexpected server error occurred.");
      } else {
        // The request was made but no response was received (Network Error)
        setError("Failed to connect to the server. Please check your network or if the backend is running.");
      }
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await apiClient.post('/api/auth/google', {
        token: credentialResponse.credential,
        role: role // This grabs the role they selected from your dropdown!
      });

      // Delegate ALL state + localStorage work to AuthContext.login()
      await login(response.data);

      const registeredRole = response.data.role;
      if (registeredRole === 'PRODUCER') {
        navigate('/producer/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }

    } catch (err) {
      console.error(err);
      setError("Google registration failed.");
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Centered Form */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: 40, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', maxWidth: 440, width: '100%', margin: '20px' }}>
        <div>
          <h2 style={{ color: '#111827', fontSize: '24px', fontWeight: 800, textAlign: 'center' }}>Create an Account</h2>
          <p style={{ color: '#6B7280', marginTop: '8px', fontSize: '14px', textAlign: 'center' }}>Join the BuildMart ecosystem today.</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div>
  <label style={{ color: '#374151', fontSize: '14px', fontWeight: 500 }}>Full Name</label>
  <input
    type="text" required
    style={{ width: '100%', background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 8, padding: '10px 14px', color: '#374151', marginTop: '4px', outline: 'none' }}
    onFocus={(e) => e.target.style.borderColor = '#1E4D9B'}
    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
    placeholder="John Doe"
    value={name} onChange={(e) => setName(e.target.value)}
  />
</div>
          <div className="space-y-4">
            <div>
              <label style={{ color: '#374151', fontSize: '14px', fontWeight: 500 }}>Email address</label>
              <input
                type="email" required
                style={{ width: '100%', background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 8, padding: '10px 14px', color: '#374151', marginTop: '4px', outline: 'none' }}
                onFocus={(e) => e.target.style.borderColor = '#1E4D9B'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label style={{ color: '#374151', fontSize: '14px', fontWeight: 500 }}>Password</label>
              <input
                type="password" required minLength="6"
                style={{ width: '100%', background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 8, padding: '10px 14px', color: '#374151', marginTop: '4px', outline: 'none' }}
                onFocus={(e) => e.target.style.borderColor = '#1E4D9B'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label style={{ color: '#374151', fontSize: '14px', fontWeight: 500 }}>Account Type</label>
              <select
                style={{ width: '100%', background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 8, padding: '10px 14px', color: '#374151', marginTop: '4px', outline: 'none', cursor: 'pointer' }}
                onFocus={(e) => e.target.style.borderColor = '#1E4D9B'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                value={role} onChange={(e) => setRole(e.target.value)}
              >
                <option value="CONSUMER">Consumer (Buyer)</option>
                <option value="PRODUCER">Producer (Supplier)</option>
                <option value="LOGISTICS">Logistics (Driver)</option>
              </select>
            </div>
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 p-4 rounded-md border border-red-200 mt-4">{error}</div>}

          <button type="submit"
            style={{ width: '100%', background: '#1E4D9B', color: 'white', padding: '12px', borderRadius: 8, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'background 0.2s', marginTop: '24px' }}
            onMouseOver={(e) => e.target.style.background = '#163A7A'}
            onMouseOut={(e) => e.target.style.background = '#1E4D9B'}
          >
            Register Now
          </button>
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span style={{ backgroundColor: '#fff', padding: '0 8px', color: '#6B7280' }}>Or register with</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google Registration was closed or failed.")}
                theme="outline"
                shape="rectangular"
                text="signup_with"
              />
            </div>
          </div>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account? <Link to="/login" style={{ color: '#1E4D9B', fontWeight: 600, textDecoration: 'none' }}>Log in here</Link>
        </p>
      </div>
    </div>
  );
}