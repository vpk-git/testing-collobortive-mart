import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Empty states acting as placeholders before real backend integration
  const recentOrders = [];
  const activeListings = [];

  // Synchronous checks
  if (!token) {
    navigate("/login");
    return null;
  }
  if (role === "PRODUCER") {
    navigate("/producer/dashboard", { replace: true });
    return null;
  }

  return (
    <div className={styles.pageContainer}>
      <div style={{ minHeight: "100vh", background: "#F8F9FC", display: "flex", flexDirection: "column" }}>
        <Navbar />

        <div className={styles.heroSection}>
          <h1 className={styles.title}>Workspace Overview</h1>
          <p className={styles.subtitle}>Welcome back. Here's what's happening today.</p>
        </div>

        <main className={styles.mainLayout}>
          {/* The static persistent universal alert was removed for a cleaner production UI */}

          {/* -------------------------------
            CONSUMER DASHBOARD VIEW 
        --------------------------------- */}
          {role === "CONSUMER" && (
            <>
              {/* Consumer KPI Grid - Initial Zero States */}
              <div className={styles.grid}>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Total Orders</h3>
                  <p className={styles.cardValue}>0</p>
                  <p className={styles.cardSubtext}>Lifetime purchases</p>
                </div>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Saved Items</h3>
                  <p className={styles.cardValue}>0</p>
                  <p className={styles.cardSubtext}>In your wishlist</p>
                </div>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Account Rewards</h3>
                  <p className={styles.cardValue}>None</p>
                  <p className={styles.cardSubtext}>Tier status</p>
                </div>
              </div>

              {/* Consumer Recent Orders List */}
              <div className={styles.section}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.sectionTitle}>Recent Orders</h2>
                  <Link to="/catalogue" className={styles.btnOutline}>Shop Catalog</Link>
                </div>

                <div className={styles.listContainer}>
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order, idx) => (
                      <div key={idx} className={styles.listItem}>
                        <div className={styles.itemInfo}>
                          <h4>{order.id}</h4>
                          <p>{order.date} &bull; {order.total}</p>
                        </div>
                        <div>
                          <span style={{
                            color: order.status === 'Delivered' ? '#2e7d32' : '#f57c00',
                            fontWeight: 'bold',
                            backgroundColor: order.status === 'Delivered' ? '#e8f5e9' : '#fff3e0',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px'
                          }}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={styles.emptyList}>
                      <p>You haven't placed any orders yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* -------------------------------
            PRODUCER DASHBOARD VIEW 
        --------------------------------- */}
          {role === "PRODUCER" && (
            <>
              {/* Producer KPI Grid - Initial Zero States */}
              <div className={styles.grid}>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Total Revenue</h3>
                  <p className={styles.cardValue}>₹0</p>
                  <p className={styles.cardSubtext}>This month</p>
                </div>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Active Products</h3>
                  <p className={styles.cardValue}>0</p>
                  <p className={styles.cardSubtext}>Currently listed</p>
                </div>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Pending Orders</h3>
                  <p className={styles.cardValue}>0</p>
                  <p className={styles.cardSubtext}>Need fulfillment</p>
                </div>
              </div>

              {/* Producer Active Listings */}
              <div className={styles.section}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.sectionTitle}>Top Active Listings</h2>
                  <Link to="/createproduct" className={styles.btn}>+ Add New Product</Link>
                </div>

                <div className={styles.listContainer}>
                  {activeListings.length > 0 ? (
                    activeListings.map((listing, idx) => (
                      <div key={idx} className={styles.listItem}>
                        <div className={styles.itemInfo}>
                          <h4>{listing.name}</h4>
                          <p>Stock: {listing.stock} units</p>
                        </div>
                        <div>
                          <span style={{ fontWeight: 'bold', color: 'var(--primary-blue)' }}>
                            {listing.price}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={styles.emptyList}>
                      <p>You haven't listed any products yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
        <main style={{ flex: 1, paddingTop: "64px", padding: "40px" }}>
          <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center", background: "#FFFFFF", padding: "56px 40px", borderRadius: "20px", border: "1px solid #E5E7EB", boxShadow: "0 12px 32px rgba(0,0,0,0.05)" }}>
            <h1 style={{ fontFamily: "'Syne', system-ui, sans-serif", fontSize: "32px", fontWeight: 800, color: "#111827", marginBottom: "16px" }}>
              Welcome to BuildMart
            </h1>
            <p style={{ fontSize: "16px", color: "#4B5563", marginBottom: "32px", lineHeight: 1.6 }}>
              You are logged in as a <strong style={{ color: "#1E4D9B" }}>CONSUMER</strong>. Start browsing construction materials below.
            </p>
            <Link
              to="/catalogue"
              style={{ display: "inline-block", background: "#1E4D9B", color: "white", padding: "10px 20px", borderRadius: "8px", fontSize: "14px", fontWeight: 600, textDecoration: "none", transition: "all 0.15s ease" }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#163A7A'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#1E4D9B'}
            >
              🛒 Browse Products
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}