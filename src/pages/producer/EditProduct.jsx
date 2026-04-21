// frontend/src/pages/producer/EditProduct.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import apiClient from '../../api/client';
import ProducerLayout from '../../components/ProducerLayout';
import ToastNotification from '../../components/ToastNotification';
import ConfirmDialog from '../../components/ConfirmDialog';
import SkeletonLoader from '../../components/SkeletonLoader';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [deleteTargetImage, setDeleteTargetImage] = useState(null);

  const [form, setForm] = useState({
    title: '', description: '', price: '', stock: '', category_id: '', status: 'published'
  });
  
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, prodRes] = await Promise.all([
          apiClient.get('/api/categories'),
          apiClient.get(`/api/products/${id}`)
        ]);
        setCategories(catsRes.data);
        const p = prodRes.data;
        setForm({
          title: p.title || '',
          description: p.description || '',
          price: p.price || '',
          stock: p.stock || 0,
          category_id: p.category_id || '',
          status: p.status || 'published'
        });
        setExistingImages(p.images || []);
      } catch (err) {
        showToast('error', 'Failed to load product data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const showToast = (type, msg) => {
    setToast({ type, message: msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFiles(e.dataTransfer.files);
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) handleFiles(e.target.files);
  };

  const handleFiles = (files) => {
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    const newlyAdded = validFiles.map(file => ({ file, preview: URL.createObjectURL(file) }));
    setNewImages(prev => [...prev, ...newlyAdded]);
  };

  const removeNewImage = (index) => {
    setNewImages(prev => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index].preview);
      copy.splice(index, 1);
      return copy;
    });
  };

  const handleConfirmImageDelete = async () => {
    try {
      await apiClient.delete(`/api/products/${id}/images/${deleteTargetImage}`);
      setExistingImages(prev => prev.filter(img => img.id !== deleteTargetImage));
      showToast('success', 'Image default successfully');
    } catch (err) {
      showToast('error', 'Failed to delete image');
    } finally {
      setDeleteTargetImage(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.category_id) {
      showToast('error', 'Please fill in all required fields');
      return;
    }

    try {
      setIsSaving(true);
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('price', form.price);
      formData.append('stock', form.stock || 0);
      formData.append('category_id', form.category_id);
      formData.append('status', form.status);
      
      newImages.forEach(img => { formData.append('new_images', img.file); });

      await apiClient.put(`/api/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      showToast('success', 'Product updated successfully!');
      setTimeout(() => navigate('/producer/products'), 1500);
    } catch (err) {
      showToast('error', 'Failed to update product. Please try again.');
      setIsSaving(false);
    }
  };

  const inputStyle = { border: '1.5px solid #E5E7EB', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', color: '#374151', background: '#FFFFFF', width: '100%', outline: 'none' };
  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' };
  const sectionTitle = { fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '24px' };
  const cardStyle = { background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' };
  
  const btnPrimary = { background: '#1E4D9B', color: 'white', borderRadius: '8px', padding: '12px 24px', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.15s ease', flex: 1 };
  const btnOutline = { background: 'white', border: '1.5px solid #E5E7EB', color: '#111827', borderRadius: '8px', padding: '12px 24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', flex: 1 };

  return (
    <ProducerLayout title="Edit Product" subtitle="Update your product listing details">
      {toast && <ToastNotification type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      
      {deleteTargetImage && (
        <ConfirmDialog 
          message="Are you sure you want to delete this image? This action cannot be undone."
          onConfirm={handleConfirmImageDelete}
          onCancel={() => setDeleteTargetImage(null)}
          confirmText="Delete Image"
        />
      )}

      {isLoading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}><SkeletonLoader type="card" /></div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* LEFT COLUMN: Form 65% */}
          <div style={{ flex: '65%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={cardStyle}>
              <h2 style={sectionTitle}>Product Information</h2>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Product Title <span style={{color: '#DC2626'}}>*</span></label>
                <input name="title" value={form.title} onChange={(e) => setForm(f => ({...f, title: e.target.value}))} style={inputStyle} required />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Description</label>
                <textarea name="description" value={form.description} onChange={(e) => setForm(f => ({...f, description: e.target.value}))} style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} rows="4"></textarea>
              </div>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Price (₹) <span style={{color: '#DC2626'}}>*</span></label>
                  <input type="number" step="0.01" min="0" name="price" value={form.price} onChange={(e) => setForm(f => ({...f, price: e.target.value}))} style={inputStyle} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Stock (units)</label>
                  <input type="number" min="0" name="stock" value={form.stock} onChange={(e) => setForm(f => ({...f, stock: e.target.value}))} style={inputStyle} />
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Category <span style={{color: '#DC2626'}}>*</span></label>
                <select name="category_id" value={form.category_id} onChange={(e) => setForm(f => ({...f, category_id: e.target.value}))} style={inputStyle} required>
                  <option value="">Select a category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div style={cardStyle}>
              <h2 style={sectionTitle}>Publishing</h2>
              <div style={{ display: 'flex', gap: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#374151' }}>
                  <input type="radio" name="status" value="published" checked={form.status === 'published'} onChange={(e) => setForm(f => ({...f, status: e.target.value}))} style={{ width: '16px', height: '16px', accentColor: '#1E4D9B' }} />
                  <strong>Published</strong>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#374151' }}>
                  <input type="radio" name="status" value="draft" checked={form.status === 'draft'} onChange={(e) => setForm(f => ({...f, status: e.target.value}))} style={{ width: '16px', height: '16px', accentColor: '#1E4D9B' }} />
                  <strong>Draft</strong>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <button 
                type="button" 
                onClick={() => navigate('/producer/products')} 
                style={btnOutline}
                onMouseOver={(e) => e.target.style.backgroundColor = '#F9FAFB'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSaving} 
                style={{ ...btnPrimary, background: isSaving ? '#9CA3AF' : '#1E4D9B', cursor: isSaving ? 'not-allowed' : 'pointer' }}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Images 35% */}
          <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Dedicated upload page shortcut */}
            <div style={{ ...cardStyle, background: '#EFF4FF', border: '1.5px solid #C7D7F8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '28px' }}>📸</span>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#1E4D9B', margin: 0 }}>Dedicated Image Upload</p>
                  <p style={{ fontSize: '12px', color: '#4B6AB8', margin: '2px 0 0' }}>Camera + browse + drag & drop</p>
                </div>
              </div>
              <Link
                to={`/producer/products/${id}/images`}
                style={{ display: 'block', textAlign: 'center', background: '#1E4D9B', color: 'white', borderRadius: '8px', padding: '10px 16px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}
              >
                Open Photo Manager →
              </Link>
            </div>

            <div style={cardStyle}>
              <h2 style={sectionTitle}>Current Images</h2>
              {existingImages.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {existingImages.map((img, idx) => (
                    <div key={img.id} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E5E7EB' }}>
                      <img src={img.url} alt="existing" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button type="button" onClick={() => setDeleteTargetImage(img.id)} style={{ position: 'absolute', top: '4px', right: '4px', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#DC2626', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px' }}>×</button>
                      {idx === 0 && <span style={{ position: 'absolute', bottom: '4px', left: '4px', background: '#0F6E56', color: 'white', fontSize: '9px', fontWeight: 700, padding: '2px 5px', borderRadius: '4px' }}>MAIN</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 0', color: '#9CA3AF' }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>📭</div>
                  <p style={{ fontSize: '13px', margin: 0 }}>No photos yet.</p>
                  <Link to={`/producer/products/${id}/images`} style={{ fontSize: '13px', color: '#1E4D9B', fontWeight: 600 }}>Upload photos →</Link>
                </div>
              )}
            </div>

            <div style={cardStyle}>
              <h2 style={sectionTitle}>Quick Add Images</h2>
              <div
                onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                style={{ border: `2px dashed ${dragActive ? '#1E4D9B' : '#CBD5E1'}`, borderRadius: '12px', padding: '24px', textAlign: 'center', backgroundColor: dragActive ? '#EFF4FF' : '#F8F9FC', transition: 'all 0.15s ease', cursor: 'pointer', marginBottom: '16px' }}
                onClick={() => fileInputRef.current.click()}
              >
                <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleChange} style={{ display: 'none' }} />
                <div style={{ fontSize: '28px', marginBottom: '6px' }}>📤</div>
                <p style={{ fontSize: '13px', color: '#374151', margin: '0 0 2px 0', fontWeight: 500 }}>Drag & drop or click to browse</p>
                <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>PNG, JPG up to 10MB</p>
              </div>

              {newImages.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {newImages.map((img, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '2px solid #1E4D9B' }}>
                      <img src={img.preview} alt={`new-preview-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button type="button" onClick={(e) => { e.stopPropagation(); removeNewImage(idx); }} style={{ position: 'absolute', top: '4px', right: '4px', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#DC2626', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px' }}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>
      )}
    </ProducerLayout>
  );
}