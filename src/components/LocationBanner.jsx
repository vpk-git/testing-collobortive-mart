import { useState } from 'react'
import { CITIES, getCityAreas } from '../constants/cities'
import { useAuth } from '../context/AuthContext'
import apiClient from '../api/client'

export default function LocationBanner({ onLocationSet }) {
  const { token, setLocation } = useAuth()
  const [step, setStep] = useState('banner')
  const [selectedCity, setSelectedCity] = useState('')
  const [saving, setSaving] = useState(false)

  if (!token) return null

  const handleCitySelect = (cityName) => {
    setSelectedCity(cityName)
    setStep('area')
  }

  const saveLocation = async (city, area) => {
    setSaving(true)
    try {
      await apiClient.post('/api/user/location', { city, area })
      setLocation({ city, area })
      if (onLocationSet) onLocationSet({ city, area })
    } catch (e) {
      console.error('Failed to save location', e)
    } finally {
      setSaving(false)
    }
  }

  const dismiss = () => {
    if (onLocationSet) onLocationSet(null)
  }

  if (step === 'banner') {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #EFF4FF, #E0E9FF)',
        border: '1px solid #C7D7F8', borderRadius: 12,
        padding: '14px 20px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        gap: 16, flexWrap: 'wrap', marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>📍</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1E3A8A' }}>
              Set your location for better results
            </div>
            <div style={{ fontSize: 12, color: '#3B5BA5', marginTop: 2 }}>
              We'll show you suppliers and products closest to you first
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button
            onClick={() => setStep('city')}
            style={{
              background: '#1E4D9B', color: '#fff', border: 'none',
              borderRadius: 8, padding: '8px 18px', fontSize: 13,
              fontWeight: 600, cursor: 'pointer',
            }}
          >
            Select City
          </button>
          <button
            onClick={dismiss}
            style={{
              background: 'none', color: '#6B7280',
              border: '1px solid #D1D5DB', borderRadius: 8,
              padding: '8px 14px', fontSize: 13, cursor: 'pointer',
            }}
          >
            Maybe later
          </button>
        </div>
      </div>
    )
  }

  if (step === 'city') {
    return (
      <div style={{
        background: '#fff', border: '1px solid #E5E7EB',
        borderRadius: 12, padding: '20px', marginBottom: 20,
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>
            📍 Select your city
          </div>
          <button
            onClick={dismiss}
            style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: 20 }}
          >×</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
          {CITIES.map(city => (
            <button
              key={city.slug}
              onClick={() => handleCitySelect(city.name)}
              style={{
                background: '#F8F9FC', border: '1.5px solid #E5E7EB',
                borderRadius: 8, padding: '10px 14px', fontSize: 13,
                fontWeight: 500, color: '#374151', cursor: 'pointer',
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
              {city.name}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (step === 'area') {
    const areas = getCityAreas(selectedCity)
    return (
      <div style={{
        background: '#fff', border: '1px solid #E5E7EB',
        borderRadius: 12, padding: '20px', marginBottom: 20,
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>
            📍 {selectedCity} — which area?
          </div>
          <button
            onClick={dismiss}
            style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: 20 }}
          >×</button>
        </div>
        <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 14 }}>
          Optional — helps narrow results further
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8, marginBottom: 12 }}>
          {areas.map(area => (
            <button
              key={area}
              onClick={() => saveLocation(selectedCity, area)}
              disabled={saving}
              style={{
                background: '#F8F9FC', border: '1.5px solid #E5E7EB',
                borderRadius: 8, padding: '9px 12px', fontSize: 13,
                fontWeight: 500, color: '#374151', cursor: 'pointer',
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
              {area}
            </button>
          ))}
        </div>
        <button
          onClick={() => saveLocation(selectedCity, '')}
          disabled={saving}
          style={{
            background: 'none', border: 'none', color: '#6B7280',
            fontSize: 13, cursor: 'pointer', padding: '4px 0',
          }}
        >
          Skip — just use {selectedCity}
        </button>
      </div>
    )
  }

  return null
}