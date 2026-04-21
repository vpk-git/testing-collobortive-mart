import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    token:        localStorage.getItem('token'),
    role:         localStorage.getItem('role'),
    email:        localStorage.getItem('userEmail'),
    userId:       localStorage.getItem('userId'),
    fullName:     localStorage.getItem('fullName'),
    city:         localStorage.getItem('bm_city') || '',
    area:         localStorage.getItem('bm_area') || '',
    location_set: localStorage.getItem('bm_location_set') === 'true',
  })

 const login = useCallback(async (data) => {
  localStorage.setItem('token',     data.access_token)
  localStorage.setItem('role',      data.role)
  localStorage.setItem('userEmail', data.email)
  localStorage.setItem('userId',    data.user_id)
  localStorage.setItem('fullName',  data.full_name || '')

  // Clear stale location first
  localStorage.removeItem('bm_city')
  localStorage.removeItem('bm_area')
  localStorage.removeItem('bm_location_set')

  // Set base auth state immediately so app renders
  setAuth(prev => ({
    ...prev,
    token:        data.access_token,
    role:         data.role,
    email:        data.email,
    userId:       data.user_id,
    fullName:     data.full_name || '',
    city:         '',
    area:         '',
    location_set: false,
  }))

  // Fetch real location from DB and sync
  try {
    const res = await fetch('http://localhost:8000/api/user/me', {
      headers: { Authorization: `Bearer ${data.access_token}` }
    })
    const me = await res.json()

    if (me.location_set && me.city) {
      localStorage.setItem('bm_city', me.city || '')
      localStorage.setItem('bm_area', me.area || '')
      localStorage.setItem('bm_location_set', 'true')
      setAuth(prev => ({
        ...prev,
        city:         me.city || '',
        area:         me.area || '',
        location_set: true,
      }))
    }
  } catch {
    // If /api/user/me fails, just continue with no location
    // User will be prompted to set it on Catalogue/CreateProduct
  }
}, [])


  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userId')
    localStorage.removeItem('fullName')
    localStorage.removeItem('bm_city')        
    localStorage.removeItem('bm_area')        
    localStorage.removeItem('bm_location_set')
    localStorage.removeItem('chat_session_id')
    setAuth(prev => ({
      ...prev,
      token: null, role: null, email: null, userId: null, fullName: null,
      city: '', area: '', location_set: false,
    }))
  }, [])

  const setLocation = useCallback(({ city, area }) => {
    localStorage.setItem('bm_city', city || '')
    localStorage.setItem('bm_area', area || '')
    localStorage.setItem('bm_location_set', 'true')
    setAuth(prev => ({
      ...prev,
      city:         city || '',
      area:         area || '',
      location_set: true,
    }))
  }, [])

  return (
    <AuthContext.Provider value={{ ...auth, login, logout, setLocation }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}