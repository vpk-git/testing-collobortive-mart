/**
 * OrderConfirmation.jsx — Order success page (Sprint 3)
 *
 * WHAT THIS PAGE DOES:
 * This page is shown immediately after a successful order placement.
 * It receives the order data via React Router's `location.state` —
 * data that was passed when Checkout.jsx called navigate('/order-confirmation', { state: {...} }).
 *
 * WHY USE ROUTE STATE INSTEAD OF AN API CALL?
 * We already have the order data from the create-order response.
 * Making another API call would be unnecessary. Route state is the
 * clean solution — it's available immediately and doesn't cost a round trip.
 *
 * EDGE CASE: If the user bookmarks this page or refreshes, location.state
 * will be null. We handle this by redirecting to /orders (order history).
 *
 * WHAT'S SHOWN:
 * - Big ✅ confirmation with order ID
 * - Full price breakdown (subtotal, GST, delivery, total)
 * - Payment method and status
 * - List of items ordered
 * - Next steps / what happens next
 * - Links to "View All Orders" and "Continue Shopping"
 */

import { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import styles from "./OrderConfirmation.module.css";

export default function OrderConfirmation() {
    const location = useLocation();
    const navigate = useNavigate();

    // Pull data from route state
    const orderData = location.state?.orderData;
    const cartItems = location.state?.cartItems || [];

    // If no order data (e.g., direct navigation or refresh), redirect
    useEffect(() => {
        if (!orderData) {
            navigate('/orders', { replace: true });
        }
    }, [orderData, navigate]);

    if (!orderData) return null;

    /**
     * Format a number as Indian currency string
     * e.g., 12345.50 → "₹12,345.50"
     */
    const formatINR = (amount) =>
        `₹${parseFloat(amount).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

    /**
     * Get a human-readable label for the payment status
     */
    const getPaymentStatusLabel = (status) => {
        switch (status) {
            case 'PAID': return { label: '✅ Payment Confirmed', color: '#059669' };
            case 'CREDIT': return { label: '📋 Credit Approved', color: '#d97706' };
            case 'PENDING': return { label: '⏳ Payment Pending', color: '#6b7280' };
            default: return { label: status, color: '#6b7280' };
        }
    };

    const paymentStatusInfo = getPaymentStatusLabel(orderData.payment_status);

    /**
     * Format order ID for display — show first 8 chars for brevity
     * Full ID is still accessible for support use
     */
    const shortOrderId = orderData.order_id
        ? orderData.order_id.toString().split('-')[0].toUpperCase()
        : '—';

    return (
        <div className={styles.pageContainer}>
            <Navbar />

            {/* ── Big success header ── */}
            <div className={styles.successHeader}>
                <div className={styles.successIcon}>✅</div>
                <h1 className={styles.successTitle}>Order Placed Successfully!</h1>
                <p className={styles.successSubtitle}>
                    Your order has been received and is being processed.
                </p>
                <div className={styles.orderIdBadge}>
                    Order ID: <strong>{shortOrderId}</strong>
                    <span className={styles.orderIdFull}>(#{orderData.order_id})</span>
                </div>
            </div>

            <main className={styles.mainLayout}>

                {/* ── LEFT: Price breakdown + items ── */}
                <div className={styles.leftColumn}>

                    {/* Price breakdown card */}
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>💰 Price Breakdown</h2>

                        <div className={styles.priceRow}>
                            <span>Subtotal</span>
                            <span>{formatINR(orderData.subtotal)}</span>
                        </div>
                        <div className={styles.priceRow}>
                            <span>GST (18%)</span>
                            <span>{formatINR(orderData.gst_amount)}</span>
                        </div>
                        <div className={styles.priceRow}>
                            <span>
                                Delivery
                                {orderData.distance_km && (
                                    <span className={styles.distanceNote}> ({orderData.distance_km} km)</span>
                                )}
                            </span>
                            <span>{formatINR(orderData.delivery_charge)}</span>
                        </div>
                        <div className={styles.priceDivider} />
                        <div className={styles.priceTotal}>
                            <span>Total Paid</span>
                            <span className={styles.totalValue}>{formatINR(orderData.total_amount)}</span>
                        </div>
                    </div>

                    {/* Items ordered */}
                    {cartItems.length > 0 && (
                        <div className={styles.card}>
                            <h2 className={styles.cardTitle}>📦 Items Ordered</h2>
                            <div className={styles.itemsList}>
                                {cartItems.map((item, index) => (
                                    <div key={item.cartId || index} className={styles.itemRow}>
                                        <img
                                            src={item.image || 'https://via.placeholder.com/56?text=IMG'}
                                            alt={item.name}
                                            className={styles.itemImg}
                                        />
                                        <div className={styles.itemDetails}>
                                            <div className={styles.itemName}>{item.name}</div>
                                            <div className={styles.itemMeta}>
                                                Qty: {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}
                                            </div>
                                        </div>
                                        <div className={styles.itemTotal}>
                                            {formatINR(item.price * item.quantity)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── RIGHT: Status + next steps ── */}
                <div className={styles.rightColumn}>

                    {/* Payment & status card */}
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>🧾 Payment Details</h2>

                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Method</span>
                            <span className={styles.detailValue}>{orderData.payment_method}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Status</span>
                            <span style={{ color: paymentStatusInfo.color, fontWeight: 600, fontSize: '14px' }}>
                                {paymentStatusInfo.label}
                            </span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Order Status</span>
                            <span className={styles.statusBadge}>{orderData.status}</span>
                        </div>

                        {/* Credit-specific: show due date */}
                        {orderData.payment_method === 'Credit' && orderData.due_date && (
                            <div className={styles.creditDueBox}>
                                <p>📅 Payment due by: <strong>{new Date(orderData.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></p>
                                <p>Credit period: <strong>{orderData.credit_days} days</strong></p>
                            </div>
                        )}

                        {/* Razorpay: show pending payment note */}
                        {orderData.payment_method === 'Razorpay' && orderData.payment_status === 'PENDING' && (
                            <div className={styles.razorpayPendingBox}>
                                <p>⚡ <strong>Payment pending</strong></p>
                                <p style={{ fontSize: '12px', marginTop: '4px', color: '#6b7280' }}>
                                    Complete your Razorpay payment to confirm the order.
                                    [Razorpay integration coming soon]
                                </p>
                            </div>
                        )}
                    </div>

                    {/* What happens next */}
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>🚀 What Happens Next?</h2>
                        <ol className={styles.nextSteps}>
                            <li>
                                <strong>Order Confirmed</strong>
                                <p>Your order is now in our system. The producer has been notified.</p>
                            </li>
                            <li>
                                <strong>Order Processing</strong>
                                <p>The producer will pack and prepare your materials for dispatch.</p>
                            </li>
                            <li>
                                <strong>Logistics Assigned</strong>
                                <p>A delivery partner will pick up your order from the warehouse.</p>
                            </li>
                            <li>
                                <strong>Delivered to Your Site</strong>
                                <p>Materials delivered to the address you provided.</p>
                            </li>
                        </ol>
                    </div>

                    {/* Action buttons */}
                    <div className={styles.actions}>
                        <Link to="/orders" className={styles.btnPrimary}>
                            📋 View My Orders
                        </Link>
                        <Link to="/catalogue" className={styles.btnSecondary}>
                            🛒 Continue Shopping
                        </Link>
                    </div>
                </div>

            </main>
        </div>
    );
}