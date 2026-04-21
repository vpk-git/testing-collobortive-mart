/**
 * Checkout.jsx — The full checkout page (Sprint 3)
 *
 * WHAT THIS PAGE DOES:
 * This is the core of the ordering flow. The user arrives here from Cart.jsx
 * after clicking "Proceed to Checkout". The page has three sections:
 *
 * 1. DELIVERY ADDRESS
 *    - The user can click "Use My Location" to get GPS coordinates via the
 *      browser's built-in navigator.geolocation API (free, no API key needed).
 *    - A Leaflet.js map shows a draggable pin so the user can fine-tune the
 *      delivery location.
 *    - A text field lets the user type a full address description.
 *    - Whenever the pin moves or GPS is acquired, we call POST /api/orders/calculate-delivery
 *      to get the delivery charge in real-time.
 *
 * 2. PAYMENT METHOD SELECTION
 *    - Razorpay (Online) — shows a placeholder "Pay Now" UI (real SDK later)
 *    - Advance Payment / Bank Transfer — simple confirmation
 *    - Credit (Net 30/60/90) — credit days selector appears
 *    - Cash on Delivery — simplest option
 *
 * 3. LIVE ORDER SUMMARY (right sidebar)
 *    - Shows subtotal (from cart), GST, delivery charge (from API), and total.
 *    - Updates live as delivery location changes.
 *
 * HOW DATA FLOWS:
 *   Cart.jsx navigates here with state: { cartItems, subtotal, tax, total }
 *   → User selects location → we call /api/orders/calculate-delivery → get delivery charge
 *   → User selects payment → clicks "Place Order"
 *   → We call POST /api/orders/ with all data
 *   → Backend validates, creates order, clears cart, returns order summary
 *   → We navigate to /order-confirmation with the order data
 *
 * MAP LIBRARY: Leaflet.js (loaded from CDN via script tag in index.html OR
 * dynamically loaded here). No Google Maps — no billing needed.
 *
 * LEAFLET SETUP (add to index.html if not already present):
 *   <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
 *   <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import apiClient from "../api/client";
import styles from "./Checkout.module.css";

// ─────────────────────────────────────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────────────────────────────────────

const PAYMENT_METHODS = [
    {
        id: "Razorpay",
        label: "Pay Online",
        icon: "💳",
        description: "Secure payment via Razorpay (UPI, Cards, Net Banking)",
        badge: "Recommended",
    },
    {
        id: "Advance Payment",
        label: "Advance / Bank Transfer",
        icon: "🏦",
        description: "Transfer payment before delivery. Share UTR after transfer.",
    },
    {
        id: "Credit",
        label: "Credit (Net 30/60/90)",
        icon: "📋",
        description: "Pay within agreed credit period. Subject to approval.",
    },
    {
        id: "Cash on Delivery",
        label: "Cash on Delivery",
        icon: "💵",
        description: "Pay in cash when materials are delivered to your site.",
    },
];

const CREDIT_DAY_OPTIONS = [30, 60, 90];

// Default map center — Bangalore (change to your city if needed)
const DEFAULT_MAP_CENTER = [12.9716, 77.5946];

// ─────────────────────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────────────────────

export default function Checkout() {
    const navigate = useNavigate();
    const location = useLocation();

    // ── Pull cart data passed from Cart.jsx via React Router state ──────────
    // If the user navigates directly to /checkout without going through cart,
    // location.state will be null — we redirect them to /cart.
    const cartState = location.state;

    useEffect(() => {
        if (!cartState || !cartState.cartItems || cartState.cartItems.length === 0) {
            navigate('/cart', { replace: true });
        }
    }, [cartState, navigate]);

    const cartItems = cartState?.cartItems || [];
    const cartSubtotal = cartState?.subtotal || 0;
    const cartTax = cartState?.tax || 0;

    // ── Address & location state ─────────────────────────────────────────────
    const [address, setAddress] = useState("");
    const [coords, setCoords] = useState(null);          // { lat, lng }
    const [locationError, setLocationError] = useState(null);
    const [isLocating, setIsLocating] = useState(false);

    // ── Delivery calculation state ───────────────────────────────────────────
    const [deliveryInfo, setDeliveryInfo] = useState(null);   // { distance_km, delivery_charge }
    const [isCalculating, setIsCalculating] = useState(false);

    // ── Payment state ────────────────────────────────────────────────────────
    const [selectedPayment, setSelectedPayment] = useState("Razorpay");
    const [creditDays, setCreditDays] = useState(30);

    // ── Order submission state ───────────────────────────────────────────────
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [orderError, setOrderError] = useState(null);

    // ── Map refs ─────────────────────────────────────────────────────────────
    const mapContainerRef = useRef(null);   // The <div> that Leaflet renders into
    const mapRef = useRef(null);            // Leaflet map instance
    const markerRef = useRef(null);         // The draggable pin marker

    // ─────────────────────────────────────────────────────────────────────────
    //  Delivery charge calculation — called whenever coords change
    // ─────────────────────────────────────────────────────────────────────────

    const calculateDelivery = useCallback(async (lat, lng) => {
        setIsCalculating(true);
        setDeliveryInfo(null);
        try {
            const res = await apiClient.post('/api/orders/calculate-delivery', {
                latitude: lat,
                longitude: lng,
            });
            setDeliveryInfo(res.data);
        } catch (err) {
            console.error("Delivery calculation failed:", err);
            // Fallback — don't block the user from ordering
            setDeliveryInfo({ distance_km: null, delivery_charge: 350 });
        } finally {
            setIsCalculating(false);
        }
    }, []);

    // ─────────────────────────────────────────────────────────────────────────
    //  Leaflet map initialization
    //  We do this in a useEffect so it runs after the DOM element exists.
    //  We check window.L to see if Leaflet is loaded from CDN.
    // ─────────────────────────────────────────────────────────────────────────

    useEffect(() => {
        // Load Leaflet CSS dynamically if not already in index.html
        if (!document.getElementById('leaflet-css')) {
            const link = document.createElement('link');
            link.id = 'leaflet-css';
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
        }

        // Load Leaflet JS dynamically
        const initMap = () => {
            if (!mapContainerRef.current || mapRef.current) return;
            const L = window.L;
            if (!L) return;

            // Create map centered on default location
            const map = L.map(mapContainerRef.current).setView(DEFAULT_MAP_CENTER, 12);
            mapRef.current = map;

            // OpenStreetMap tiles — completely free, no API key
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 19,
            }).addTo(map);

            // Create draggable marker
            const marker = L.marker(DEFAULT_MAP_CENTER, { draggable: true }).addTo(map);
            markerRef.current = marker;

            // When user drags the pin — update coords and recalculate delivery
            marker.on('dragend', (e) => {
                const { lat, lng } = e.target.getLatLng();
                const newCoords = { lat, lng };
                setCoords(newCoords);
                calculateDelivery(lat, lng);
            });

            // When user clicks on the map — move pin there
            map.on('click', (e) => {
                const { lat, lng } = e.latlng;
                marker.setLatLng([lat, lng]);
                const newCoords = { lat, lng };
                setCoords(newCoords);
                calculateDelivery(lat, lng);
            });
        };

        if (window.L) {
            initMap();
        } else {
            // Load Leaflet script if not present
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = initMap;
            document.head.appendChild(script);
        }

        // Cleanup: destroy map when component unmounts to prevent memory leaks
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
                markerRef.current = null;
            }
        };
    }, [calculateDelivery]);

    // ─────────────────────────────────────────────────────────────────────────
    //  "Use My Location" — asks for browser GPS permission
    // ─────────────────────────────────────────────────────────────────────────

    const handleUseMyLocation = () => {
        setLocationError(null);
        setIsLocating(true);

        if (!navigator.geolocation) {
            setLocationError("Your browser doesn't support location access.");
            setIsLocating(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const newCoords = { lat: latitude, lng: longitude };
                setCoords(newCoords);
                setIsLocating(false);

                // Move the map and marker to the user's location
                if (mapRef.current && markerRef.current) {
                    mapRef.current.setView([latitude, longitude], 15);
                    markerRef.current.setLatLng([latitude, longitude]);
                }

                // Calculate delivery for this location
                calculateDelivery(latitude, longitude);
            },
            (error) => {
                setIsLocating(false);
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        setLocationError("Location access denied. Please type your address manually.");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        setLocationError("Location unavailable. Please try again or type your address.");
                        break;
                    default:
                        setLocationError("Could not get location. Please type your address manually.");
                }
            },
            { timeout: 10000, maximumAge: 60000 }
        );
    };

    // ─────────────────────────────────────────────────────────────────────────
    //  Place Order — the main submission function
    // ─────────────────────────────────────────────────────────────────────────

    const handlePlaceOrder = async () => {
        // Validate required fields before sending to backend
        if (!address.trim()) {
            setOrderError("Please enter your delivery address.");
            return;
        }
        // coords is optional — if not set, backend uses flat delivery rate
        if (selectedPayment === "Credit" && !creditDays) {
            setOrderError("Please select your credit period.");
            return;
        }

        setOrderError(null);
        setIsPlacingOrder(true);

        try {
            /**
             * Build the order payload.
             *
             * WHAT WE SEND TO THE BACKEND:
             * - items: only product IDs and quantities — backend fetches real prices
             * - address: the text description the user typed
             * - latitude/longitude: GPS coords for delivery calculation
             * - payment_method: the user's selection
             * - credit_days: only when payment is Credit
             *
             * WHAT WE DO NOT SEND:
             * - prices (backend re-fetches from DB — security)
             * - subtotal, tax, total (backend calculates — security)
             */
            const payload = {
                items: cartItems.map(item => ({
                    product_id: item.productId,
                    quantity: item.quantity,
                })),
                address: address.trim(),
                // GPS is optional — if user didn't pin location, backend uses flat rate
                ...(coords ? { latitude: coords.lat, longitude: coords.lng } : {}),
                payment_method: selectedPayment,
                ...(selectedPayment === "Credit" ? { credit_days: creditDays } : {}),
            };

            const response = await apiClient.post('/api/orders/', payload);
            const orderData = response.data;

            /**
             * RAZORPAY PLACEHOLDER — integrate later:
             *
             * If payment_method is Razorpay, the backend will eventually:
             * 1. Create a Razorpay order → return razorpay_order_id
             * 2. We open the Razorpay popup here with:
             *
             *   const options = {
             *     key: import.meta.env.VITE_RAZORPAY_KEY_ID,
             *     amount: orderData.total_amount * 100,  // paise
             *     currency: "INR",
             *     name: "BuildaMart",
             *     order_id: orderData.razorpay_order_id,
             *     handler: function(response) {
             *       // Payment successful — navigate to confirmation
             *       navigateToConfirmation(orderData);
             *     },
             *   };
             *   const rzp = new window.Razorpay(options);
             *   rzp.open();
             *
             * For now, we just navigate to confirmation for all payment types.
             */

            // Navigate to confirmation page, passing order data as route state
            navigate('/order-confirmation', {
                state: { orderData, cartItems },
                replace: true,  // replace: true means back button won't go back to checkout
            });

        } catch (err) {
            console.error("Order placement failed:", err);
            const msg = err.response?.data?.detail || "Failed to place order. Please try again.";
            setOrderError(msg);
        } finally {
            setIsPlacingOrder(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    //  Computed values for the order summary sidebar
    // ─────────────────────────────────────────────────────────────────────────

    const deliveryCharge = deliveryInfo?.delivery_charge ?? null;
    const finalTotal = deliveryCharge !== null
        ? cartSubtotal + cartTax + deliveryCharge
        : null;

    // ─────────────────────────────────────────────────────────────────────────
    //  Render
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className={styles.pageContainer}>
            <Navbar />

            <div className={styles.heroSection}>
                <h1 className={styles.title}>Checkout</h1>
                <div className={styles.stepIndicator}>
                    <span className={styles.stepDone}>1. Cart</span>
                    <span className={styles.stepSep}>›</span>
                    <span className={styles.stepActive}>2. Checkout</span>
                    <span className={styles.stepSep}>›</span>
                    <span className={styles.stepPending}>3. Confirmation</span>
                </div>
            </div>

            <main className={styles.mainLayout}>

                {/* ── LEFT COLUMN: Address + Payment ── */}
                <div className={styles.leftColumn}>

                    {/* ── SECTION 1: Delivery Address ── */}
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>
                            <span className={styles.cardIcon}>📍</span>
                            Delivery Location
                        </h2>

                        <button
                            className={styles.locationBtn}
                            onClick={handleUseMyLocation}
                            disabled={isLocating}
                        >
                            {isLocating ? "📡 Detecting location..." : "📍 Use My Current Location"}
                        </button>

                        {locationError && (
                            <p className={styles.errorText}>{locationError}</p>
                        )}

                        {coords && (
                            <p className={styles.coordsText}>
                                ✅ Location pinned: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                            </p>
                        )}

                        {/* Leaflet map container */}
                        <div className={styles.mapHint}>
                            Click on the map or drag the pin to set your delivery location
                        </div>
                        <div
                            ref={mapContainerRef}
                            className={styles.mapContainer}
                            style={{ height: '300px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border)' }}
                        />

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Full Delivery Address *</label>
                            <textarea
                                className={styles.textarea}
                                placeholder="e.g., Plot 12, 3rd Cross, Koramangala, Bangalore - 560034, Karnataka"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                rows={3}
                            />
                            <p className={styles.fieldHint}>Include landmark, area, city, and PIN code</p>
                        </div>

                        {/* Delivery charge feedback */}
                        {isCalculating && (
                            <div className={styles.deliveryEstimate}>
                                <span className={styles.deliveryEstimateIcon}>🚛</span>
                                Calculating delivery charge...
                            </div>
                        )}
                        {deliveryInfo && !isCalculating && (
                            <div className={styles.deliveryEstimate}>
                                <span className={styles.deliveryEstimateIcon}>🚛</span>
                                <div>
                                    <strong>Delivery charge: ₹{deliveryInfo.delivery_charge.toLocaleString('en-IN')}</strong>
                                    {deliveryInfo.distance_km && (
                                        <span className={styles.distanceText}>
                                            ({deliveryInfo.distance_km} km from {deliveryInfo.warehouse_city || "warehouse"})
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── SECTION 2: Payment Method ── */}
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>
                            <span className={styles.cardIcon}>💳</span>
                            Payment Method
                        </h2>

                        <div className={styles.paymentOptions}>
                            {PAYMENT_METHODS.map((method) => (
                                <label
                                    key={method.id}
                                    className={`${styles.paymentOption} ${selectedPayment === method.id ? styles.paymentOptionSelected : ''}`}
                                >
                                    <input
                                        type="radio"
                                        name="payment"
                                        value={method.id}
                                        checked={selectedPayment === method.id}
                                        onChange={() => setSelectedPayment(method.id)}
                                        className={styles.radioInput}
                                    />
                                    <span className={styles.paymentIcon}>{method.icon}</span>
                                    <div className={styles.paymentInfo}>
                                        <div className={styles.paymentLabel}>
                                            {method.label}
                                            {method.badge && (
                                                <span className={styles.paymentBadge}>{method.badge}</span>
                                            )}
                                        </div>
                                        <div className={styles.paymentDesc}>{method.description}</div>
                                    </div>
                                </label>
                            ))}
                        </div>

                        {/* Credit days selector — only shown when Credit is selected */}
                        {selectedPayment === "Credit" && (
                            <div className={styles.creditDaysSection}>
                                <label className={styles.label}>Credit Period</label>
                                <div className={styles.creditDaysOptions}>
                                    {CREDIT_DAY_OPTIONS.map((days) => (
                                        <button
                                            key={days}
                                            className={`${styles.creditDayBtn} ${creditDays === days ? styles.creditDayBtnActive : ''}`}
                                            onClick={() => setCreditDays(days)}
                                        >
                                            Net {days}
                                        </button>
                                    ))}
                                </div>
                                <p className={styles.fieldHint}>
                                    Payment due {creditDays} days from order date.
                                    Due date: <strong>{new Date(Date.now() + creditDays * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                                </p>
                            </div>
                        )}

                        {/* Razorpay placeholder UI */}
                        {selectedPayment === "Razorpay" && (
                            <div className={styles.razorpayPlaceholder}>
                                <div className={styles.razorpayLogo}>
                                    <span style={{ fontSize: '24px' }}>⚡</span>
                                    <span>Razorpay Secure Checkout</span>
                                </div>
                                <p className={styles.razorpayNote}>
                                    You'll be redirected to Razorpay's secure payment page after clicking "Place Order".
                                    Supports UPI, Credit/Debit Cards, Net Banking, and Wallets.
                                </p>
                                <div className={styles.paymentIcons}>
                                    <span title="UPI">🔵 UPI</span>
                                    <span title="Visa">💳 Visa</span>
                                    <span title="Mastercard">💳 MC</span>
                                    <span title="Net Banking">🏦 NetBanking</span>
                                </div>
                                <p style={{ fontSize: '11px', color: '#aaa', marginTop: '8px' }}>
                                    [Razorpay integration coming soon — payment will be simulated for now]
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ── Error message ── */}
                    {orderError && (
                        <div className={styles.errorCard}>
                            ⚠️ {orderError}
                        </div>
                    )}

                    {/* ── Place Order Button ── */}
                    <button
                        className={styles.placeOrderBtn}
                        onClick={handlePlaceOrder}
                        disabled={isPlacingOrder || !address.trim()}
                    >
                        {isPlacingOrder ? (
                            <span>⏳ Placing your order...</span>
                        ) : (
                            <span>
                                {selectedPayment === "Razorpay" ? "💳 Proceed to Payment" : "✅ Place Order"}
                                {finalTotal !== null && ` — ₹${finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                            </span>
                        )}
                    </button>

                    <p className={styles.backLink}>
                        <Link to="/cart">← Back to Cart</Link>
                    </p>
                </div>

                {/* ── RIGHT COLUMN: Order Summary ── */}
                <div className={styles.summaryColumn}>
                    <div className={styles.summaryCard}>
                        <h2 className={styles.cardTitle}>Order Summary</h2>

                        {/* Cart items list */}
                        <div className={styles.summaryItems}>
                            {cartItems.map((item) => (
                                <div key={item.cartId} className={styles.summaryItem}>
                                    <div className={styles.summaryItemInfo}>
                                        <img
                                            src={item.image || 'https://via.placeholder.com/48?text=IMG'}
                                            alt={item.name}
                                            className={styles.summaryItemImg}
                                        />
                                        <div>
                                            <div className={styles.summaryItemName}>{item.name}</div>
                                            <div className={styles.summaryItemQty}>Qty: {item.quantity}</div>
                                        </div>
                                    </div>
                                    <div className={styles.summaryItemPrice}>
                                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.summaryDivider} />

                        {/* Price breakdown */}
                        <div className={styles.summaryRow}>
                            <span>Subtotal ({cartItems.length} items)</span>
                            <span>₹{cartSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>GST (18%)</span>
                            <span>₹{cartTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Delivery</span>
                            <span>
                                {isCalculating ? (
                                    <span className={styles.calculating}>Calculating...</span>
                                ) : deliveryCharge !== null ? (
                                    `₹${deliveryCharge.toLocaleString('en-IN')}`
                                ) : (
                                    <span className={styles.pendingText}>Pin location to calculate</span>
                                )}
                            </span>
                        </div>

                        <div className={styles.summaryDivider} />

                        <div className={styles.summaryTotal}>
                            <span>Total</span>
                            <span className={styles.totalAmount}>
                                {finalTotal !== null
                                    ? `₹${finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                                    : '—'}
                            </span>
                        </div>

                        {selectedPayment === "Credit" && (
                            <div className={styles.creditNote}>
                                📋 Credit: Payment due in {creditDays} days
                            </div>
                        )}
                    </div>
                </div>

            </main>
        </div>
    );
}