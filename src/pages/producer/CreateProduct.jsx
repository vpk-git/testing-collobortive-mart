// frontend/src/pages/producer/CreateProduct.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import ProducerLayout from '../../components/ProducerLayout';
import ToastNotification from '../../components/ToastNotification';
import ProducerLocationSetup from './ProducerLocationSetup'
import { useAuth } from '../../context/AuthContext'

export default function CreateProduct() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const { location_set } = useAuth()
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    status: 'published'
  });
  
  const [images, setImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    apiClient.get('/api/categories').then(res => {
      setCategories(res.data);
    }).catch(err => {
      showToast('error', 'Failed to load categories');
    });
  }, []);

  const showToast = (type, msg) => {
    setToast({ type, message: msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleInputChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    const newImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setImages(prev => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index].preview);
      copy.splice(index, 1);
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.category_id) {
      showToast('error', 'Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('price', form.price);
      formData.append('stock', form.stock || 0);
      formData.append('category_id', form.category_id);
      formData.append('status', form.status);
      
      images.forEach(img => {
        formData.append('images', img.file);
      });

      await apiClient.post('/api/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      showToast('success', 'Product created successfully!');
      setTimeout(() => navigate('/producer/products'), 1500);
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to create product. Please try again.');
      setIsSubmitting(false);
    }
  };

  const inputStyle = { border: '1.5px solid #E5E7EB', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', color: '#374151', background: '#FFFFFF', width: '100%', outline: 'none' };
  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' };
  const sectionTitle = { fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '24px' };
  const cardStyle = { background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' };

  return (
    <ProducerLayout title="Add New Product" subtitle="Fill in the details to create a new product listing">
      {toast && <ToastNotification type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* LEFT COLUMN: Form 65% */}
        <div style={{ flex: '65%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {!location_set && <ProducerLocationSetup onComplete={() => {}} />}
          <div style={cardStyle}>
            <h2 style={sectionTitle}>Product Information</h2>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Product Title <span style={{color: '#DC2626'}}>*</span></label>
              <input name="title" value={form.title} onChange={handleInputChange} style={inputStyle} placeholder="e.g. Portland Cement 50kg" required />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Description</label>
              <textarea name="description" value={form.description} onChange={handleInputChange} style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} placeholder="Detail the specifications, dimensions, materials, etc." rows="4"></textarea>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Price (₹) <span style={{color: '#DC2626'}}>*</span></label>
                <input type="number" step="0.01" min="0" name="price" value={form.price} onChange={handleInputChange} style={inputStyle} placeholder="0.00" required />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Stock (units)</label>
                <input type="number" min="0" name="stock" value={form.stock} onChange={handleInputChange} style={inputStyle} placeholder="0" />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Category <span style={{color: '#DC2626'}}>*</span></label>
              <select name="category_id" value={form.category_id} onChange={handleInputChange} style={inputStyle} required>
                <option value="">Select a category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={cardStyle}>
            <h2 style={sectionTitle}>Publishing</h2>
            <div style={{ display: 'flex', gap: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#374151' }}>
                <input type="radio" name="status" value="published" checked={form.status === 'published'} onChange={handleInputChange} style={{ width: '16px', height: '16px', accentColor: '#1E4D9B' }} />
                <strong>Published</strong> — Visible on the store immediately
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#374151' }}>
                <input type="radio" name="status" value="draft" checked={form.status === 'draft'} onChange={handleInputChange} style={{ width: '16px', height: '16px', accentColor: '#1E4D9B' }} />
                <strong>Draft</strong> — Hidden, save for later
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{ 
              background: isSubmitting ? '#9CA3AF' : '#1E4D9B', 
              color: 'white', 
              borderRadius: '8px', 
              padding: '12px 24px', 
              fontSize: '14px', 
              fontWeight: 600, 
              border: 'none', 
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              width: '100%',
              transition: 'background-color 0.15s ease'
            }}
          >
            {isSubmitting ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                 <span style={{ width: '16px', height: '16px', border: '2px solid transparent', borderTopColor: 'currentColor', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> Creating...
              </span>
            ) : "Create Product"}
          </button>
        </div>

        {/* RIGHT COLUMN: Images 35% */}
        <div style={{ flex: '1 1 300px' }}>
          <div style={cardStyle}>
            <h2 style={sectionTitle}>Product Images</h2>
            <div 
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              style={{
                border: `2px dashed ${dragActive ? '#1E4D9B' : '#CBD5E1'}`,
                borderRadius: '12px',
                padding: '32px',
                textAlign: 'center',
                backgroundColor: dragActive ? '#EFF4FF' : '#F8F9FC',
                transition: 'all 0.15s ease',
                cursor: 'pointer',
                marginBottom: '24px'
              }}
              onClick={() => fileInputRef.current.click()}
            >
              <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleChange} style={{ display: 'none' }} />
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📤</div>
              <p style={{ fontSize: '14px', color: '#374151', margin: '0 0 4px 0', fontWeight: 500 }}>
                Drag & drop images here
              </p>
              <p style={{ fontSize: '14px', color: '#1E4D9B', margin: '0 0 8px 0', fontWeight: 500 }}>
                or click to browse
              </p>
              <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>
                PNG, JPG up to 10MB
              </p>
            </div>

            {images.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {images.map((img, idx) => (
                  <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E5E7EB' }}>
                    <img src={img.preview} alt={`preview ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                      style={{ position: 'absolute', top: '4px', right: '4px', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#DC2626', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px', opacity: 0.9 }}
                    >×</button>
                    {idx === 0 && (
                      <span style={{ position: 'absolute', bottom: '4px', left: '4px', backgroundColor: 'rgba(17,24,39,0.7)', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>Primary</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </form>
    </ProducerLayout>
  );
}
