// frontend/src/components/ProducerSidebar.jsx
import { NavLink } from 'react-router-dom';

export default function ProducerSidebar() {
  const navStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: isActive ? 600 : 500,
    color: isActive ? '#1E4D9B' : '#374151',
    backgroundColor: isActive ? '#EFF4FF' : 'transparent',
    textDecoration: 'none',
    marginBottom: '2px',
    transition: 'all 0.15s ease'
  });

  return (
    <aside style={{
      position: 'fixed',
      left: 0,
      top: '64px',
      bottom: 0,
      width: '240px',
      backgroundColor: '#FFFFFF',
      borderRight: '1px solid #E5E7EB',
      overflowY: 'auto',
      padding: '16px 12px'
    }}>
      <div style={{ 
        fontSize: '11px', 
        fontWeight: 600, 
        color: '#9CA3AF', 
        letterSpacing: '0.08em', 
        padding: '8px 12px', 
        marginBottom: '4px' 
      }}>
        PRODUCER MENU
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column' }}>
        <NavLink to="/producer/dashboard" style={navStyle}>
          <span>📊</span> Overview
        </NavLink>
        <NavLink to="/producer/products" style={navStyle} end>
          <span>📦</span> My Products
        </NavLink>
        <NavLink to="/producer/products/create" style={navStyle}>
          <span>➕</span> Add Product
        </NavLink>
        
        <NavLink to="/producer/orders" style={navStyle}>
          <span>🛒</span> Orders
        </NavLink>
        
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
          borderRadius: '8px', fontSize: '14px', fontWeight: 500, color: '#9CA3AF',
          marginBottom: '2px', cursor: 'not-allowed'
        }}>
          <span>📈</span> Analytics (Coming Soon)
        </div>
      </nav>

      <div style={{ position: 'absolute', bottom: '16px', left: '24px', fontSize: '11px', color: '#9CA3AF' }}>
        Sprint 2 · BuildMart
      </div>
    </aside>
  );
}