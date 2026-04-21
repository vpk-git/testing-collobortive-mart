import { useState } from 'react'
import { CITIES, getCityAreas } from '../../constants/cities'
import { useAuth } from '../../context/AuthContext'
import apiClient from '../../api/client'

export default function ProducerLocationSetup({ onComplete }) {
  const { city: currentCity, area: currentArea, location_set, setLocation } = useAuth()
  const [step, setStep]         = useState('city')
  const [selectedCity, setSelectedCity] = useState(currentCity || '')
  const [saving, setSaving]     = useState(false)

  const handleCitySelect = (cityName) => {
    setSelectedCity(cityName)
    setStep('area')
  }

  const save = async (area) => {
    setSaving(true)
    try {
      await apiClient.post('/api/user/location', { city: selectedCity, area })
      setLocation({ city: selectedCity, area })
      if (onComplete) onComplete({ city: selectedCity, area })
    } catch (e) {
      console.error('Failed to save location', e)
    } finally {
      setSaving(false)
    }
  }

  const btnStyle = {
    background: '#F8F9FC', border: '1.5px solid #E5E7EB',
    borderRadius: 8, padding: '9px 12px', fontSize: 13,
    fontWeight: 500, color: '#374151', cursor: 'pointer',
    textAlign: 'left', transition: 'all 0.15s', width: '100%',
  }

  return (
    <div style={{
      background: '#FFFBEB', border: '1px solid #FDE68A',
      borderRadius: 12, padding: 20, marginBottom: 20,
    }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#92400E', marginBottom: 4 }}>
        📍 Set your store location
      </div>
      <div style={{ fontSize: 12, color: '#B45309', marginBottom: 16 }}>
        Buyers search for suppliers near them. Set your location so they can find you.
        {location_set && currentCity && (
          <span style={{ color: '#15803D', marginLeft: 6 }}>
            Current: <strong>{currentArea ? `${currentArea}, ${currentCity}` : currentCity}</strong>
          </span>
        )}
      </div>

      {step === 'city' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
          {CITIES.map(c => (
            <button
              key={c.slug}
              onClick={() => handleCitySelect(c.name)}
              style={{
                ...btnStyle,
                background: selectedCity === c.name ? '#EFF4FF' : '#F8F9FC',
                borderColor: selectedCity === c.name ? '#1E4D9B' : '#E5E7EB',
                color: selectedCity === c.name ? '#1E4D9B' : '#374151',
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {step === 'area' && (
        <>
          <button
            onClick={() => setStep('city')}
            style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: 12, cursor: 'pointer', marginBottom: 10, padding: 0 }}
          >
            ← Back to cities
          </button>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>
            Area in {selectedCity}:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8, marginBottom: 10 }}>
            {getCityAreas(selectedCity).map(a => (
              <button
                key={a}
                onClick={() => save(a)}
                disabled={saving}
                style={btnStyle}
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
            onClick={() => save('')}
            disabled={saving}
            style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: 12, cursor: 'pointer' }}
          >
            Skip area — just use {selectedCity}
          </button>
        </>
      )}
    </div>
  )
}