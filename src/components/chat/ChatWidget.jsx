import { useState, useEffect, useRef } from 'react';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';

// Role-based suggestions
const CONSUMER_SUGGESTIONS = [
  "Show me cement products near me",
  "What's the cheapest safety helmet?",
  "Find tools under ₹500",
  "Are there suppliers in my city?",
];

const PRODUCER_SUGGESTIONS = [
  "Add OPC cement 50kg at ₹450, 200 units",
  "Show my products",
  "View my store stats",
  "How do I publish a product?",
];

// Render **bold** markdown in messages
const parseBold = (text) => {
  if (!text) return { __html: '' };
  let s = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Render **bold**
  s = s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Render _italic_ hints
  s = s.replace(/_(.*?)_/g, '<em style="color:#6B7280">$1</em>');

  // Detect image upload URLs: /producer/products/{uuid}/images
  // Render as a styled inline button instead of a raw URL
  s = s.replace(
    /https?:\/\/localhost:\d+\/producer\/products\/([0-9a-f-]+)\/images/gi,
    (match, productId) =>
      `<a href="/producer/products/${productId}/images" ` +
      `style="display:inline-flex;align-items:center;gap:6px;` +
      `background:#1E4D9B;color:#fff;text-decoration:none;` +
      `border-radius:8px;padding:8px 14px;font-size:12px;font-weight:600;` +
      `margin:4px 0;cursor:pointer;" ` +
      `onclick="event.preventDefault();window.location.href='/producer/products/${productId}/images'">` +
      `📸 Upload Product Photos</a>`
  );

  // Fallback: make any remaining http/https URL a plain clickable link
  s = s.replace(
    /(?<!['"=])(https?:\/\/[^\s<"]+)/g,
    '<a href="$1" style="color:#1E4D9B;text-decoration:underline;" target="_blank" rel="noopener">$1</a>'
  );

  s = s.replace(/\n/g, '<br/>');
  return { __html: s };
};

export default function ChatWidget() {
  const { token, role } = useAuth();

  const [open, setOpen]                   = useState(false);
  const [messages, setMessages]           = useState([]);
  const [input, setInput]                 = useState('');
  const [loading, setLoading]             = useState(false);
  const [sessionId, setSessionId]         = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  const isProducer    = role === 'PRODUCER';
  const suggestions   = isProducer ? PRODUCER_SUGGESTIONS : CONSUMER_SUGGESTIONS;
  const headerColor   = isProducer ? '#0F6E56' : '#1E4D9B';
  const bubbleColor   = isProducer ? '#0F6E56' : '#1E4D9B';
  const botName       = isProducer ? 'Store Assistant' : 'BuildMart Assistant';
  const botSubtitle   = isProducer ? 'Manage your store via chat' : 'Find products & suppliers';
  const placeholder   = isProducer
    ? 'Add products, check stock, get help...'
    : 'Ask about products, prices, suppliers...';
  const welcomeMsg    = isProducer
    ? "Hi! I'm your Store Assistant. I can help you add products, check your inventory, and manage your listings — all through chat."
    : "Hi! I'm your BuildMart assistant. I can help you find products, compare prices, and locate suppliers near you.";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      const saved = localStorage.getItem('chat_session_id');
      if (saved && messages.length === 0) loadHistory(saved);
    }
  }, [open]);

  // Reset chat when role changes (e.g. different user logs in)
  useEffect(() => {
    setMessages([]);
    setSessionId(null);
    setShowSuggestions(true);
  }, [role]);

  const loadHistory = async (sid) => {
    try {
      const res = await apiClient.get(`/api/chat/history?session_id=${sid}`);
      if (res.data.messages?.length > 0) {
        setMessages(res.data.messages.map(m => ({
          role: m.role, content: m.content, id: m.id,
        })));
        setSessionId(sid);
        setShowSuggestions(false);
      }
    } catch {
      localStorage.removeItem('chat_session_id');
    }
  };

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user', content: text, id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setShowSuggestions(false);

    try {
      const res = await apiClient.post('/api/chat/', {
        message: text,
        session_id: sessionId,
      });

      const { reply, session_id: newSid, results } = res.data;
      setSessionId(newSid);
      localStorage.setItem('chat_session_id', newSid);

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: reply,
        results: results?.length > 0 ? results : [],
        id: Date.now() + 1,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        id: Date.now() + 1,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    if (sessionId) {
      try { await apiClient.delete(`/api/chat/session/${sessionId}`); } catch {}
    }
    setMessages([]);
    setSessionId(null);
    setShowSuggestions(true);
    localStorage.removeItem('chat_session_id');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return token ? (
    <>
      {/* Floating bubble */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          width: 56, height: 56, borderRadius: '50%',
          background: bubbleColor, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 16px ${isProducer ? 'rgba(15,110,86,0.4)' : 'rgba(30,77,155,0.4)'}`,
          transition: 'background 0.2s',
        }}
        onMouseOver={e => e.currentTarget.style.background = isProducer ? '#085041' : '#163A7A'}
        onMouseOut={e => e.currentTarget.style.background = bubbleColor}
        title={botName}
      >
        <span style={{ fontSize: 22 }}>{open ? '✕' : isProducer ? '🏪' : '💬'}</span>
      </button>

      {open && (
        <div style={{
          position: 'fixed', bottom: 92, right: 24, zIndex: 9998,
          width: 390, height: 540, maxWidth: 'calc(100vw - 32px)',
          background: '#FFFFFF', borderRadius: 16,
          border: '1px solid #E5E7EB',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>

          {/* Header */}
          <div style={{
            background: headerColor, padding: '14px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16,
              }}>
                {isProducer ? '🏪' : '🤖'}
              </div>
              <div>
                <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{botName}</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>{botSubtitle}</div>
              </div>
            </div>
            <button
              onClick={clearChat}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 12 }}
            >Clear</button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '16px',
            display: 'flex', flexDirection: 'column', gap: 12,
            background: '#F8F9FC',
          }}>
            {/* Welcome */}
            {messages.length === 0 && (
              <div style={{
                background: isProducer ? '#E1F5EE' : '#EFF4FF',
                border: `1px solid ${isProducer ? '#9FE1CB' : '#C7D7F8'}`,
                borderRadius: 12, padding: '12px 14px',
                fontSize: 13, color: isProducer ? '#085041' : '#1E4D9B',
              }}>
                {welcomeMsg}
              </div>
            )}

            {/* Suggestions */}
            {showSuggestions && messages.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>Try:</div>
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s)}
                    style={{
                      background: '#fff', border: '1px solid #E5E7EB',
                      borderRadius: 8, padding: '8px 12px',
                      fontSize: 13, color: '#374151', cursor: 'pointer',
                      textAlign: 'left', transition: 'all 0.15s',
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.background = isProducer ? '#E1F5EE' : '#EFF4FF';
                      e.currentTarget.style.borderColor = isProducer ? '#0F6E56' : '#1E4D9B';
                      e.currentTarget.style.color = isProducer ? '#0F6E56' : '#1E4D9B';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.background = '#fff';
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.color = '#374151';
                    }}
                  >{s}</button>
                ))}
              </div>
            )}

            {/* Message bubbles */}
            {messages.map(msg => (
              <div key={msg.id} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '88%',
                  background: msg.role === 'user'
                    ? (isProducer ? '#0F6E56' : '#1E4D9B')
                    : '#FFFFFF',
                  color: msg.role === 'user' ? '#fff' : '#111827',
                  borderRadius: msg.role === 'user'
                    ? '12px 12px 2px 12px'
                    : '12px 12px 12px 2px',
                  padding: '10px 14px',
                  fontSize: 13, lineHeight: 1.6,
                  border: msg.role === 'assistant' ? '1px solid #E5E7EB' : 'none',
                }}>
                  <span dangerouslySetInnerHTML={parseBold(msg.content)} />

                  {/* Product cards for consumer */}
                  {!isProducer && msg.results?.length > 0 && (
                    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {msg.results.slice(0, 5).map((p, i) => (
                        <div key={i} style={{
                          background: '#F8F9FC', border: '1px solid #E5E7EB',
                          borderRadius: 8, padding: '8px 10px', fontSize: 12,
                        }}>
                          {p.title && <div style={{ fontWeight: 600, color: '#111827', marginBottom: 2 }}>{p.title}</div>}
                          {p.price && <div style={{ color: '#1E4D9B', fontWeight: 500 }}>₹{Number(p.price).toLocaleString('en-IN')}</div>}
                          {p.city && <div style={{ color: '#6B7280', fontSize: 11 }}>📍 {p.area ? `${p.area}, ` : ''}{p.city}</div>}
                          {p.stock !== undefined && (
                            <div style={{ color: p.stock > 0 ? '#16A34A' : '#DC2626', fontSize: 11 }}>
                              {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  background: '#FFFFFF', border: '1px solid #E5E7EB',
                  borderRadius: '12px 12px 12px 2px', padding: '10px 14px',
                  display: 'flex', gap: 4, alignItems: 'center',
                }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 6, height: 6, borderRadius: '50%', background: '#9CA3AF',
                      animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '12px', borderTop: '1px solid #E5E7EB',
            background: '#fff', display: 'flex', gap: 8,
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={placeholder}
              style={{
                flex: 1, border: '1.5px solid #E5E7EB', borderRadius: 8,
                padding: '8px 12px', fontSize: 13, outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = isProducer ? '#0F6E56' : '#1E4D9B'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
              disabled={loading}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              style={{
                background: input.trim() && !loading
                  ? (isProducer ? '#0F6E56' : '#1E4D9B')
                  : '#E5E7EB',
                color: input.trim() && !loading ? '#fff' : '#9CA3AF',
                border: 'none', borderRadius: 8, padding: '8px 14px',
                fontSize: 16,
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s',
              }}
            >➤</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </>
  ) : null;
}