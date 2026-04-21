import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './CategoryPage.module.css';
import Navbar from '../components/Navbar';
import ProductGrid from '../components/ProductGrid';
import SortDropdown from '../components/SortDropdown';
import Pagination from '../components/Pagination';
import FilterPanel from '../components/FilterPanel';
import apiClient from '../api/client';

export default function CategoryPage() {
    const { slug } = useParams();
    const navigate = useNavigate();

    const [category, setCategory] = useState(null);
    const [subcategories, setSubcategories] = useState([]);
    const [sortParam, setSortParam] = useState('newest');

    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const [filters, setFilters] = useState({
        minPrice: '',
        maxPrice: '',
        categoryId: slug,
        minRating: 0,
        inStockOnly: false
    });

    // Sync categoryId filter when slug changes
    useEffect(() => {
        setFilters(prev => ({ ...prev, categoryId: slug }));
        setPage(1);
    }, [slug]);

    // Load category meta
    useEffect(() => {
        apiClient.get(`/api/categories/${slug}`)
            .then(res => {
                const data = res.data;
                setCategory(data);
                setSubcategories(data.children || []);
            })
            .catch(err => {
                console.error("Error fetching category", err);
                // navigate('/catalogue', { replace: true });
            });
    }, [slug, navigate]);

    // Fetch products
    useEffect(() => {
        setIsLoading(true);

        const query = new URLSearchParams();
        query.set('page', page);
        query.set('limit', 12);
        query.set('sort', sortParam);
        query.set('category', slug);

        apiClient.get(`/api/products?${query.toString()}`)
            .then(res => {
                const data = res.data;
                let fetchedProducts = data.items || [];

                // Local filtering
                if (filters.minPrice) fetchedProducts = fetchedProducts.filter(p => Number(p.price) >= Number(filters.minPrice));
                if (filters.maxPrice) fetchedProducts = fetchedProducts.filter(p => Number(p.price) <= Number(filters.maxPrice));
                if (filters.inStockOnly) fetchedProducts = fetchedProducts.filter(p => p.stock > 0);

                setProducts(fetchedProducts);
                setTotalPages(data.pages || 1);
                setTotalItems(data.total || fetchedProducts.length);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Error fetching category products", err);
                setIsLoading(false);
            });

    }, [slug, sortParam, filters, page]);

    const handleSubcategoryClick = (subSlug) => {
        navigate(`/category/${subSlug}`);
    }

    return (
        <div className={styles.pageContainer}>
            <Navbar />

            {/* Dynamic Hero Banner based on API meta */}
            <div className={styles.heroBanner}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>{category ? category.name : 'Loading...'}</h1>
                    <p className={styles.heroDesc}>{category ? category.description : ''}</p>
                    <p className={styles.heroCount}>{totalItems} items matching this category</p>
                </div>
            </div>

            <div className={styles.mainLayout}>
                <div className={styles.sidebar}>
                    <FilterPanel
                        categories={subcategories.length > 0 ? subcategories : []}
                        filters={filters}
                        onFilterChange={(f) => {
                            setFilters(f);
                            if (f.categoryId && f.categoryId !== slug) handleSubcategoryClick(f.categoryId);
                            setPage(1);
                        }}
                    />
                </div>

                <div className={styles.contentArea}>

                    {subcategories.length > 0 && (
                        <div className={styles.subcategoryGrid}>
                            {subcategories.map(sub => (
                                <div key={sub.id} className={styles.subTile} onClick={() => handleSubcategoryClick(sub.slug)}>
                                    {sub.name}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className={styles.resultsHeader}>
                        <div className={styles.sortWrapper}>
                            <SortDropdown value={sortParam} onChange={setSortParam} />
                        </div>
                    </div>

                    <div className={styles.gridWrapper}>
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
