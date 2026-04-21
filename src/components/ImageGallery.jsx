import React, { useState } from 'react';
import styles from './ImageGallery.module.css';

const ImageGallery = ({ images = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className={styles.emptyGallery}>
        <span className={styles.emptyText}>No Image Available</span>
      </div>
    );
  }

  const activeImage = images[activeIndex];

  return (
    <div className={styles.container}>
      <div className={styles.mainImageContainer}>
        <img 
          src={activeImage} 
          alt="Product Main" 
          className={styles.mainImage} 
        />
      </div>
      
      {images.length > 1 && (
        <div className={styles.thumbnailStrip}>
          {images.map((img, idx) => (
            <button 
              key={idx}
              className={`${styles.thumbnailBtn} ${idx === activeIndex ? styles.activeThumb : ''}`}
              onClick={() => setActiveIndex(idx)}
            >
              <img src={img} alt={`Thumbnail ${idx + 1}`} className={styles.thumbnail} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
