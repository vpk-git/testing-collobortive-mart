import styles from './Badge.module.css';

export default function Badge({ status, text, type }) {
    let badgeType = type || 'default';

    if (!type && status) {
        const s = status.toUpperCase();
        if (s === 'PUBLISHED' || s === 'IN STOCK' || s === 'DELIVERED') {
            badgeType = 'success';
        } else if (s === 'PENDING' || s === 'LOW STOCK') {
            badgeType = 'warning';
        } else if (s === 'CANCELLED' || s === 'ERROR' || s === 'OUT OF STOCK') {
            badgeType = 'danger';
        } else if (s === 'DRAFT') {
            badgeType = 'default';
        }
    }

    return (
        <span className={`${styles.badge} ${styles[badgeType]}`}>
            {text || status}
        </span>
    );
}
