/**
 * Cart.jsx — Shopping cart page
 *
 * WHAT CHANGED IN SPRINT 3:
 * - Added `useNavigate` from react-router-dom
 * - "Proceed to Checkout" button now navigates to /checkout
 *   and passes the cartItems + total as route state so Checkout.jsx
 *   can use them without re-fetching
 *
 * Everything else is UNCHANGED from Sprint 2.
 */

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";   // ← Added useNavigate
import Navbar from "../components/Navbar";
import styles from "./Cart.module.css";
import apiClient from "../api/client";

export default function Cart() {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");
    const navigate = useNavigate();   // ← NEW: hook to programmatically navigate

    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCart = async () => {
        if (!token) return;
        try {
            setIsLoading(true);
            const cartRes = await apiClient.get('/api/cart/items');
            const rawItems = cartRes.data.items || [];

            if (rawItems.length === 0) {
                setCartItems([]);
                return;
            }

            const hydratedItems = rawItems.map(item => {
                const imageUrl = item.product.image || item.product.image_url || null;

                return {
                    cartId: item.id,
                    productId: item.product.id,
                    name: item.product.title,
                    price: parseFloat(item.product.price),
                    quantity: item.quantity,
                    image: imageUrl
                };
            });

            setCartItems(hydratedItems);
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to fetch cart");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, [token]);

    const handleUpdateQuantity = async (cartId, newQuantity) => {
        if (newQuantity < 1) return;
        try {
            await apiClient.put(`/api/cart/items/${cartId}?quantity=${newQuantity}`);
            fetchCart();
        } catch (err) {
            alert("Failed to update quantity");
        }
    };

    const handleRemoveItem = async (cartId) => {
        try {
            await apiClient.delete(`/api/cart/items/${cartId}`);
            fetchCart();
        } catch (err) {
            alert("Failed to remove item");
        }
    };

    /**
     * NEW: Navigate to the checkout page.
     *
     * We pass cartItems and financials as `state` via React Router.
     * This means Checkout.jsx can access them via `useLocation().state`
     * without making another API call. If the user refreshes on /checkout,
     * the state is lost and we redirect them back to /cart.
     */
    const handleProceedToCheckout = () => {
        navigate('/checkout', {
            state: {
                cartItems,
                subtotal,
                tax,
                total,
            }
        });
    };

    if (!token) {
        return (
            <div className={styles.pageContainer}>
                <Navbar />
                <div className={styles.mainLayout}>
                    <div className={styles.cartItems} style={{ width: '100%', textAlign: 'center' }}>
                        <h2 className={styles.sectionTitle}>Login Required</h2>
                        <p>You must be logged in to access the shopping cart.</p>
                        <Link to="/login" className={styles.shopBtn}>Proceed to Login</Link>
                    </div>
                </div>
            </div>
        );
    }

    // Calculations
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + tax;

    return (
        <div className={styles.pageContainer}>
            <Navbar />

            <div className={styles.heroSection}>
                <h1 className={styles.title}>Your Shopping Cart</h1>
                <p className={styles.subtitle}>Review your building materials before checkout.</p>
            </div>

            <main className={styles.mainLayout}>
                <div className={styles.cartItems}>
                    <h2 className={styles.sectionTitle}>Cart Items ({cartItems.length})</h2>

                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--secondary-text)' }}>
                            <p>Loading your cart...</p>
                        </div>
                    ) : error ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--error-red)' }}>
                            <p>Error: {error}</p>
                        </div>
                    ) : cartItems.length === 0 ? (
                        <div className={styles.emptyCart}>
                            <p className={styles.emptyText}>Your cart is currently empty.</p>
                            <Link to="/catalogue" className={styles.shopBtn}>
                                Browse Catalogue
                            </Link>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {cartItems.map((item) => (
                                <div key={item.cartId} style={{ display: 'flex', gap: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
                                    <img
                                        src={item.image || `https://via.placeholder.com/100?text=No+Image`}
                                        alt={item.name}
                                        style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }}
                                    />
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        <h3 style={{ margin: '0 0 8px 0', color: 'var(--dark-text)', fontSize: '18px' }}>{item.name}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                                                <button onClick={() => handleUpdateQuantity(item.cartId, item.quantity - 1)} style={{ padding: '4px 12px', background: '#f9fafb', border: 'none', cursor: 'pointer', color: '#374151' }}>-</button>
                                                <span style={{ padding: '4px 12px', background: 'white', fontSize: '14px', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>{item.quantity}</span>
                                                <button onClick={() => handleUpdateQuantity(item.cartId, item.quantity + 1)} style={{ padding: '4px 12px', background: '#f9fafb', border: 'none', cursor: 'pointer', color: '#374151' }}>+</button>
                                            </div>
                                            <button onClick={() => handleRemoveItem(item.cartId)} style={{ color: '#ef4444', background: 'none', border: 'none', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}>Remove</button>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end' }}>
                                        <span style={{ fontWeight: 'bold', fontSize: '18px', color: 'var(--primary-blue)' }}>
                                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className={styles.summarySection}>
                    <h2 className={styles.sectionTitle}>Order Summary</h2>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <span style={{ color: 'var(--secondary-text)' }}>Subtotal</span>
                        <span style={{ fontWeight: 'bold' }}>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <span style={{ color: 'var(--secondary-text)' }}>Tax (18% GST)</span>
                        <span style={{ fontWeight: 'bold' }}>₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--secondary-text)', fontSize: '13px' }}>
                        <span>Delivery charge</span>
                        <span>Calculated at checkout</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '18px' }}>Estimated Total</span>
                        <span style={{ fontWeight: 'bold', fontSize: '24px', color: 'var(--primary-blue)' }}>
                            ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>

                    {/* ← UPDATED: Now calls handleProceedToCheckout instead of doing nothing */}
                    <button
                        className={styles.shopBtn}
                        style={{
                            width: '100%',
                            opacity: cartItems.length === 0 ? 0.5 : 1,
                            cursor: cartItems.length === 0 ? 'not-allowed' : 'pointer'
                        }}
                        onClick={handleProceedToCheckout}
                        disabled={cartItems.length === 0 || isLoading}
                    >
                        Proceed to Checkout →
                    </button>
                </div>
            </main>
        </div>
    );
}