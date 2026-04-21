/**
 * UploadImages.jsx
 *
 * Dedicated image upload page for a specific product.
 * Linked from chatbot success message: /producer/products/:id/images
 *
 * Features:
 *  - Drag & drop upload zone
 *  - Browse files (opens OS file picker)
 *  - Camera capture (opens device camera on mobile / webcam on desktop)
 *  - Preview grid with remove option
 *  - Shows existing images already uploaded for the product
 *  - Delete existing images
 *  - Upload new images via PUT /api/products/:id
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import apiClient from '../../api/client';
import ProducerLayout from '../../components/ProducerLayout';
import ToastNotification from '../../components/ToastNotification';
import ConfirmDialog from '../../components/ConfirmDialog';
import SkeletonLoader from '../../components/SkeletonLoader';

export default function UploadImages() {
  const { id } = useParams();
  const navigate = useNavigate();

  const browseRef  = useRef(null);
  const cameraRef  = useRef(null);

  const [product, setProduct]                   = useState(null);
  const [existingImages, setExistingImages]     = useState([]);
  const [newImages, setNewImages]               = useState([]);  // { file, preview }
  const [dragActive, setDragActive]             = useState(false);
  const [isLoading, setIsLoading]               = useState(true);
  const [isUploading, setIsUploading]           = useState(false);
  const [toast, setToast]                       = useState(null);
  const [deleteTargetId, setDeleteTargetId]     = useState(null);

  // ── Load product info ──────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.get(`/api/products/${id}`);
        setProduct(res.data);
        setExistingImages(res.data.images || []);
      } catch {
        showToast('error', 'Could not load product. Check the link and try again.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // ── File handling ──────────────────────────────────────────────────────────
  const addFiles = (files) => {
    const valid = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (valid.length === 0) {
      showToast('error', 'Only image files are allowed (JPG, PNG, WEBP).');
      return;
    }
    const previews = valid.map(file => ({ file, preview: URL.createObjectURL(file) }));
    setNewImages(prev => [...prev, ...previews]);
  };

  const handleBrowse = (e) => {
    if (e.target.files?.length) addFiles(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else setDragActive(false);
  };

  const removeNew = (idx) => {
    setNewImages(prev => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[idx].preview);
      copy.splice(idx, 1);
      return copy;
    });
  };

  // ── Delete existing image ──────────────────────────────────────────────────
  const confirmDeleteExisting = async () => {
    try {
      await apiClient.delete(`/api/products/${id}/images/${deleteTargetId}`);
      setExistingImages(prev => prev.filter(img => img.id !== deleteTargetId));
      showToast('success', 'Image removed.');
    } catch {
      showToast('error', 'Failed to remove image.');
    } finally {
      setDeleteTargetId(null);
    }
  };

  // ── Upload new images ──────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (newImages.length === 0) {
      showToast('error', 'Please add at least one image to upload.');
      return;
    }
    try {
      setIsUploading(true);

      // We send a multipart PUT — only images field changes, rest is preserved
      const formData = new FormData();
      formData.append('title',       product.title);
      formData.append('description', product.description || '');
      formData.append('price',       product.price);
      formData.append('stock',       product.stock);
      formData.append('category_id', product.category_id || '');
      formData.append('status',      product.status || 'published');
      newImages.forEach(img => formData.append('new_images', img.file));

      await apiClient.put(`/api/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Refresh image list
      const res = await apiClient.get(`/api/products/${id}`);
      setExistingImages(res.data.images || []);

      // Clear pending previews
      newImages.forEach(img => URL.revokeObjectURL(img.preview));
      setNewImages([]);

      showToast('success', `${newImages.length} image${newImages.length > 1 ? 's' : ''} uploaded!`);
    } catch {
      showToast('error', 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // ── Styles ─────────────────────────────────────────────────────────────────
  const card    = { background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' };
  const label   = { fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px', display: 'block' };
  const thumbW  = 96;

  const dropZone = {
    border: `2px dashed ${dragActive ? '#1E4D9B' : '#CBD5E1'}`,
    borderRadius: '14px',
    padding: '44px 24px',
    textAlign: 'center',
    background: dragActive ? '#EFF4FF' : '#F8FAFF',
    transition: 'all 0.15s ease',
    cursor: 'pointer',
  };

  const btnPrimary = {
    background: isUploading ? '#9CA3AF' : '#1E4D9B',
    color: 'white', border: 'none', borderRadius: '8px',
    padding: '12px 28px', fontSize: '14px', fontWeight: 600,
    cursor: isUploading ? 'not-allowed' : 'pointer',
    transition: 'background 0.15s ease',
  };

  const btnOutline = {
    background: 'white', border: '1.5px solid #E5E7EB',
    color: '#374151', borderRadius: '8px',
    padding: '12px 24px', fontSize: '14px', fontWeight: 600,
    cursor: 'pointer',
  };

  const cameraBtn = {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    background: '#0F6E56', color: 'white', border: 'none',
    borderRadius: '8px', padding: '10px 20px', fontSize: '14px',
    fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s',
  };

  const browseBtn = {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    background: '#1E4D9B', color: 'white', border: 'none',
    borderRadius: '8px', padding: '10px 20px', fontSize: '14px',
    fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s',
  };

  const thumbBox = (extra = {}) => ({
    position: 'relative', width: thumbW, height: thumbW,
    borderRadius: '8px', overflow: 'hidden',
    border: '1px solid #E5E7EB', flexShrink: 0,
    ...extra,
  });

  const delBtn = {
    position: 'absolute', top: 4, right: 4,
    width: 22, height: 22, borderRadius: '50%',
    background: '#DC2626', color: 'white', border: 'none',
    fontSize: 14, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', lineHeight: 1,
  };

  return (
    <ProducerLayout
      title="Upload Product Images"
      subtitle={product ? `Photos for: ${product.title}` : 'Loading product…'}
    >
      {toast && <ToastNotification type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {deleteTargetId && (
        <ConfirmDialog
          message="Delete this image? This cannot be undone."
          onConfirm={confirmDeleteExisting}
          onCancel={() => setDeleteTargetId(null)}
          confirmText="Delete"
        />
      )}

      {isLoading ? (
        <div style={{ padding: 40, textAlign: 'center' }}><SkeletonLoader type="card" /></div>
      ) : !product ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <p style={{ fontSize: 16, color: '#6B7280' }}>Product not found.</p>
          <Link to="/producer/products" style={{ color: '#1E4D9B', fontWeight: 600 }}>← Back to My Products</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>

          {/* ── LEFT: Drop zone + action buttons ── */}
          <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Drop zone */}
            <div
              style={card}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 20, marginTop: 0 }}>
                Add Images
              </h2>

              {/* Big drop target */}
              <div
                style={dropZone}
                onClick={() => browseRef.current.click()}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>🖼️</div>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 6px' }}>
                  Drag & drop images here
                </p>
                <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
                  JPG, PNG, WEBP · up to 10 MB each
                </p>
              </div>

              {/* Hidden inputs */}
              <input
                ref={browseRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleBrowse}
                style={{ display: 'none' }}
              />
              {/* capture="environment" → rear camera on mobile, webcam on desktop */}
              <input
                ref={cameraRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleBrowse}
                style={{ display: 'none' }}
              />

              {/* Action buttons row */}
              <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
                <button style={browseBtn} onClick={() => browseRef.current.click()}>
                  <span style={{ fontSize: 16 }}>📁</span> Browse Files
                </button>
                <button style={cameraBtn} onClick={() => cameraRef.current.click()}>
                  <span style={{ fontSize: 16 }}>📷</span> Open Camera
                </button>
              </div>

              <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 12, marginBottom: 0 }}>
                Camera opens device camera on mobile, or webcam on desktop.
              </p>
            </div>

            {/* Upload + nav buttons */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button style={btnOutline} onClick={() => navigate(`/producer/products/${id}/edit`)}>
                ← Edit Product
              </button>
              <button
                style={{ ...btnPrimary, flex: 1 }}
                disabled={isUploading || newImages.length === 0}
                onClick={handleUpload}
              >
                {isUploading
                  ? 'Uploading…'
                  : `Upload ${newImages.length > 0 ? newImages.length + ' ' : ''}Image${newImages.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>

          {/* ── RIGHT: Previews + existing ── */}
          <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Staged (pending upload) */}
            {newImages.length > 0 && (
              <div style={card}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16, marginTop: 0 }}>
                  Ready to upload ({newImages.length})
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {newImages.map((img, idx) => (
                    <div key={idx} style={thumbBox({ border: '2px solid #1E4D9B' })}>
                      <img src={img.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button style={delBtn} onClick={() => removeNew(idx)}>×</button>
                      {/* "New" badge */}
                      <span style={{
                        position: 'absolute', bottom: 4, left: 4,
                        background: '#1E4D9B', color: 'white',
                        fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 4,
                      }}>NEW</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Existing images */}
            <div style={card}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16, marginTop: 0 }}>
                Current Images ({existingImages.length})
              </h2>
              {existingImages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#9CA3AF' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                  <p style={{ fontSize: 13, margin: 0 }}>No images yet. Upload some!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {existingImages.map((img, idx) => (
                    <div key={img.id} style={thumbBox()}>
                      <img
                        src={img.url}
                        alt={`product-${idx}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <button style={delBtn} onClick={() => setDeleteTargetId(img.id)}>×</button>
                      {idx === 0 && (
                        <span style={{
                          position: 'absolute', bottom: 4, left: 4,
                          background: '#0F6E56', color: 'white',
                          fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 4,
                        }}>MAIN</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tips */}
            <div style={{ ...card, background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#065F46', marginTop: 0, marginBottom: 8 }}>
                📸 Photo tips
              </h3>
              <ul style={{ fontSize: 13, color: '#047857', margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
                <li>First image becomes the main listing photo</li>
                <li>Use natural lighting for best results</li>
                <li>Include multiple angles</li>
                <li>Show the packaging/label clearly</li>
                <li>Max 10 MB per image · JPG/PNG/WEBP</li>
              </ul>
            </div>
          </div>

        </div>
      )}
    </ProducerLayout>
  );
}