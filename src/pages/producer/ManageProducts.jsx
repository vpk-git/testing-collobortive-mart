// frontend/src/pages/producer/ManageProducts.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import ProducerLayout from '../../components/ProducerLayout';
import Badge from '../../components/Badge';
import ConfirmDialog from '../../components/ConfirmDialog';
import ToastNotification from '../../components/ToastNotification';
import Pagination from '../../components/Pagination';

export default function ManageProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter && statusFilter !== 'All Statuses') {
        params.append('status', statusFilter.toLowerCase());
      }
      params.append('page', currentPage);
      params.append('limit', 10);
      
      const res = await apiClient.get(`/api/products/producer/me?${params.toString()}`);
      setProducts(res.data.items || []);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, statusFilter, currentPage]);

  const showToast = (type, msg) => {
    setToast({ type, message: msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(products.map(p => p.id));
    else setSelectedIds([]);
  };

  const handleSelectOne = (id, checked) => {
    if (checked) setSelectedIds(prev => [...prev, id]);
    else setSelectedIds(prev => prev.filter(item => item !== id));
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiClient.delete(`/api/products/${deleteTarget}`);
      showToast('success', 'Product deleted successfully');
      fetchProducts();
      setSelectedIds(prev => prev.filter(id => id !== deleteTarget));
    } catch (err) {
      showToast('error', 'Failed to delete product');
    } finally {
      setDeleteTarget(null);
    }
  };

  const confirmBulkDelete = async () => {
    try {
      await Promise.all(selectedIds.map(id => apiClient.delete(`/api/products/${id}`)));
      showToast('success', `${selectedIds.length} products deleted`);
      fetchProducts();
      setSelectedIds([]);
    } catch (err) {
      showToast('error', 'Failed to bulk delete products');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const toggleStatus = async (product) => {
    const newStatus = product.status === 'draft' ? 'published' : 'draft';
    try {
      const formData = new FormData();
      formData.append('title', product.title);
      formData.append('description', product.description || '');
      formData.append('price', product.price);
      formData.append('stock', product.stock);
      formData.append('category_id', product.category_id);
      formData.append('status', newStatus);
      
      const res = await apiClient.put(`/api/products/${product.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProducts(products.map(p => p.id === product.id ? { ...p, status: res.data.status } : p));
      showToast('success', `Status updated to ${newStatus}`);
    } catch (err) {
      showToast('error', 'Failed to update status');
    }
  };

  const btnPrimary = { background: '#1E4D9B', color: 'white', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer', textDecoration: 'none', display: 'inline-block', transition: 'all 0.15s ease' };
  const btnOutline = { background: 'white', border: '1.5px solid #1E4D9B', color: '#1E4D9B', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s ease' };
  const btnDanger = { background: '#DC2626', color: 'white', borderRadius: '8px', border: 'none', padding: '10px 20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s ease' };
  const inputStyle = { border: '1.5px solid #E5E7EB', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', color: '#374151', background: '#FFFFFF', minWidth: '150px', outline: 'none' };

  return (
    <ProducerLayout title="My Products" subtitle="Manage your product listings">
      {toast && <ToastNotification type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      
      {deleteTarget && (
        <ConfirmDialog 
          message="Are you sure you want to delete this product? This action cannot be undone."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          confirmText="Delete"
        />
      )}

      {isBulkDeleting && (
        <ConfirmDialog 
          message={`Are you sure you want to delete ${selectedIds.length} products?`}
          onConfirm={confirmBulkDelete}
          onCancel={() => setIsBulkDeleting(false)}
          confirmText="Delete Selected"
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#9CA3AF' }}>🔍</span>
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ ...inputStyle, width: '100%', paddingLeft: '36px' }}
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(30,77,155,0.12)'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
            />
          </div>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={inputStyle}
            onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(30,77,155,0.12)'}
            onBlur={(e) => e.target.style.boxShadow = 'none'}
          >
            <option value="">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
        <Link 
          to="/producer/products/create" 
          style={btnPrimary}
          onMouseOver={(e) => e.target.style.backgroundColor = '#163A7A'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#1E4D9B'}
        >
          + Add Product
        </Link>
      </div>

      {selectedIds.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', backgroundColor: '#EFF4FF', borderRadius: '12px', border: '1px solid #c2d6ff', marginBottom: '24px' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#1E4D9B' }}>{selectedIds.length} items selected</span>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => setSelectedIds([])} 
              style={btnOutline}
              onMouseOver={(e) => e.target.style.backgroundColor = '#EFF4FF'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
            >
              Deselect All
            </button>
            <button 
              onClick={() => setIsBulkDeleting(true)} 
              style={btnDanger}
              onMouseOver={(e) => e.target.style.backgroundColor = '#B91C1C'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#DC2626'}
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: '24px' }}>
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280', fontSize: '14px' }}>Loading products...</div>
        ) : products.length === 0 ? (
          <div style={{ padding: '60px 40px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', margin: 0 }}>No products yet</h3>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: '8px 0 24px 0' }}>Add your first product to start selling!</p>
            <Link 
              to="/producer/products/create" 
              style={btnPrimary}
              onMouseOver={(e) => e.target.style.backgroundColor = '#163A7A'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#1E4D9B'}
            >
              + Add Product
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#F1F5F9' }}>
                  <th style={{ padding: '12px 16px', width: '48px', borderBottom: '1px solid #E5E7EB' }}>
                    <input 
                      type="checkbox" 
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      checked={selectedIds.length === products.length && products.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #E5E7EB' }}>Product</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #E5E7EB' }}>Category</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #E5E7EB' }}>Price</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #E5E7EB' }}>Stock</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #E5E7EB' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right', borderBottom: '1px solid #E5E7EB' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: selectedIds.includes(p.id) ? '#EFF4FF' : '#FFFFFF', transition: 'background-color 0.15s ease' }} onMouseOver={(e) => { if (!selectedIds.includes(p.id)) e.currentTarget.style.backgroundColor = '#EFF4FF'; }} onMouseOut={(e) => { if (!selectedIds.includes(p.id)) e.currentTarget.style.backgroundColor = '#FFFFFF'; }}>
                    <td style={{ padding: '14px 16px' }}>
                      <input 
                        type="checkbox" 
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        checked={selectedIds.includes(p.id)}
                        onChange={(e) => handleSelectOne(p.id, e.target.checked)}
                      />
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {p.images?.[0]?.url ? (
                          <img src={p.images[0].url} alt={p.title} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📦</div>
                        )}
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{p.title}</div>
                          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>{p.category_name || 'No Category'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '14px', color: '#374151' }}>${Number(p.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style={{ padding: '14px 16px', fontSize: '14px' }}>
                      {p.stock === 0 ? <span style={{ color: '#DC2626', fontWeight: 600 }}>Out of Stock</span> : p.stock < 5 ? <span style={{ color: '#DC2626', fontWeight: 600 }}>{p.stock}</span> : <span style={{ color: '#374151' }}>{p.stock}</span>}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div onClick={() => toggleStatus(p)} style={{ cursor: 'pointer', display: 'inline-block' }} title="Click to toggle status">
                        <Badge status={p.status === 'published' ? 'Published' : 'Draft'} />
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <Link 
                          to={`/producer/products/${p.id}/edit`} 
                          style={{ width: '32px', height: '32px', borderRadius: '6px', color: '#1E4D9B', backgroundColor: '#EFF4FF', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background-color 0.15s ease' }} 
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#DBEAFE'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#EFF4FF'}
                          title="Edit"
                        >✏️</Link>
                        <button 
                          onClick={() => setDeleteTarget(p.id)} 
                          style={{ width: '32px', height: '32px', borderRadius: '6px', border: 'none', color: '#DC2626', backgroundColor: '#FEF2F2', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background-color 0.15s ease' }} 
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                          title="Delete"
                        >🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination current={currentPage} total={totalPages} onChange={setCurrentPage} />
    </ProducerLayout>
  );
}
