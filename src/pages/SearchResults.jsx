import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import styles from './SearchResults.module.css';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import ProductGrid from '../components/ProductGrid';
import SortDropdown from '../components/SortDropdown';
import Pagination from '../components/Pagination';
import apiClient from '../api/client';

export default function SearchResults() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const queryParam = searchParams.get('q') || '';

    const [searchQuery, setSearchQuery] = useState(queryParam);
    const [sortParam, setSortParam] = useState('newest');

    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Pagination state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Filter state
    const [filters, setFilters] = useState({
        minPrice: '',
        maxPrice: '',
        categoryId: '',
        minRating: 0,
        inStockOnly: false
    });

    // Load categories once
    useEffect(() => {
        apiClient.get(`/api/categories`)
            .then(res => setCategories(res.data))
            .catch(console.error);
    }, []);

    // Fetch products
    useEffect(() => {
        if (!queryParam) return;

        setIsLoading(true);
        setSearchQuery(queryParam);

        // Fetch Suggestions if zero results expected or just fetch immediately
        apiClient.get(`/api/products/suggestions?q=${queryParam}`)
            .then(res => setSuggestions(res.data))
            .catch(console.error);

        const query = new URLSearchParams();
        query.set('page', page);
        query.set('limit', 12);
        query.set('sort', sortParam);
        query.set('search', queryParam);

        if (filters.categoryId) {
            query.set('category', filters.categoryId);
        }

        apiClient.get(`/api/products?${query.toString()}`)
            .then(res => {
                const data = res.data;
                let fetchedProducts = data.items || data;

                if (filters.minPrice) fetchedProducts = fetchedProducts.filter(p => Number(p.price) >= Number(filters.minPrice));
                if (filters.maxPrice) fetchedProducts = fetchedProducts.filter(p => Number(p.price) <= Number(filters.maxPrice));
                if (filters.inStockOnly) fetchedProducts = fetchedProducts.filter(p => p.stock > 0);

                setProducts(fetchedProducts);
                setTotalPages(data.pages || 1);
                setTotalItems(data.total || fetchedProducts.length);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Error fetching products", err);
                setIsLoading(false);
            });

    }, [queryParam, sortParam, filters, page]);

    const handleSearch = (newQuery) => {
        if (newQuery.trim()) {
            setSearchParams({ q: newQuery });
            setPage(1);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchParams({ q: suggestion });
        setPage(1);
    }

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setPage(1);
    };

    return (
        <div className={styles.pageContainer}>
            <Navbar />

            <div className={styles.searchHeaderSection}>
                <div className={styles.headerContent}>
                    <div className={styles.searchBoxWrapper}>
                        <SearchBar
                            initialQuery={searchQuery}
                            onSearch={handleSearch}
                            placeholder="Search cement, tools, heavy equipment..."
                        />
                    </div>
                    <h1 className={styles.resultsTitle}>
                        Results for: <span className={styles.queryHighlight}>"{queryParam}"</span>
                    </h1>
                    <p className={styles.resultCount}>
                        {isLoading ? 'Checking...' : `${totalItems} items found`}
                    </p>
                </div>
            </div>

            <div className={styles.mainLayout}>
                <div className={styles.sidebar}>
                    <FilterPanel
                        categories={categories}
                        filters={filters}
                        onFilterChange={handleFilterChange}
                    />
                </div>

                <div className={styles.contentArea}>
                    <div className={styles.resultsHeader}>
                        <div className={styles.sortWrapper}>
                            <SortDropdown value={sortParam} onChange={setSortParam} />
                        </div>
                    </div>

                    <div className={styles.gridWrapper}>
                        {!isLoading && products.length === 0 && suggestions.length > 0 && (
                            <div className={styles.suggestionsBox}>
                                <p>Did you mean:</p>
                                <div className={styles.suggestionTags}>
                                    {suggestions.map((s, idx) => (
                                        <button key={idx} className={styles.suggestionTag} onClick={() => handleSuggestionClick(s)}>{s}</button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <ProductGrid products={products} isLoading={isLoading} />

                        {!isLoading && totalPages > 1 && (
                            <Pagination
                                current={page}
                                total={totalPages}
                                onChange={setPage}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
