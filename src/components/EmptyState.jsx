import styles from './EmptyState.module.css';

export default function EmptyState({ icon, title, message, actionButton }) {
    return (
        <div className={styles.emptyStateContainer}>
            <div className={styles.iconContainer}>
                {icon || <span className={styles.defaultIcon}>📂</span>}
            </div>
            <h3 className={styles.title}>{title || 'No results found'}</h3>
            <p className={styles.message}>
                {message || 'We could not find anything matching your criteria. Try adjusting your filters.'}
            </p>
            {actionButton && <div className={styles.actionContainer}>{actionButton}</div>}
        </div>
    );
}
