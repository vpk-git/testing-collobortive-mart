import React from 'react';
import styles from './Pagination.module.css';

const Pagination = ({ current, total, onChange }) => {
  if (total <= 1) return null;

  const getPages = () => {
    const pages = [];
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className={styles.pagination}>
      <button 
        className={styles.navBtn} 
        disabled={current === 1}
        onClick={() => onChange(current - 1)}
      >
        Prev
      </button>
      
      <div className={styles.pages}>
        {getPages().map(page => (
          <button
            key={page}
            className={`${styles.pageBtn} ${current === page ? styles.active : ''}`}
            onClick={() => onChange(page)}
          >
            {page}
          </button>
        ))}
      </div>

      <button 
        className={styles.navBtn} 
        disabled={current === total}
        onClick={() => onChange(current + 1)}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
