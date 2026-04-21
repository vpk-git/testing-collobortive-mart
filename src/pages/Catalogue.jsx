import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import apiClient from '../api/client'
import Navbar from '../components/Navbar'
import ProductGrid from '../components/ProductGrid'
import CategoryPills from '../components/CategoryPills'
import FilterPanel from '../components/FilterPanel'
import SortDropdown from '../components/SortDropdown'
import Pagination from '../components/Pagination'
import SearchBar from '../components/SearchBar'
import SkeletonLoader from '../components/SkeletonLoader'
import ToastNotification from '../components/ToastNotification'
import LocationBanner from '../components/LocationBanner'
import styles from './Catalogue.module.css'
import { useAuth } from '../context/AuthContext'

export default function Catalogue() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { token, city, area, location_set, setLocation } = useAuth()

  const [products, setProducts]         = useState([])
  const [categories, setCategories]     = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [totalPages, setTotalPages]     = useState(1)
  const [totalItems, setTotalItems]     = useState(0)
  const [toast, setToast]               = useState(null)
  const [showLocationBanner, setShowLocationBanner] = useState(false)

  const currentPage     = parseInt(searchParams.get('page') || '1', 10)
  const currentSort     = searchParams.get('sort') || 'newest'
  const currentCategory = searchParams.get('category') || ''
  const currentSearch   = searchParams.get('q') || ''
  const currentMinPrice = searchParams.get('min_price') || ''
  const currentMaxPrice = searchParams.get('max_price') || ''
  const currentInStock  = searchParams.get('in_stock') || 'false'
  const ITEMS_PER_PAGE  = 12

  // Show banner if logged in but no location set yet
  useEffect(() => {
    if (token && !location_set) {
      setShowLocationBanner(true)
    }
  }, [token, location_set])

  // Load categories once
  useEffect(() => {
    apiClient.get('/api/categories/')
      .then(res => {
        const flat = []
        const flatten = (cats) => {
          cats.forEach(cat => {
            flat.push(cat)
            if (cat.children?.length > 0) flatten(cat.children)
          })
        }
        flatten(res.data)
        setCategories(flat)
      })
      .catch(() => setCategories([]))
  }, [])

  const loadProducts = useCallback(() => {
    setLoading(true)
    setError(null)

    const params = new URLSearchParams()
    params.set('page',  String(currentPage))
    params.set('limit', String(ITEMS_PER_PAGE))
    params.set('sort',  currentSort)
    if (currentSearch)            params.set('q', currentSearch)
    if (currentCategory)          params.set('category_slug', currentCategory)
    if (currentMinPrice)          params.set('min_price', currentMinPrice)
    if (currentMaxPrice)          params.set('max_price', currentMaxPrice)
    if (currentInStock === 'true') params.set('in_stock', 'true')
    if (city)                     params.set('city', city)
    if (area)                     params.set('area', area)

    apiClient.get(`/api/products?${params.toString()}`)
      .then(res => {
        setProducts(res.data.items || [])
        setTotalItems(res.data.total || 0)
        setTotalPages(res.data.pages || 1)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load products. Please try again.')
        setLoading(false)
      })
  }, [currentPage, currentSort, currentCategory, currentSearch,
      currentMinPrice, currentMaxPrice, currentInStock, city, area])

  useEffect(() => { loadProducts() }, [loadProducts])

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    next.set('page', '1')
    setSearchParams(next)
  }

  const handleSearch         = (q)    => updateFilter('q', q)
  const handleCategorySelect = (slug) => updateFilter('category', slug === currentCategory ? '' : slug)
  const handleSortChange     = (sort) => updateFilter('sort', sort)
  const handlePageChange     = (page) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(page))
    setSearchParams(next)
  }
  const handleFilterChange = (filters) => {
    const next = new URLSearchParams(searchParams)
    if (filters.min_price) next.set('min_price', filters.min_price); else next.delete('min_price')
    if (filters.max_price) next.set('max_price', filters.max_price); else next.delete('max_price')
    if (filters.in_stock)  next.set('in_stock', 'true');             else next.delete('in_stock')
    next.set('page', '1')
    setSearchParams(next)
  }

  const handleAddToCart = (product) => {
    if (!token) { navigate('/login'); return }
    apiClient.post('/api/cart/items', { product_id: product.id, quantity: 1 })
      .then(() => setToast({ type: 'success', message: `"${product.title}" added to cart!` }))
      .catch(() => setToast({ type: 'error', message: 'Failed to add to cart.' }))
  }

  const handleLocationSet = (locationData) => {
    setShowLocationBanner(false)
    if (locationData) setLocation(locationData)
  }

  return (
    <div className={styles.cataloguePage || 'catalogue-page'}>
      <Navbar />
      <div style={{ paddingTop: '80px' }}>

        <div style={{ padding: '24px 24px 0' }}>
          <SearchBar value={currentSearch} onSearch={handleSearch} placeholder="Search products..." />
        </div>

        {/* Location banner — logged in but no location */}
        {showLocationBanner && (
          <div style={{ padding: '16px 24px 0' }}>
            <LocationBanner onLocationSet={handleLocationSet} />
          </div>
        )}

        {/* City context bar — location already set */}
        {city && !showLocationBanner && (
          <div style={{
            margin: '12px 24px 0', padding: '10px 16px',
            background: '#F0FDF4', border: '1px solid #BBF7D0',
            borderRadius: 8, fontSize: 13, color: '#15803D',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span>📍</span>
            <span>
              Showing products near <strong>{area ? `${area}, ${city}` : city}</strong>
              {' '}— suppliers in your city appear first
            </span>
          </div>
        )}

        <div style={{ padding: '16px 24px' }}>
          <CategoryPills
            categories={categories}
            activeCategory={currentCategory}
            onSelect={handleCategorySelect}
          />
        </div>

        <div style={{ display: 'flex', padding: '0 24px', gap: '24px' }}>
          <aside style={{ minWidth: '220px', maxWidth: '260px' }}>
            <FilterPanel
              filters={{ min_price: currentMinPrice, max_price: currentMaxPrice, in_stock: currentInStock }}
              categories={categories}
              onFilterChange={handleFilterChange}
            />
          </aside>

          <main style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>
                {loading ? 'Loading...' : `${totalItems} product${totalItems !== 1 ? 's' : ''} found`}
              </span>
              <SortDropdown value={currentSort} onChange={handleSortChange} />
            </div>

            {error && (
              <div style={{ padding: '24px', textAlign: 'center', color: '#ef4444', background: '#fef2f2', borderRadius: '8px', marginBottom: '16px' }}>
                {error}
                <button onClick={loadProducts} style={{ marginLeft: '12px', color: '#3b82f6', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Retry
                </button>
              </div>
            )}

            {loading
              ? <SkeletonLoader count={ITEMS_PER_PAGE} />
              : <ProductGrid products={products} onAddToCart={handleAddToCart} />
            }

            {!loading && totalPages > 1 && (
              <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center' }}>
                <Pagination current={currentPage} total={totalPages} onChange={handlePageChange} />
              </div>
            )}
          </main>
        </div>
      </div>

      {toast && (
        <ToastNotification
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
          duration={3000}
        />
      )}
    </div>
  )
}