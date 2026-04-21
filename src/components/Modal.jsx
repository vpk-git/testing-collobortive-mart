import styles from './Modal.module.css';
import Button from './Button';
import { useEffect } from 'react';

export default function Modal({ isOpen, title, children, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', type = 'default' }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal} role="dialog" aria-modal="true">
                <div className={styles.header}>
                    <h3 className={styles.title}>{title}</h3>
                    <button className={styles.closeBtn} onClick={onCancel} aria-label="Close">
                        &times;
                    </button>
                </div>

                <div className={styles.body}>
                    {children}
                </div>

                <div className={styles.footer}>
                    <Button variant="secondary" onClick={onCancel}>{cancelText}</Button>
                    <Button variant={type === 'danger' ? 'danger' : 'primary'} onClick={onConfirm}>{confirmText}</Button>
                </div>
            </div>
        </div>
    );
}
