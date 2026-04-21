// frontend/src/components/ProducerLayout.jsx
import Navbar from './Navbar';
import ProducerSidebar from './ProducerSidebar';

export default function ProducerLayout({ children, title, subtitle }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F8F9FC' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1, paddingTop: '64px' }}>
        <ProducerSidebar />
        <main style={{ marginLeft: '240px', flex: 1, padding: '24px', minHeight: 'calc(100vh - 64px)' }}>
          {title && (
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: 0 }}>{title}</h1>
              {subtitle && <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>{subtitle}</p>}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
