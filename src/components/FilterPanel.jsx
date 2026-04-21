import { useState, useEffect } from 'react';
import styles from './FilterPanel.module.css';
import Button from './Button';
import RatingStars from './RatingStars';

export default function FilterPanel({ filters, onFilterChange, categories = [] }) {
  const [localFilters, setLocalFilters] = useState({
    min_price: filters?.min_price || '',
    max_price: filters?.max_price || '',
    category: filters?.category || '',
    min_rating: filters?.min_rating || 0,
    in_stock: filters?.in_stock === 'true'
  });

  // Sync if parent updates filters
  useEffect(() => {
    if (filters) {
      setLocalFilters({
        min_price: filters.min_price || '',
        max_price: filters.max_price || '',
        category: filters.category || '',
        min_rating: filters.min_rating || 0,
        in_stock: filters.in_stock === 'true'
      });
    }
  }, [filters]);

  const handleChange = (field, value) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApply = () => {
    onFilterChange(localFilters);
  };

  const handleClear = () => {
    const empty = { min_price: '', max_price: '', category: '', min_rating: 0, in_stock: false };
    setLocalFilters(empty);
    onFilterChange(empty);
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.title}>Filters</h3>
        <button className={styles.clearBtn} onClick={handleClear}>Clear All</button>
      </div>

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Category</h4>
        <select
          className={styles.select}
          value={localFilters.category}
          onChange={(e) => handleChange('category', e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id || c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Price Range (₹)</h4>
        <div className={styles.priceInputs}>
          <input
            type="number"
            placeholder="Min"
            className={styles.input}
            value={localFilters.min_price}
            onChange={(e) => handleChange('min_price', e.target.value)}
            min="0"
          />
          <span className={styles.separator}>-</span>
          <input
            type="number"
            placeholder="Max"
            className={styles.input}
            value={localFilters.max_price}
            onChange={(e) => handleChange('max_price', e.target.value)}
            min="0"
          />
        </div>
      </div>

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Minimum Rating</h4>
        <div className={styles.ratingControl}>
          <RatingStars
            value={localFilters.min_rating}
            interactive={true}
            onChange={(val) => handleChange('min_rating', val)}
          />
          <span className={styles.ratingText}>
            {localFilters.min_rating > 0 ? `${localFilters.min_rating} & Up` : 'Any'}
          </span>
        </div>
      </div>

      <div className={styles.section}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={localFilters.in_stock}
            onChange={(e) => handleChange('in_stock', e.target.checked)}
            className={styles.checkbox}
          />
          Show only In Stock
        </label>
      </div>

      <Button variant="primary" className={styles.applyBtn} onClick={handleApply}>
        Apply Filters
      </Button>
    </div>
  );
}
