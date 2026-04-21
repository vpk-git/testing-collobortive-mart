import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import styles from "./ProductDetail.module.css";
import Navbar from "../components/Navbar";
import ImageGallery from "../components/ImageGallery";
import RatingStars from "../components/RatingStars";
import Badge from "../components/Badge";
import Button from "../components/Button";
import SkeletonLoader from "../components/SkeletonLoader";
import ToastNotification from "../components/ToastNotification";
import ConfirmDialog from "../components/ConfirmDialog";
import apiClient from "../api/client";
import { useNavigate } from "react-router-dom";

export default function ProductDetail() {
    const { productId } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    // Toast setup
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        setIsLoading(true);

        apiClient.get(`/api/products/${productId}`)
            .then(res => {
                setProduct(res.data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error("Error loading product detail:", error);
                setProduct(null);
                setIsLoading(false);
            });
    }, [productId]);

    if (isLoading) {
        return (
            <div className={styles.pageContainer}>
                <Navbar />
                <div className={styles.mainContent}>
                    <SkeletonLoader count={1} type="text" style={{ height: 400 }} />
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className={styles.pageContainer}>
                <Navbar />
                <div className={styles.mainContent}>
                    <h2>Product not found.</h2>
                    <Link to="/catalogue">Return to Catalogue</Link>
                </div>
            </div>
        );
    }

    const productName = product.name || product.title;

    const handleQtyChange = (delta) => {
        const newQty = quantity + delta;
        if (newQty >= 1 && newQty <= (product?.stock || 1)) {
            setQuantity(newQty);
        }
    };

    const handleAddToCartClick = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        setIsConfirmOpen(true);
    };

    const confirmAddToCart = () => {
        setIsConfirmOpen(false);

        apiClient.post(`/api/cart/items`, { product_id: product.id, quantity: quantity })
            .then(() => {
                setToast({ show: true, message: `Added ${quantity} of ${productName} to cart.`, type: 'success' });
            })
            .catch(error => {
                console.error(error);
                setToast({ show: true, message: `Failed to add to cart: ${error.response?.data?.detail || error.message}`, type: 'error' });
            });
    };

    const cancelAddToCart = () => {
        setIsConfirmOpen(false);
    };

    let displayImages = [];
    if (product.images && product.images.length > 0) {
        displayImages = product.images.map(img => img.url);
    } else if (product.image_url) {
        displayImages = [product.image_url];
    }

    return (
        <div className={styles.pageContainer}>
            <Navbar />

            <main className={styles.mainContent}>
                <div className={styles.breadcrumb}>
                    <Link to="/catalogue" className={styles.breadcrumbLink}>Catalogue</Link>
                    <span> {'>'} </span>
                    <span className={styles.breadcrumbCurrent}>{productName}</span>
                </div>

                <div className={styles.productLayout}>
                    {/* Gallery Left */}
                    <div className={styles.gallerySection}>
                        {displayImages.length > 0 ? (
                            <ImageGallery images={displayImages} altText={productName} />
                        ) : (
                            <div style={{ width: '100%', height: '400px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
                                <span style={{ color: '#9ca3af' }}>No Image Available</span>
                            </div>
                        )}
                    </div>

                    {/* Info Right */}
                    <div className={styles.infoSection}>
                        <p className={styles.producerName}>{product.producer_name}</p>
                        <h1 className={styles.title}>{productName}</h1>

                        {/* Dynamic Location Box */}
                        {(product.producer_city || product.producer_area) && (
                            <div style={{
                                marginTop: '12px',
                                padding: '12px 16px',
                                background: '#F8FAFC',
                                border: '1px solid #E2E8F0',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: '#475569',
                                fontSize: '14px'
                            }}>
                                <span style={{ fontSize: '16px' }}>📍</span>
                                <span>
                                    <strong>Ships from:</strong>{' '}
                                    {product.producer_area ? `${product.producer_area}, ` : ''}{product.producer_city || 'Location unavailable'}
                                </span>
                            </div>
                        )}

                        <div className={styles.metaRow}>
                            <RatingStars value={product.rating || 0} />
                            <span className={styles.reviewCount}>({product.review_count || 0} verified reviews)</span>

                            <div className={styles.stockStatus}>
                                {product.stock > 10 ? (
                                    <Badge type="success" text="In Stock" />
                                ) : product.stock > 0 ? (
                                    <Badge type="warning" text={`Only ${product.stock} left`} />
                                ) : (
                                    <Badge type="danger" text="Out of Stock" />
                                )}
                            </div>
                        </div>

                        <div className={styles.priceDisplay}>
                            <h2 className={styles.price}>₹{Number(product.price).toLocaleString('en-IN')}</h2>
                        </div>

                        <div className={styles.description}>
                            {product.description || "No detailed description available for this product yet. It meets all BuildMart quality standards."}
                        </div>

                        <div className={styles.actionArea}>
                            <div className={styles.quantityRow}>
                                <span className={styles.qtyLabel}>Quantity:</span>
                                <div className={styles.qtyControl}>
                                    <button
                                        className={styles.qtyBtn}
                                        onClick={() => handleQtyChange(-1)}
                                        disabled={quantity <= 1 || product.stock === 0}
                                    >-</button>
                                    <input
                                        type="number"
                                        className={styles.qtyInput}
                                        value={quantity}
                                        readOnly
                                    />
                                    <button
                                        className={styles.qtyBtn}
                                        onClick={() => handleQtyChange(1)}
                                        disabled={quantity >= product.stock || product.stock === 0}
                                    >+</button>
                                </div>
                            </div>

                            <Button
                                variant="primary"
                                className={styles.addToCartBtn}
                                onClick={handleAddToCartClick}
                                disabled={product.stock === 0}
                            >
                                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className={styles.reviewsSection}>
                    <h2 className={styles.reviewsTitle}>Customer Reviews</h2>
                    <div style={{ padding: '40px', textAlign: 'center', background: '#f8f9fc', borderRadius: '12px', color: '#6b7280' }}>
                        Customer reviews coming soon!
                    </div>
                </div>
            </main>

            {toast.show && (
                <ToastNotification
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast({ show: false, message: '', type: 'success' })}
                />
            )}

            <ConfirmDialog
                isOpen={isConfirmOpen}
                title="Add to Cart"
                message={`Are you sure you want to add ${quantity} of ${productName} to your cart?`}
                onConfirm={confirmAddToCart}
                onCancel={cancelAddToCart}
            />
        </div>
    );
}