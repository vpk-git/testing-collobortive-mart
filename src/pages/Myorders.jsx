/**
 * MyOrders.jsx — Order history page (Sprint 3)
 *
 * WHAT THIS PAGE DOES:
 * Shows a list of all orders placed by the currently logged-in user.
 * Fetches from GET /api/orders/ which returns OrderSummaryResponse items.
 *
 * Each order card shows:
 * - Short order ID
 * - Date placed
 * - Status (with colour)
 * - Payment method + status
 * - Number of items + total amount
 * - "View Details" link (uses /api/orders/{id} endpoint)
 *
 * If the user has no orders yet, shows an empty state with a link to the catalogue.
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import apiClient from "../api/client";
import styles from "./MyOrders.module.css";

// Colour mapping for order status badges
const STATUS_COLORS = {
    CREATED: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
    ASSIGNED: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
    SHIPPED: { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' },
    DELIVERED: { bg: '#f0fdf4', text: '#059669', border: '#6ee7b7' },
};

const PAYMENT_STATUS_LABELS = {
    PAID: { label: '✅ Paid', color: '#059669' },
    PENDING: { label: '⏳ Pending', color: '#6b7280' },
    CREDIT: { label: '📋 Credit', color: '#d97706' },
};

export default function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal state for viewing a single order's full details
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderDetail, setOrderDetail] = useState(null);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await apiClient.get('/api/orders/');
            setOrders(res.data || []);
        } catch (err) {
            console.error("Failed to fetch orders:", err);
            setError("Failed to load your orders. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewDetail = async (orderId) => {
        setSelectedOrder(orderId);
        setIsLoadingDetail(true);
        setOrderDetail(null);
        try {
            const res = await apiClient.get(`/api/orders/${orderId}`);
            setOrderDetail(res.data);
        } catch (err) {
            console.error("Failed to fetch order detail:", err);
        } finally {
            setIsLoadingDetail(false);
        }
    };

    const closeDetail = () => {
        setSelectedOrder(null);
        setOrderDetail(null);
    };

    const formatINR = (amount) =>
        `₹${parseFloat(amount).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

    const formatDate = (isoString) => {
        if (!isoString) return '—';
        try {
            return new Date(isoString).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return isoString;
        }
    };

    return (
        <div className={styles.pageContainer}>
            <Navbar />

            <div className={styles.heroSection}>
                <h1 className={styles.title}>My Orders</h1>
                <p className={styles.subtitle}>Track and manage all your BuildaMart orders</p>
            </div>

            <main className={styles.mainContent}>

                {isLoading ? (
                    <div className={styles.centerState}>
                        <p>Loading your orders...</p>
                    </div>
                ) : error ? (
                    <div className={styles.errorState}>
                        <p>{error}</p>
                        <button onClick={fetchOrders} className={styles.retryBtn}>Try Again</button>
                    </div>
                ) : orders.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>📦</div>
                        <h2>No Orders Yet</h2>
                        <p>You haven't placed any orders. Browse our catalogue to get started!</p>
                        <Link to="/catalogue" className={styles.browseBtn}>
                            Browse Catalogue →
                        </Link>
                    </div>
                ) : (
                    <div className={styles.ordersList}>
                        <div className={styles.ordersHeader}>
                            <span>{orders.length} order{orders.length !== 1 ? 's' : ''} found</span>
                            <button onClick={fetchOrders} className={styles.refreshBtn}>↻ Refresh</button>
                        </div>

                        {orders.map((order) => {
                            const statusStyle = STATUS_COLORS[order.status] || STATUS_COLORS.CREATED;
                            const paymentInfo = PAYMENT_STATUS_LABELS[order.payment_status] || { label: order.payment_status, color: '#6b7280' };
                            const shortId = order.id?.toString().split('-')[0].toUpperCase() || '—';

                            return (
                                <div key={order.id} className={styles.orderCard}>
                                    <div className={styles.orderCardHeader}>
                                        <div className={styles.orderIdSection}>
                                            <span className={styles.orderIdLabel}>Order</span>
                                            <span className={styles.orderId}>#{shortId}</span>
                                        </div>
                                        <div className={styles.orderDate}>
                                            {formatDate(order.created_at)}
                                        </div>
                                        <span
                                            className={styles.statusBadge}
                                            style={{
                                                background: statusStyle.bg,
                                                color: statusStyle.text,
                                                border: `1px solid ${statusStyle.border}`,
                                            }}
                                        >
                                            {order.status}
                                        </span>
                                    </div>

                                    <div className={styles.orderCardBody}>
                                        <div className={styles.orderMeta}>
                                            <span className={styles.metaItem}>
                                                📦 {order.item_count} item{order.item_count !== 1 ? 's' : ''}
                                            </span>
                                            <span className={styles.metaItem}>
                                                {order.payment_method}
                                            </span>
                                            <span
                                                className={styles.metaItem}
                                                style={{ color: paymentInfo.color }}
                                            >
                                                {paymentInfo.label}
                                            </span>
                                        </div>
                                        <div className={styles.orderTotal}>
                                            {formatINR(order.total_amount)}
                                        </div>
                                    </div>

                                    <div className={styles.orderCardFooter}>
                                        <button
                                            className={styles.viewDetailBtn}
                                            onClick={() => handleViewDetail(order.id)}
                                        >
                                            View Details →
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* ── Order Detail Modal ── */}
            {selectedOrder && (
                <div className={styles.modalOverlay} onClick={closeDetail}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Order Details</h2>
                            <button className={styles.closeBtn} onClick={closeDetail}>✕</button>
                        </div>

                        <div className={styles.modalBody}>
                            {isLoadingDetail ? (
                                <p style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                                    Loading order details...
                                </p>
                            ) : orderDetail ? (
                                <>
                                    {/* Items */}
                                    <h3 className={styles.modalSection}>Items</h3>
                                    {orderDetail.items?.map((item, i) => (
                                        <div key={i} className={styles.modalItemRow}>
                                            <div className={styles.modalItemName}>{item.product_title}</div>
                                            <div className={styles.modalItemQty}>
                                                {item.quantity} × {formatINR(item.unit_price)}
                                            </div>
                                            <div className={styles.modalItemTotal}>{formatINR(item.subtotal)}</div>
                                        </div>
                                    ))}

                                    {/* Price breakdown */}
                                    <h3 className={styles.modalSection} style={{ marginTop: '20px' }}>Pricing</h3>
                                    <div className={styles.modalPriceRow}>
                                        <span>Subtotal</span><span>{formatINR(orderDetail.subtotal)}</span>
                                    </div>
                                    <div className={styles.modalPriceRow}>
                                        <span>GST (18%)</span><span>{formatINR(orderDetail.gst_amount)}</span>
                                    </div>
                                    <div className={styles.modalPriceRow}>
                                        <span>Delivery {orderDetail.distance_km ? `(${orderDetail.distance_km} km)` : ''}</span>
                                        <span>{formatINR(orderDetail.delivery_charge)}</span>
                                    </div>
                                    <div className={styles.modalPriceTotal}>
                                        <span>Total</span>
                                        <span>{formatINR(orderDetail.total_amount)}</span>
                                    </div>

                                    {/* Address */}
                                    {orderDetail.address && (
                                        <>
                                            <h3 className={styles.modalSection} style={{ marginTop: '20px' }}>Delivery Address</h3>
                                            <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.5' }}>{orderDetail.address}</p>
                                        </>
                                    )}

                                    {/* Credit info */}
                                    {orderDetail.credit_days && (
                                        <div className={styles.creditInfoBox}>
                                            📋 Credit period: {orderDetail.credit_days} days |
                                            Due: {orderDetail.due_date ? new Date(orderDetail.due_date).toLocaleDateString('en-IN') : '—'}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p style={{ color: '#dc2626', textAlign: 'center' }}>Could not load order details.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}