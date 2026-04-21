/**
 * ProducerOrders.jsx
 *
 * Shows all incoming orders for the logged-in producer.
 * Producer can filter by status and advance order status
 * (CREATED → ASSIGNED → SHIPPED → DELIVERED).
 *
 * API:
 *   GET  /api/orders/producer/incoming?status=CREATED
 *   PATCH /api/orders/:id/status  { status: "ASSIGNED" }
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../../api/client';
import ProducerLayout from '../../components/ProducerLayout';
import ToastNotification from '../../components/ToastNotification';
import ConfirmDialog from '../../components/ConfirmDialog';

// ── Status config ──────────────────────────────────────────────────────────
const STATUS = {
  CREATED:   { label: 'New',        bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE', next: 'ASSIGNED',  nextLabel: 'Confirm & Assign' },
  ASSIGNED:  { label: 'Confirmed',  bg: '#FFFBEB', text: '#92400E', border: '#FDE68A', next: 'SHIPPED',   nextLabel: 'Mark Shipped' },
  SHIPPED:   { label: 'Shipped',    bg: '#F0FDF4', text: '#166534', border: '#BBF7D0', next: 'DELIVERED', nextLabel: 'Mark Delivered' },
  DELIVERED: { label: 'Delivered',  bg: '#F0FDF4', text: '#059669', border: '#6EE7B7', next: null,        nextLabel: null },
};

const PAYMENT_STATUS = {
  PAID:    { label: '✅ Paid',    color: '#059669' },
  PENDING: { label: '⏳ Pending', color: '#6B7280' },
  CREDIT:  { label: '📋 Credit',  color: '#D97706' },
};

const FILTERS = ['All', 'CREATED', 'ASSIGNED', 'SHIPPED', 'DELIVERED'];

export default function ProducerOrders() {
  const [orders, setOrders]           = useState([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [filter, setFilter]           = useState('All');
  const [expanded, setExpanded]       = useState(null);
  const [toast, setToast]             = useState(null);
  const [confirmAction, setConfirm]   = useState(null); // { orderId, newStatus, label }
  const [isUpdating, setIsUpdating]   = useState(false);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = filter !== 'All' ? `?status=${filter}` : '';
      const res = await apiClient.get(`/api/orders/producer/incoming${params}`);
      setOrders(res.data || []);
    } catch {
      showToast('error', 'Failed to load orders.');
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleAdvanceStatus = async () => {
    if (!confirmAction) return;
    setIsUpdating(true);
    try {
      await apiClient.patch(`/api/orders/${confirmAction.orderId}/status`, {
        status: confirmAction.newStatus,
      });
      showToast('success', `Order marked as ${confirmAction.newStatus.toLowerCase()}.`);
      fetchOrders();
    } catch (err) {
      showToast('error', err?.response?.data?.detail || 'Failed to update order status.');
    } finally {
      setIsUpdating(false);
      setConfirm(null);
    }
  };

  // ── Styles ─────────────────────────────────────────────────────────────────
  const card    = { background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: 12 };
  const tinyBtn = (color, bg) => ({ background: bg, color, border: `1px solid ${color}30`, borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' });
  const pill    = (cfg) => ({ display: 'inline-block', background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`, borderRadius: 999, padding: '2px 10px', fontSize: 12, fontWeight: 600 });

  const summaryRow = (label, value, bold = false) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: bold ? '#111827' : '#6B7280', fontWeight: bold ? 600 : 400, marginBottom: 4 }}>
      <span>{label}</span><span>{value}</span>
    </div>
  );

  return (
    <ProducerLayout title="Incoming Orders" subtitle="Manage orders placed for your products">
      {toast && <ToastNotification type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {confirmAction && (
        <ConfirmDialog
          message={`Mark this order as "${confirmAction.newStatus}"? This cannot be undone.`}
          onConfirm={handleAdvanceStatus}
          onCancel={() => setConfirm(null)}
          confirmText={isUpdating ? 'Updating…' : confirmAction.label}
        />
      )}

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '1.5px solid',
              background: filter === f ? '#1E4D9B' : '#FFFFFF',
              color:      filter === f ? '#FFFFFF' : '#374151',
              borderColor: filter === f ? '#1E4D9B' : '#E5E7EB',
              transition: 'all 0.15s',
            }}
          >{f === 'All' ? 'All Orders' : (STATUS[f]?.label || f)}</button>
        ))}
        <button onClick={fetchOrders} style={{ marginLeft: 'auto', ...tinyBtn('#374151', '#F9FAFB') }}>
          ↻ Refresh
        </button>
      </div>

      {/* Orders list */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#9CA3AF', fontSize: 14 }}>Loading orders…</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, background: '#FFFFFF', borderRadius: 12, border: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#374151', margin: '0 0 6px' }}>
            {filter === 'All' ? 'No orders yet' : `No ${STATUS[filter]?.label?.toLowerCase()} orders`}
          </p>
          <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>
            Orders appear here when consumers purchase your products.
          </p>
        </div>
      ) : (
        orders.map(order => {
          const cfg       = STATUS[order.status] || STATUS.CREATED;
          const isOpen    = expanded === order.id;
          const payConfig = PAYMENT_STATUS[order.payment_status] || PAYMENT_STATUS.PENDING;

          return (
            <div key={order.id} style={card}>
              {/* Order header row */}
              <div
                style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', flexWrap: 'wrap' }}
                onClick={() => setExpanded(isOpen ? null : order.id)}
              >
                {/* Order ID */}
                <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13, color: '#111827', minWidth: 80 }}>
                  #{order.short_id}
                </div>

                {/* Status pill */}
                <span style={pill(cfg)}>{cfg.label}</span>

                {/* Consumer */}
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{order.consumer_name}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF' }}>{order.consumer_email}</div>
                </div>

                {/* Item count */}
                <div style={{ fontSize: 13, color: '#6B7280', minWidth: 80 }}>
                  {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                </div>

                {/* Total */}
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', minWidth: 90, textAlign: 'right' }}>
                  ₹{Number(order.total_amount).toLocaleString('en-IN')}
                </div>

                {/* Payment status */}
                <div style={{ fontSize: 12, color: payConfig.color, fontWeight: 600, minWidth: 80 }}>
                  {payConfig.label}
                </div>

                {/* Date */}
                <div style={{ fontSize: 11, color: '#9CA3AF', minWidth: 90 }}>
                  {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                </div>

                {/* Expand toggle */}
                <div style={{ fontSize: 12, color: '#6B7280' }}>{isOpen ? '▲' : '▼'}</div>
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div style={{ borderTop: '1px solid #F3F4F6', padding: '20px', display: 'flex', gap: 24, flexWrap: 'wrap' }}>

                  {/* Left: items */}
                  <div style={{ flex: '1 1 280px' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.06em', marginBottom: 10 }}>ORDER ITEMS</div>
                    {order.items?.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < order.items.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{item.product_title}</div>
                          <div style={{ fontSize: 12, color: '#6B7280' }}>Qty: {item.quantity} × ₹{Number(item.unit_price).toLocaleString('en-IN')}</div>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1E4D9B' }}>₹{Number(item.subtotal).toLocaleString('en-IN')}</div>
                      </div>
                    ))}
                  </div>

                  {/* Middle: delivery & pricing */}
                  <div style={{ flex: '1 1 220px' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.06em', marginBottom: 10 }}>DELIVERY</div>
                    {order.address && <div style={{ fontSize: 13, color: '#374151', marginBottom: 8, lineHeight: 1.5 }}>📍 {order.address}</div>}
                    {order.distance_km && <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>Distance: {order.distance_km} km</div>}
                    <div style={{ marginTop: 12 }}>
                      {summaryRow('Subtotal', `₹${Number(order.subtotal).toLocaleString('en-IN')}`)}
                      {summaryRow('GST (18%)', `₹${Number(order.gst_amount).toLocaleString('en-IN')}`)}
                      {summaryRow('Delivery', `₹${Number(order.delivery_charge).toLocaleString('en-IN')}`)}
                      {summaryRow('Total', `₹${Number(order.total_amount).toLocaleString('en-IN')}`, true)}
                    </div>
                  </div>

                  {/* Right: payment & action */}
                  <div style={{ flex: '0 0 200px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.06em', marginBottom: 8 }}>PAYMENT</div>
                      <div style={{ fontSize: 13, color: '#374151', marginBottom: 4 }}>{order.payment_method}</div>
                      <div style={{ fontSize: 12, color: payConfig.color, fontWeight: 600 }}>{payConfig.label}</div>
                      {order.credit_days && <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>Credit: {order.credit_days} days</div>}
                      {order.due_date && <div style={{ fontSize: 12, color: '#6B7280' }}>Due: {order.due_date}</div>}
                    </div>

                    {/* Advance status button */}
                    {cfg.next && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirm({ orderId: order.id, newStatus: cfg.next, label: cfg.nextLabel });
                        }}
                        style={{
                          background: '#1E4D9B', color: '#FFFFFF', border: 'none',
                          borderRadius: 8, padding: '10px 16px', fontSize: 13,
                          fontWeight: 600, cursor: 'pointer', width: '100%',
                          transition: 'background 0.15s',
                        }}
                        onMouseOver={e => e.currentTarget.style.background = '#1a3f85'}
                        onMouseOut={e => e.currentTarget.style.background = '#1E4D9B'}
                      >
                        {cfg.nextLabel} →
                      </button>
                    )}

                    {!cfg.next && (
                      <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#059669', fontWeight: 600, textAlign: 'center' }}>
                        ✅ Order Complete
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Summary footer */}
      {!isLoading && orders.length > 0 && (
        <div style={{ marginTop: 16, padding: '14px 20px', background: '#F8FAFF', borderRadius: 10, border: '1px solid #E5E7EB', display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 13 }}>
          <span style={{ color: '#6B7280' }}>Showing <strong>{orders.length}</strong> order{orders.length !== 1 ? 's' : ''}</span>
          <span style={{ color: '#1E4D9B', fontWeight: 600 }}>
            Total value: ₹{orders.reduce((s, o) => s + Number(o.total_amount), 0).toLocaleString('en-IN')}
          </span>
        </div>
      )}
    </ProducerLayout>
  );
}