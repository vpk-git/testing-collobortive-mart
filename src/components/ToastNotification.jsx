import React, { useEffect, useState } from 'react';
import styles from './ToastNotification.module.css';

const ToastNotification = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        if (onClose) onClose();
      }, 300); // Wait for transition
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible && !onClose) return null;

  return (
    <div className={`${styles.toast} ${styles[type]} ${visible ? styles.show : styles.hide}`}>
      <span className={styles.message}>{message}</span>
      <button className={styles.closeBtn} onClick={() => {
        setVisible(false);
        setTimeout(() => { if (onClose) onClose(); }, 300);
      }}>&times;</button>
    </div>
  );
};

export default ToastNotification;
