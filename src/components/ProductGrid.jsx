import React from 'react';
import ProductCard from './ProductCard';
import SkeletonLoader from './SkeletonLoader';
import EmptyState from './EmptyState';
import styles from './ProductGrid.module.css';

const ProductGrid = ({ products = [], isLoading, loadingCount = 8, emptyMessage = "No products found." }) => {
  if (isLoading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: loadingCount }).map((_, i) => (
          <SkeletonLoader key={i} type="card" />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState 
        icon="📦" 
        title="Nothing to see here" 
        message={emptyMessage} 
      />
    );
  }

  return (
    <div className={styles.grid}>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
