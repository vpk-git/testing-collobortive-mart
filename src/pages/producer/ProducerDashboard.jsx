// frontend/src/pages/producer/ProducerDashboard.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import ProducerLayout from '../../components/ProducerLayout';
import SkeletonLoader from '../../components/SkeletonLoader';
import Badge from '../../components/Badge';
import ProducerLocationSetup from './ProducerLocationSetup';
import { useAuth } from '../../context/AuthContext';

export default function ProducerDashboard() {
  const navigate = useNavigate();
  const { token, role, location_set } = useAuth();

  // Synchronous auth guard
  if (!token) { navigate('/login'); return null; }
  if (role !== 'PRODUCER') { navigate('/dashboard'); return null; }

  const [stats, setStats] = useState(null);
  const [recentProducts, setRecentProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [statsRes, productsRes] = await Promise.all([
        apiClient.get('/api/products/producer/stats'),
        apiClient.get('/api/products/producer/me?limit=20') // Get enough to find low stock easily
      ]);
      
      setStats(statsRes.data);
      // Recent 5
      setRecentProducts(productsRes.data.items?.slice(0, 5) || []);
      // Low stock 
      setLowStock(productsRes.data.items?.filter(p => p.stock < 5) || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Failed to load dashboard data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon, iconBg, trendText, trendColor }) => (
    <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px', flex: '1 1 200px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {title}
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#111827', marginTop: '12px' }}>
            {value}
          </div>
          {trendText && (
            <div style={{ fontSize: '12px', color: trendColor, marginTop: '8px', fontWeight: 500 }}>
              {trendText}
            </div>
          )}
        </div>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <ProducerLayout title="Dashboard" subtitle="Welcome back — here's your store overview">
      {!location_set && (
        <ProducerLocationSetup onComplete={() => {}} />
      )}
      {error && (
        <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', fontWeight: 500 }}>{error}</span>
          <button onClick={fetchDashboardData} style={{ background: 'none', border: 'none', color: '#B91C1C', fontWeight: 600, cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}>Retry</button>
        </div>
      )}

      {isLoading ? (
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {[1, 2, 3, 4].map(i => <div key={i} style={{ flex: '1 1 200px' }}><SkeletonLoader type="card" /></div>)}
        </div>
      ) : (
        <>
          {/* Row 1: Stat Cards */}
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '24px' }}>
            <StatCard 
              title="Total Products" 
              value={stats?.total_products || 0} 
              icon="📦" iconBg="#EFF4FF" 
              trendText={`+${stats?.published_products || 0} published`} trendColor="#16A34A" 
            />
            <StatCard 
              title="Published" 
              value={stats?.published_products || 0} 
              icon="✅" iconBg="#F0FDF4" 
            />
            <StatCard 
              title="Drafts" 
              value={stats?.draft_products || 0} 
              icon="📝" iconBg="#FFFBEB" 
            />
            <StatCard 
              title="Low Stock Alerts" 
              value={stats?.low_stock_count || 0} 
              icon="⚠️" iconBg="#FEF2F2" 
              trendText={stats?.low_stock_count > 0 ? 'Requires attention' : 'All good'}
              trendColor={stats?.low_stock_count > 0 ? '#DC2626' : '#16A34A'}
            />
          </div>

          {/* Row 2: 60/40 Split */}
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            
            {/* Left Col: Recent Products */}
            <div style={{ flex: '3 1 500px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', margin: 0 }}>Recent Products</h2>
                <Link to="/producer/products" style={{ fontSize: '14px', color: '#1E4D9B', fontWeight: 500, textDecoration: 'none' }}>View all →</Link>
              </div>
              
              {recentProducts.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280', fontSize: '14px' }}>No products found.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F1F5F9' }}>
                      <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stock</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                      <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentProducts.map((p) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #E5E7EB', transition: 'background-color 0.15s ease' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#EFF4FF'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <td style={{ padding: '14px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {p.images?.[0]?.url ? (
                              <img src={p.images[0].url} alt={p.title} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>📦</div>
                            )}
                            <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{p.title}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '14px', color: '#374151' }}>{p.category_name || '-'}</td>
                        <td style={{ padding: '14px 16px', fontSize: '14px', color: '#374151' }}>${Number(p.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td style={{ padding: '14px 16px', fontSize: '14px', color: p.stock < 5 ? '#DC2626' : '#374151', fontWeight: p.stock < 5 ? 600 : 400 }}>{p.stock === 0 ? 'Out of Stock' : p.stock}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <Badge status={p.status === 'published' ? 'Published' : 'Draft'} />
                        </td>
                        <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                          <Link to={`/producer/products/${p.id}/edit`} style={{ fontSize: '14px', color: '#1E4D9B', fontWeight: 500, textDecoration: 'none' }}>Edit</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Right Col: Low Stock Alerts */}
            <div style={{ flex: '2 1 300px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px', alignSelf: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', margin: 0 }}>Low Stock Alerts</h2>
                {lowStock.length > 0 && (
                  <span style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: '999px', padding: '2px 8px', fontSize: '12px', fontWeight: 600 }}>
                    {lowStock.length}
                  </span>
                )}
              </div>
              
              {lowStock.length === 0 ? (
                <div style={{ backgroundColor: '#F0FDF4', color: '#16A34A', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: 500, textAlign: 'center', border: '1px solid #BBF7D0' }}>
                  All products well stocked 🎉
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {lowStock.map((p) => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #E5E7EB' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {p.images?.[0]?.url ? (
                          <img src={p.images[0].url} alt={p.title} style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '36px', height: '36px', borderRadius: '6px', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>📦</div>
                        )}
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{p.title}</div>
                          <div style={{ fontSize: '13px', color: '#DC2626', fontWeight: 600, marginTop: '2px' }}>{p.stock === 0 ? 'Out of stock' : `${p.stock} units left`}</div>
                        </div>
                      </div>
                      <Link to={`/producer/products/${p.id}/edit`} style={{ fontSize: '13px', color: '#1E4D9B', fontWeight: 600, textDecoration: 'none', backgroundColor: '#EFF4FF', padding: '6px 12px', borderRadius: '6px' }}>Edit</Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </>
      )}
    </ProducerLayout>
  );
}