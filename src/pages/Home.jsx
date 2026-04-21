import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useState } from 'react';

// ── Static data arrays defined here ──
const categories = [
  { icon: '🔧', name: 'Tools and Equipments', count: '420+', bg: '#EFF4FF', border: '#C7D7F8' },
  { icon: '🧱', name: 'Cement and other building materials', count: '240+', bg: '#FFF7ED', border: '#FED7AA' },
  { icon: '⚡', name: 'Electrical Plumbing', count: '190+', bg: '#FFFBEB', border: '#FDE68A' },
  { icon: '🪵', name: 'Flooring', count: '150+', bg: '#FFF7ED', border: '#FED7AA' },
  { icon: '🛡️', name: 'Safety and PPE', count: '110+', bg: '#F0FDF4', border: '#A7F3D0' },
  { icon: '🎨', name: 'Paint and Coatings', count: '95+', bg: '#FFF1F2', border: '#FECDD3' },
  { icon: '🔩', name: 'Hardware and Fasteners', count: '380+', bg: '#F0FDF4', border: '#BBF7D0' },
];

const featuredProducts = [
  {
    id: 'feat-1',
    emoji: '🧱',
    badge: 'Best Seller', badgeColor: '#1E4D9B',
    category: 'Cement & Concrete',
    name: 'UltraTech OPC 53 Grade Cement',
    price: '₹380', unit: 'per 50kg bag',
    rating: 4.8, reviews: 234,
    producer: 'UltraTech Ltd.',
  },
  {
    id: 'feat-2',
    emoji: '⚙️',
    badge: 'Top Rated', badgeColor: '#16A34A',
    category: 'Steel & TMT',
    name: 'JSW Neosteel Fe-500D TMT Bar',
    price: '₹62,000', unit: 'per metric tonne',
    rating: 4.9, reviews: 318,
    producer: 'JSW Steel',
  },
  {
    id: 'feat-3',
    emoji: '🔧',
    badge: 'New Arrival', badgeColor: '#D97706',
    category: 'Tools & Equipment',
    name: 'Bosch GSB 18V Cordless Drill',
    price: '₹8,499', unit: 'per unit',
    rating: 4.7, reviews: 187,
    producer: 'Bosch India',
  },
  {
    id: 'feat-4',
    emoji: '🛡️',
    badge: 'Popular', badgeColor: '#7C3AED',
    category: 'Safety & PPE',
    name: 'ISI Certified Safety Helmet',
    price: '₹299', unit: 'per piece',
    rating: 4.6, reviews: 412,
    producer: 'SafeGuard Co.',
  },
];

const steps = [
  {
    num: '01', title: 'Search & Discover',
    desc: 'Browse 2,400+ products across 8 categories from 180+ verified producers.'
  },
  {
    num: '02', title: 'Compare & Verify',
    desc: 'Check real-time stock, compare producer ratings, and review product specifications.'
  },
  {
    num: '03', title: 'Order Securely',
    desc: 'Place orders with confidence. Track inventory levels and get transparent pricing.'
  },
  {
    num: '04', title: 'Receive & Confirm',
    desc: 'Get your materials delivered and confirm receipt through the platform.'
  },
];

const trustItems = [
  { icon: '✅', title: 'KYC-Verified Suppliers', sub: 'All producers background checked' },
  { icon: '🔒', title: 'Secure Transactions', sub: 'Bank-grade encryption' },
  { icon: '📦', title: 'Live Stock Levels', sub: 'Real-time inventory data' },
  { icon: '🚚', title: 'Pan-India Logistics', sub: 'Delivery network ready' },
  { icon: '⭐', title: 'Buyer Ratings', sub: 'Transparent review system' },
];

// ── Helper: star rating ──
function StarRating({ rating }) {
  const rounded = Math.round(rating);
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} style={{ fontSize: '12px', color: star <= rounded ? '#F59E0B' : '#E5E7EB' }}>
          ★
        </span>
      ))}
    </div>
  );
}

// ── Main export ──
export default function Home() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(searchQuery.trim()
      ? '/catalogue?search=' + encodeURIComponent(searchQuery.trim())
      : '/catalogue');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FC', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=Syne:wght@700;800&display=swap');
        
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .bm-fade-1 { animation: fadeUp 0.55s ease forwards; }
        .bm-fade-2 { animation: fadeUp 0.55s ease 0.12s forwards; opacity: 0; }
        .bm-fade-3 { animation: fadeUp 0.55s ease 0.24s forwards; opacity: 0; }
        .bm-fade-4 { animation: fadeUp 0.55s ease 0.36s forwards; opacity: 0; }
        
        .bm-cat-card { transition: all 0.18s ease; cursor: pointer; }
        .bm-cat-card:hover { 
          transform: translateY(-3px); 
          box-shadow: 0 8px 24px rgba(30,77,155,0.11) !important; 
          border-color: #1E4D9B !important; 
        }
        
        .bm-prod-card { transition: all 0.2s ease; }
        .bm-prod-card:hover { 
          transform: translateY(-4px); 
          box-shadow: 0 16px 40px rgba(0,0,0,0.1) !important; 
        }
        
        .bm-btn-primary { transition: all 0.15s ease; }
        .bm-btn-primary:hover { 
          background: #EFF4FF !important; 
          transform: translateY(-1px); 
        }
        
        .bm-search-input:focus { 
          outline: none !important; 
          box-shadow: none !important; 
        }
      `}</style>
      <Navbar />

      {/* Section 1 — Hero */}
      <div style={{ width: '100%', background: 'linear-gradient(135deg, #1E3A8A 0%, #1E4D9B 55%, #2563EB 100%)', paddingTop: '64px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(96,165,250,0.15)', filter: 'blur(90px)', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(30,77,155,0.25)', filter: 'blur(70px)', pointerEvents: 'none' }}></div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '88px 24px 0px', position: 'relative', zIndex: 1, textAlign: 'left' }}>
          <div style={{ maxWidth: 820 }}>
            {/* Trust badge */}
            <div className="bm-fade-1" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '999px', padding: '5px 16px', marginBottom: '24px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ADE80' }}></div>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.88)', fontWeight: 500 }}>India's #1 B2B Construction Marketplace</span>
            </div>

            {/* Headline */}
            <h1 className="bm-fade-2" style={{ fontFamily: "'Syne', system-ui, sans-serif", fontSize: 'clamp(38px, 5.5vw, 70px)', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.08, letterSpacing: '-0.02em', marginBottom: '20px', margin: 0 }}>
              Build Smarter.<br />
              Source <span style={{ color: '#93C5FD' }}>Better.</span>
            </h1>

            {/* Subheadline */}
            <p className="bm-fade-3" style={{ fontSize: 17, color: 'rgba(255,255,255,0.78)', maxWidth: 540, lineHeight: 1.75, marginBottom: '40px' }}>
              Connect with verified producers. Compare real-time prices and stock levels. Order construction materials built for India's builders.
            </p>

            {/* Search form */}
            <div className="bm-fade-3" style={{ maxWidth: 620, marginBottom: '16px' }}>
              <form onSubmit={handleSearch} style={{ display: 'flex', background: '#fff', borderRadius: '14px', padding: '6px', boxShadow: '0 24px 64px rgba(0,0,0,0.28)' }}>
                <span style={{ paddingLeft: 16, fontSize: 18, color: '#9CA3AF', display: 'flex', alignItems: 'center' }}>🔍</span>
                <input
                  type="text"
                  className="bm-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search cement, TMT bars, tools, plumbing..."
                  style={{ flex: 1, border: 'none', background: 'transparent', padding: '11px 14px', fontSize: 15, color: '#111827', fontFamily: 'inherit' }}
                />
                <button type="submit" style={{ background: '#1E4D9B', color: '#fff', border: 'none', borderRadius: '10px', padding: '11px 22px', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={(e) => e.target.style.background = '#163A7A'} onMouseOut={(e) => e.target.style.background = '#1E4D9B'}>
                  Search Products
                </button>
              </form>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 10 }}>
                Try: Portland Cement · TMT Fe-500 · Safety Helmets · PVC Pipes · Plywood Sheets
              </p>
            </div>

          </div>

          {/* Stats strip */}
          <div className="bm-fade-4" style={{ marginTop: 56, paddingTop: 32, paddingBottom: 48, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: 0, flexWrap: 'wrap' }}>
            {[{ v: '2,400+', l: 'Products Listed' }, { v: '180+', l: 'Verified Producers' }, { v: '12,000+', l: 'Orders Delivered' }, { v: '98%', l: 'Satisfaction Rate' }].map((stat, i, arr) => (
              <div key={i} style={{ flex: '1 1 140px', paddingRight: i !== arr.length - 1 ? 32 : 0, marginRight: i !== arr.length - 1 ? 32 : 0, borderRight: i !== arr.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                <div style={{ fontSize: 'clamp(26px,3vw,36px)', fontWeight: 800, color: '#fff', fontFamily: "'Syne', system-ui, sans-serif" }}>{stat.v}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.58)', marginTop: 3 }}>{stat.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 2 — Categories */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '72px 24px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#1E4D9B', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>SHOP BY CATEGORY</div>
            <h2 style={{ fontFamily: "'Syne', system-ui, sans-serif", fontSize: 26, fontWeight: 800, color: '#111827', margin: 0 }}>What are you building today?</h2>
          </div>
          <Link to="/catalogue" style={{ fontSize: 14, fontWeight: 600, color: '#1E4D9B', textDecoration: 'none' }}>View all categories →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 16 }}>
          {categories.map((cat, i) => (
            <Link key={i} to="/catalogue" className="bm-cat-card" style={{ display: 'block', textDecoration: 'none', background: '#fff', border: `1.5px solid ${cat.border}`, borderRadius: 14, padding: '22px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ width: 50, height: 50, borderRadius: 12, background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 14 }}>{cat.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{cat.name}</div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>{cat.count} products</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Section 3 — Featured Products */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '72px 24px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#1E4D9B', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>TRENDING THIS WEEK</div>
            <h2 style={{ fontFamily: "'Syne', system-ui, sans-serif", fontSize: 26, fontWeight: 800, color: '#111827', margin: 0 }}>Top products right now</h2>
          </div>
          <Link to="/catalogue" style={{ fontSize: 14, fontWeight: 600, color: '#1E4D9B', textDecoration: 'none' }}>See all products →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(255px, 1fr))', gap: 20 }}>
          {featuredProducts.map((prod) => (
            <Link key={prod.id} to="/catalogue" className="bm-prod-card" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              <div style={{ height: 156, background: 'linear-gradient(135deg, #F1F5F9, #E2E8F0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60, position: 'relative' }}>
                <div style={{ position: 'absolute', top: 12, left: 12, background: prod.badgeColor, color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999 }}>{prod.badge}</div>
                {prod.emoji}
              </div>
              <div style={{ padding: '16px 18px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{prod.category}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', lineHeight: 1.4 }}>{prod.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <StarRating rating={prod.rating} />
                  <span style={{ fontSize: 12, color: '#6B7280' }}>{prod.rating}</span>
                  <span style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 2 }}>({prod.reviews} reviews)</span>
                </div>

                <div style={{ fontSize: 12, color: '#6B7280' }}>by {prod.producer}</div>

                <div style={{ background: '#EFF4FF', color: '#1E4D9B', fontSize: 13, fontWeight: 700, padding: '7px 14px', borderRadius: 8 }}>View →</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Section 4 — Dual CTA */}
      <div style={{ maxWidth: 1200, margin: '64px auto 0', padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Buyer CTA */}
        <div style={{ background: 'linear-gradient(135deg, #1E3A8A, #1E4D9B)', borderRadius: 20, padding: '40px 36px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }}></div>
          <div style={{ position: 'absolute', bottom: -30, right: 30, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }}></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🛒</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: "'Syne', system-ui, sans-serif", marginBottom: 8, marginTop: 0 }}>I need materials</h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.73)', lineHeight: 1.65, marginBottom: 28, maxWidth: 300 }}>
              Browse thousands of products from verified suppliers. Compare prices, check stock, and order in minutes — no middlemen.
            </p>
            <Link className="bm-btn-primary" to={token ? '/catalogue' : '/register'} style={{ display: 'inline-block', textDecoration: 'none', background: '#fff', color: '#1E4D9B', padding: '12px 26px', borderRadius: 10, fontWeight: 700, fontSize: 14 }}>
              {token ? 'Browse Products →' : 'Sign Up Free →'}
            </Link>
          </div>
        </div>
        {/* Supplier CTA */}
        <div style={{ background: 'linear-gradient(135deg, #064E3B, #065F46)', borderRadius: 20, padding: '40px 36px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }}></div>
          <div style={{ position: 'absolute', bottom: -30, right: 30, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }}></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🏭</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: "'Syne', system-ui, sans-serif", marginBottom: 8, marginTop: 0 }}>I'm a supplier</h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.73)', lineHeight: 1.65, marginBottom: 28, maxWidth: 300 }}>
              List your products and reach thousands of contractors and project managers. Start selling in under 10 minutes.
            </p>
            <Link
              to={token && role === 'PRODUCER' ? '/producer/dashboard' : token ? '/register' : '/register'}
              style={{ display: 'inline-block', textDecoration: 'none', background: '#fff', color: '#065F46', padding: '12px 26px', borderRadius: 10, fontWeight: 700, fontSize: 14, transition: 'all 0.15s ease' }}
              onMouseOver={(e) => { e.target.style.background = '#F0FDF4'; e.target.style.transform = 'translateY(-1px)'; }}
              onMouseOut={(e) => { e.target.style.background = '#fff'; e.target.style.transform = 'translateY(0)'; }}
            >
              {token && role === 'PRODUCER' ? 'Go to Dashboard →' : token ? 'Become a Supplier →' : 'Start Selling Free →'}
            </Link>
          </div>
        </div>
      </div>

      {/* Section 5 — How It Works */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '72px 24px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#1E4D9B', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>SIMPLE PROCESS</div>
          <h2 style={{ fontFamily: "'Syne', system-ui, sans-serif", fontSize: 26, fontWeight: 800, color: '#111827', margin: 0 }}>From search to delivery in 4 steps</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(235px, 1fr))', gap: 20 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding: '28px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#EFF4FF', color: '#1E4D9B', fontFamily: "'Syne', system-ui, sans-serif", fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>{s.num}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{s.title}</div>
              <div style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.65 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 6 — Trust Bar */}
      <div style={{ maxWidth: 1200, margin: '56px auto 0', padding: '0 24px' }}>
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 18, padding: '32px 40px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
          {trustItems.map((item, i) => (
            <div key={i} style={{ textAlign: 'center', minWidth: 120 }}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{item.title}</div>
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>{item.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 7 — Final CTA */}
      <div style={{ maxWidth: 1200, margin: '64px auto 0', padding: '0 24px 80px' }}>
        <div style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #1E4D9B 55%, #2563EB 100%)', borderRadius: 24, padding: '64px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }}></div>
          <div style={{ position: 'absolute', bottom: -30, left: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }}></div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, color: '#fff', fontFamily: "'Syne', system-ui, sans-serif", marginBottom: 14, marginTop: 0 }}>Ready to streamline your procurement?</h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.72)', maxWidth: 480, margin: '0 auto 36px', lineHeight: 1.7 }}>
              Join 12,000+ contractors already sourcing smarter on BuildMart. No subscription. No setup fee.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link className="bm-btn-primary" to={token ? "/catalogue" : "/register"} style={{ background: '#fff', color: '#1E4D9B', padding: '13px 32px', borderRadius: 12, fontWeight: 700, fontSize: 15, textDecoration: 'none', display: 'inline-block' }}>
                {token ? "Browse Products" : "Get Started Free"}
              </Link>
              <Link to="/catalogue" style={{ background: 'transparent', color: '#fff', border: '2px solid rgba(255,255,255,0.35)', padding: '13px 32px', borderRadius: 12, fontWeight: 600, fontSize: 15, textDecoration: 'none', display: 'inline-block', transition: 'all 0.15s ease' }} onMouseOver={(e) => { e.target.style.background = 'rgba(255,255,255,0.08)'; e.target.style.borderColor = 'rgba(255,255,255,0.6)'; }} onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.borderColor = 'rgba(255,255,255,0.35)'; }}>
                Browse Catalogue
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Section 8 — Footer */}
      <footer style={{ borderTop: '1px solid #E5E7EB', background: '#fff', padding: '48px 24px 28px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 40, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#1E4D9B', fontFamily: "'Syne', system-ui, sans-serif", marginBottom: 12 }}>🏗️ BuildMart</div>
              <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7, maxWidth: 270, margin: 0 }}>
                India's trusted B2B marketplace for construction materials. Connecting buyers and verified suppliers.
              </p>
            </div>
            {[
              { title: 'Platform', links: ['Browse Products', 'For Suppliers', 'How It Works', 'Pricing'] },
              { title: 'Company', links: ['About Us', 'Blog', 'Careers', 'Contact'] },
              { title: 'Support', links: ['Help Center', 'Terms of Service', 'Privacy Policy', 'Refund Policy'] }
            ].map((col, i) => (
              <div key={i}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>{col.title}</div>
                {col.links.map((link, j) => (
                  <div key={j} style={{ fontSize: 14, color: '#6B7280', marginBottom: 10, cursor: 'pointer' }}>{link}</div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontSize: 13, color: '#9CA3AF' }}>© 2025 BuildMart. All rights reserved.</div>
            <div style={{ fontSize: 13, color: '#9CA3AF' }}>Built for builders across India 🇮🇳</div>
          </div>
        </div>
      </footer>
    </div>
  );
}