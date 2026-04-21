import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import styles from './ProductCard.module.css';
import RatingStars from './RatingStars';
import Badge from './Badge';
import ToastNotification from './ToastNotification';
import apiClient from '../api/client';

// Inline SVG placeholder — no external service needed
const PLACEHOLDER_IMG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23F3F4F6'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='14' fill='%239CA3AF' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E`;

export default function ProductCard({ product }) {
    const navigate = useNavigate();
    const [toast, setToast] = useState(null);

    const id           = product.id;
    const name         = product.name || product.title;
    const price        = product.price;
    const oldPrice     = product.oldPrice;
    const rating       = product.rating || 0;
    const reviewCount  = product.reviewCount || 0;
    const producer     = product.producer_name || 'BuildMart Verified Supplier';
    const imageUrl     = product.image || product.image_url || PLACEHOLDER_IMG;

    // Location badge — shows when product is from a different city
    const locationBadge = product.location_match === 'different_city' && product.producer_city
        ? product.producer_city
        : null;

    // Stock status badge
    let stockBadge = null;
    if (product.stock === 0) {
        stockBadge = <Badge type="danger" text="Out of Stock" />;
    } else if (product.stock > 0 && product.stock < 10) {
        stockBadge = <Badge type="warning" text="Low Stock" />;
    }

    const handleCardClick = (e) => {
        if (!e.target.closest('button')) {
            navigate(`/products/${id}`);
        }
    };

    const handleAddToCart = (e) => {
        e.stopPropagation();
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        apiClient.post('/api/cart/items', { product_id: product.id, quantity: 1 })
            .then(() => setToast({ type: 'success', message: `Added ${name} to cart` }))
            .catch(() => setToast({ type: 'error', message: 'Failed to add to cart' }));
    };

    return (
        <div
            className={styles.card}
            onClick={handleCardClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleCardClick(e)}
        >
            <div className={styles.imageWrapper}>
                <img
                    src={imageUrl}
                    onError={(e) => { e.target.src = PLACEHOLDER_IMG }}
                    alt={name}
                    className={styles.image}
                />
                {stockBadge && <div className={styles.badgeTopRight}>{stockBadge}</div>}

                {/* Ships from badge — bottom left of image */}
                {locationBadge && (
                    <div style={{
                        position: 'absolute', bottom: 8, left: 8,
                        background: 'rgba(17,24,39,0.75)',
                        color: '#fff', fontSize: 11, fontWeight: 500,
                        padding: '3px 8px', borderRadius: 999,
                        display: 'flex', alignItems: 'center', gap: 4,
                        backdropFilter: 'blur(2px)',
                    }}>
                        📍 Ships from {locationBadge}
                    </div>
                )}
            </div>

            <div className={styles.content}>
                <h3 className={styles.title} title={name}>{name}</h3>
                <p className={styles.producer}>By {producer}</p>

                <div className={styles.ratingRow}>
                    <RatingStars value={rating} />
                    <span className={styles.reviewCount}>({reviewCount})</span>
                </div>

                <div className={styles.priceRow}>
                    <div className={styles.priceContainer}>
                        <span className={styles.price}>₹{Number(price).toLocaleString('en-IN')}</span>
                        {oldPrice && <span className={styles.oldPrice}>₹{oldPrice}</span>}
                    </div>
                    <button
                        className={styles.addBtn}
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                        aria-label="Add to cart"
                    >+</button>
                </div>
            </div>

            {toast && (
                <ToastNotification
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast(null)}
                    duration={3000}
                />
            )}
        </div>
    );
}