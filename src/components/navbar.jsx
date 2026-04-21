import { Link, useNavigate } from 'react-router-dom';
import LocationPill from './LocationPill'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const navigate = useNavigate();
  const { token, role, email, logout } = useAuth();

  const handleLogout = () => {
    logout()  // clears everything including bm_city, bm_area, bm_location_set
    navigate('/login');
  };

  return (
    <nav style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      height: '64px',
      backgroundColor: '#1E4D9B',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      color: 'white'
    }}>
      <Link to="/home" style={{ fontSize: '20px', fontWeight: 700, color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>🏗️</span> BuildMart
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        {!token ? (
          <>
            <Link to="/catalogue" className="text-gray-300 hover:text-white font-medium mr-4">Catalogue</Link>
            <Link to="/login" className="text-gray-300 hover:text-white font-medium mr-4">Login</Link>
            <Link to="/register" className="text-gray-300 hover:text-white font-medium">Register</Link>
          </>
        ) : role === 'CONSUMER' ? (
          <>
            <Link to="/catalogue" className="text-gray-300 hover:text-white font-medium mr-4">Catalogue</Link>
            <Link to="/cart" className="relative text-gray-300 hover:text-white font-medium mr-4 flex items-center gap-2">
              <span>🛒 Cart</span>
            </Link>
            <Link to="/dashboard" className="text-gray-300 hover:text-white font-medium">Dashboard</Link>
            <Link to="/orders" className="text-gray-300 hover:text-white font-medium">My Orders</Link>
            <LocationPill />
            <div className="flex items-center gap-3 border-l border-gray-700 pl-4 ml-2">
              <div className="flex flex-col text-right">
                <span className="text-sm font-medium text-white">{email || 'Consumer'}</span>
                <span className="text-xs text-blue-400">{role}</span>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                {email ? email.charAt(0).toUpperCase() : 'C'}
              </div>
              <button
                onClick={handleLogout}
                style={{ background: 'none', border: 'none', color: 'white', fontSize: '14px', fontWeight: 500, cursor: 'pointer', padding: 0 }}
                onMouseOver={e => e.target.style.textDecoration = 'underline'}
                onMouseOut={e => e.target.style.textDecoration = 'none'}
              >
                Logout
              </button>
            </div>
          </>
        ) : role === 'PRODUCER' ? (
          <>
            <Link to="/catalogue" className="text-gray-300 hover:text-white font-medium mr-4">Catalogue</Link>
            <Link to="/cart" className="relative text-gray-300 hover:text-white font-medium mr-4 flex items-center gap-2">
              <span>🛒 Cart</span>
            </Link>
            <Link to="/producer/dashboard" className="text-gray-300 hover:text-white font-medium">Dashboard</Link>
            <LocationPill />
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>{email}</span>
                <span style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', borderRadius: '999px', padding: '2px 8px', fontSize: '11px', marginTop: '2px' }}>PRODUCER</span>
              </div>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'white', color: '#1E4D9B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>
                {email ? email.charAt(0).toUpperCase() : 'P'}
              </div>
              <button
                onClick={handleLogout}
                style={{ background: 'none', border: 'none', color: 'white', fontSize: '14px', fontWeight: 500, cursor: 'pointer', padding: 0, marginLeft: '8px' }}
                onMouseOver={e => e.target.style.textDecoration = 'underline'}
                onMouseOut={e => e.target.style.textDecoration = 'none'}
              >
                Logout
              </button>
            </div>
          </>
        ) : null}
      </div>
    </nav>
  );
}