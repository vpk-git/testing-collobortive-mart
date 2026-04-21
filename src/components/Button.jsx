import styles from './Button.module.css';

export default function Button({
    children,
    variant = 'primary',
    disabled = false,
    onClick,
    className = '',
    type = 'button'
}) {
    return (
        <button
            type={type}
            className={`${styles.base} ${styles[variant]} ${className}`}
            disabled={disabled}
            onClick={onClick}
        >
            {children}
        </button>
    );
}
