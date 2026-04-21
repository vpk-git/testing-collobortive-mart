import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SearchBar.module.css';

export default function SearchBar({ initialQuery = '', onSearch, placeholder = 'Search products...', autoSubmit = false }) {
    const [query, setQuery] = useState(initialQuery);
    const navigate = useNavigate();

    // Handle debounce internally if autoSubmit is provided (e.g. for catalogue page)
    useEffect(() => {
        if (autoSubmit && onSearch) {
            const timeoutId = setTimeout(() => {
                onSearch(query);
            }, 400);
            return () => clearTimeout(timeoutId);
        }
    }, [query, autoSubmit, onSearch]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!autoSubmit && onSearch) {
            onSearch(query);
        } else if (!autoSubmit && !onSearch) {
            // If used in navbar without an explicit onSearch handler, navigate to search results
            if (query.trim()) {
                navigate(`/search?q=${encodeURIComponent(query)}`);
            }
        }
    };

    const handleClear = () => {
        setQuery('');
        if (onSearch) onSearch('');
    };

    return (
        <form className={styles.searchForm} onSubmit={handleSubmit}>
            <span className={styles.searchIcon}>🔍</span>
            <input
                type="text"
                className={styles.input}
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
                <button type="button" className={styles.clearBtn} onClick={handleClear} aria-label="Clear search">
                    &times;
                </button>
            )}
        </form>
    );
}
