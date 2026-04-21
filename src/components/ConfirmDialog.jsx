import React from 'react';
import Modal from './Modal';
import styles from './ConfirmDialog.module.css';

const ConfirmDialog = ({ isOpen, title = "Confirm Action", message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', isDanger = true }) => {
    return (
        <Modal
            isOpen={isOpen}
            title={title}
            onConfirm={onConfirm}
            onCancel={onCancel}
            confirmText={confirmText}
            cancelText={cancelText}
        >
            <div className={styles.container}>
                <div className={styles.warningIcon}>⚠️</div>
                <div className={styles.messageContent}>
                    <p>{message}</p>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmDialog;
