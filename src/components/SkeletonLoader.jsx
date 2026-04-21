import React from 'react';
import styles from './SkeletonLoader.module.css';

const SkeletonLoader = ({ type = 'card' }) => {
  if (type === 'row') {
    return (
      <div className={styles.row}>
        <div className={`${styles.shimmer} ${styles.avatar}`} />
        <div className={styles.lines}>
          <div className={`${styles.shimmer} ${styles.line}`} style={{ width: '40%' }} />
          <div className={`${styles.shimmer} ${styles.line}`} style={{ width: '80%' }} />
        </div>
      </div>
    );
  }

  // Default is card
  return (
    <div className={styles.card}>
      <div className={`${styles.shimmer} ${styles.image}`} />
      <div className={`${styles.shimmer} ${styles.title}`} />
      <div className={`${styles.shimmer} ${styles.line}`} style={{ width: '60%' }} />
      <div className={`${styles.shimmer} ${styles.line}`} style={{ width: '80%' }} />
      <div className={`${styles.shimmer} ${styles.button}`} />
    </div>
  );
};

export default SkeletonLoader;
