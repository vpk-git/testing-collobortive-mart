import { useState } from 'react'
import { CITIES, getCityAreas } from '../constants/cities'
import { useAuth } from '../context/AuthContext'
import apiClient from '../api/client'

export default function LocationPill() {
  const { token, city, area, setLocation } = useAuth()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState('city')
  const [selectedCity, setSelectedCity] = useState('')

  if (!token) return null

  const handleCitySelect = (cityName) => {
    setSelectedCity(cityName)
    setStep('area')
  }

  const save = async (c, a) => {
    try {
      await apiClient.post('/api/user/location', { city: c, area: a })
      setLocation({ city: c, area: a })
    } catch {}
    setOpen(false)
    setStep('city')
    setSelectedCity('')
  }

  const close = () => {
    setOpen(false)
    setStep('city')
    setSelectedCity('')
  }

  const label = city ? (area ? `${area}, ${city}` : city) : 'Set location'

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: city ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.25)',
          borderRadius: 999, padding: '5px 12px',
          color: '#fff', fontSize: 12, fontWeight: 500,
          cursor: 'pointer', transition: 'background 0.15s',
        }}
        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
        onMouseOut={e => e.currentTarget.style.background = city ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.1)'}
      >
        <span style={{ fontSize: 12 }}>📍</span>
        <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {label}
        </span>
        <span style={{ fontSize: 10, opacity: 0.7 }}>▾</span>
      </button>

      {open && (
        <>
          <div
            onClick={close}
            style={{ position: 'fixed', inset: 0, zIndex: 1000 }}
          />
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
            zIndex: 1001, background: '#fff', border: '1px solid #E5E7EB',
            borderRadius: 12, padding: 16, width: 280,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          }}>
            {step === 'city' && (
              <>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 12 }}>
                  {city ? `Change city (current: ${city})` : 'Select your city'}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {CITIES.map(c => (
                    <button
                      key={c.slug}
                      onClick={() => handleCitySelect(c.name)}
                      style={{
                        background: city === c.name ? '#EFF4FF' : '#F8F9FC',
                        border: `1.5px solid ${city === c.name ? '#1E4D9B' : '#E5E7EB'}`,
                        color: city === c.name ? '#1E4D9B' : '#374151',
                        borderRadius: 6, padding: '7px 10px',
                        fontSize: 12, fontWeight: 500,
                        cursor: 'pointer', textAlign: 'left',
                        transition: 'all 0.15s',
                      }}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 'area' && (
              <>
                <button
                  onClick={() => setStep('city')}
                  style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: 12, cursor: 'pointer', marginBottom: 10, padding: 0 }}
                >
                  ← Back to cities
                </button>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 12 }}>
                  Area in {selectedCity}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
                  {getCityAreas(selectedCity).map(a => (
                    <button
                      key={a}
                      onClick={() => save(selectedCity, a)}
                      style={{
                        background: '#F8F9FC', border: '1.5px solid #E5E7EB',
                        color: '#374151', borderRadius: 6, padding: '7px 10px',
                        fontSize: 12, fontWeight: 500, cursor: 'pointer',
                        textAlign: 'left', transition: 'all 0.15s',
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.background = '#EFF4FF'
                        e.currentTarget.style.borderColor = '#1E4D9B'
                        e.currentTarget.style.color = '#1E4D9B'
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.background = '#F8F9FC'
                        e.currentTarget.style.borderColor = '#E5E7EB'
                        e.currentTarget.style.color = '#374151'
                      }}
                    >
                      {a}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => save(selectedCity, '')}
                  style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: 12, cursor: 'pointer' }}
                >
                  Skip area — just use {selectedCity}
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}