import React from 'react';
import styles from './CategoryPills.module.css';

const CategoryPills = ({ categories = [], activeCategory, onSelect }) => {
  if (!categories.length) return null;

  return (
    <div className={styles.scrollContainer}>
      <div className={styles.pillsList}>
        <button
          className={`${styles.pill} ${!activeCategory ? styles.active : ''}`}
          onClick={() => onSelect('')}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat.slug || cat.id}
            className={`${styles.pill} ${activeCategory === (cat.slug || cat.id) ? styles.active : ''}`}
            onClick={() => onSelect(cat.slug || cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryPills;
