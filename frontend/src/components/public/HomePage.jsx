import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getRestaurants, searchRestaurants } from '../../api/publicService';
import { getFavourites, addFavourite, removeFavourite } from '../../api/userService';
import { AuthContext } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import './HomePage.css';

const CUISINE_TYPES = ['ALL', 'INDIAN', 'CHINESE', 'ITALIAN', 'MEXICAN', 'CONTINENTAL', 'AMERICAN'];

const cuisineEmoji = {
    INDIAN: '🍛',
    CHINESE: '🥡',
    ITALIAN: '🍕',
    MEXICAN: '🌮',
    CONTINENTAL: '🍽️',
    AMERICAN: '🍔',
};

const OWNER_GREETINGS = [
    "Your rating depends on today.",
    "Customers are judging your menu.",
    "Hope the orders keep coming.",
    "Welcome back. Time to impress the customers."
];

const ADMIN_GREETINGS = [
    "Hi Boss, the platform is yours.",
    "Welcome back, Boss. Everything is under control.",
    "Hey Boss, time to run the show.",
    "Boss mode activated. Let's go.",
];

const HomePage = () => {
    const { user } = useContext(AuthContext);
    const ownerGreeting = useMemo(() => OWNER_GREETINGS[Math.floor(Math.random() * OWNER_GREETINGS.length)], []);
    const adminGreeting = useMemo(() => ADMIN_GREETINGS[Math.floor(Math.random() * ADMIN_GREETINGS.length)], []);
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCuisine, setSelectedCuisine] = useState('ALL');
    const [showOpenOnly, setShowOpenOnly] = useState(false);
    const [favouriteIds, setFavouriteIds] = useState(new Set());
    const [togglingFav, setTogglingFav] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        if (user) {
            getFavourites()
                .then(favs => setFavouriteIds(new Set(favs.map(f => f.restaurantId))))
                .catch(() => {});
        }
    }, [user]);

    useEffect(() => {
        if (searchQuery.trim()) return;
        fetchRestaurants();
    }, [selectedCuisine, showOpenOnly, searchQuery]);

    useEffect(() => {
        if (!searchQuery.trim()) return;
        const timeout = setTimeout(() => handleSearch(), 400);
        return () => clearTimeout(timeout);
    }, [searchQuery]);

    const fetchRestaurants = async () => {
        setLoading(true);
        setError('');
        try {
            const filters = {};
            if (selectedCuisine !== 'ALL') filters.cuisineType = selectedCuisine;
            if (showOpenOnly) filters.isOpen = true;
            const data = await getRestaurants(filters);
            setRestaurants(data);
        } catch (err) {
            setError('Unable to load restaurants. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setSearching(true);
        setLoading(true);
        setError('');
        try {
            const data = await searchRestaurants(searchQuery.trim());
            setRestaurants(data);
        } catch {
            setError('Search failed. Please try again.');
        } finally {
            setSearching(false);
            setLoading(false);
        }
    };

    const handleToggleFavourite = async (e, restaurantId) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) return;
        setTogglingFav(restaurantId);
        try {
            if (favouriteIds.has(restaurantId)) {
                await removeFavourite(restaurantId);
                setFavouriteIds(prev => { const next = new Set(prev); next.delete(restaurantId); return next; });
            } else {
                await addFavourite(restaurantId);
                setFavouriteIds(prev => new Set(prev).add(restaurantId));
            }
        } catch { /* silent */ }
        finally { setTogglingFav(null); }
    };

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="home-hero">
                <motion.div
                    className="home-hero-content"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="hero-tag">
                        <span className="hero-tag-dot"></span>
                        {user
                            ? user.role === 'ADMIN'
                                ? adminGreeting
                                : user.role === 'RESTAURANT_OWNER'
                                    ? ownerGreeting
                                    : `Welcome back, ${user.firstName || 'foodie'}!`
                            : 'Now live in your city'}
                    </div>
                    <h1>
                        Food that <em>feels</em> like home
                    </h1>
                    <p>
                        Order from the best restaurants around you. Fast delivery, real flavors, zero compromise.
                    </p>
                    {/* Search Bar */}
                    <div className="home-search-bar">
                        <span className="home-search-icon">🔍</span>
                        <input
                            type="text"
                            className="home-search-input"
                            placeholder="Search restaurants by name..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button className="home-search-clear" onClick={() => setSearchQuery('')}>✕</button>
                        )}
                    </div>
                    <div className="hero-stats">
                        <div className="hero-stat">
                            <span className="hero-stat-num">1K+</span>
                            <span className="hero-stat-label">Restaurants</span>
                        </div>
                        <div className="hero-stat">
                            <span className="hero-stat-num">30m</span>
                            <span className="hero-stat-label">Avg Delivery</span>
                        </div>
                        <div className="hero-stat">
                            <span className="hero-stat-num">10K</span>
                            <span className="hero-stat-label">Happy Users</span>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Filters */}
            <section className="home-section">
                <div className="home-filters">
                    <div className="cuisine-pills">
                        {CUISINE_TYPES.map((type) => (
                            <motion.button
                                key={type}
                                className={`cuisine-pill ${selectedCuisine === type ? 'active' : ''}`}
                                onClick={() => setSelectedCuisine(type)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {type !== 'ALL' && <span className="pill-emoji">{cuisineEmoji[type]}</span>}
                                {type.charAt(0) + type.slice(1).toLowerCase()}
                            </motion.button>
                        ))}
                    </div>
                    <label className="open-toggle">
                        <input
                            type="checkbox"
                            checked={showOpenOnly}
                            onChange={(e) => setShowOpenOnly(e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                        <span className="toggle-label">Open now</span>
                    </label>
                </div>
            </section>

            {/* Restaurant Grid */}
            <section className="home-section">
                <div className="section-header">
                    <h2 className="section-title">
                        {searchQuery.trim()
                            ? `Results for "${searchQuery}"`
                            : selectedCuisine === 'ALL' ? 'Popular near you' : `${selectedCuisine.charAt(0) + selectedCuisine.slice(1).toLowerCase()} Restaurants`}
                    </h2>
                    <span className="section-count">
                        {!loading && `${restaurants.length} found`}
                    </span>
                </div>

                {error && (
                    <motion.div
                        className="home-error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        ⚠️ {error}
                    </motion.div>
                )}

                {loading ? (
                    <div className="home-grid">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="restaurant-card skeleton">
                                <div className="r-thumb-skeleton"></div>
                                <div className="r-body-skeleton">
                                    <div className="r-line-skeleton wide"></div>
                                    <div className="r-line-skeleton narrow"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : restaurants.length === 0 ? (
                    <motion.div
                        className="home-empty"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <span className="empty-icon">🍽️</span>
                        <h3>No restaurants found</h3>
                        <p>Try changing your filters or check back later.</p>
                    </motion.div>
                ) : (
                    <motion.div
                        className="home-grid"
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: {},
                            visible: { transition: { staggerChildren: 0.06 } }
                        }}
                    >
                        <AnimatePresence>
                            {restaurants.map((r) => (
                                <motion.div
                                    key={r.id}
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0 }
                                    }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    layout
                                >
                                    <Link to={`/restaurant/${r.id}`} className="restaurant-card-link">
                                        <div className="restaurant-card">
                                            <div className={`r-thumb ${r.open ? '' : 'closed'}`}>
                                                <span className="r-thumb-emoji">
                                                    {cuisineEmoji[r.cuisineType] || '🍽️'}
                                                </span>
                                                {!r.open && <span className="closed-badge">Closed</span>}
                                                {user && (
                                                    <button
                                                        className={`fav-btn ${favouriteIds.has(r.id) ? 'fav-active' : ''}`}
                                                        onClick={(e) => handleToggleFavourite(e, r.id)}
                                                        disabled={togglingFav === r.id}
                                                        title={favouriteIds.has(r.id) ? 'Remove from favourites' : 'Add to favourites'}
                                                    >
                                                        {favouriteIds.has(r.id) ? '❤️' : '🤍'}
                                                    </button>
                                                )}
                                            </div>
                                            <div className="r-body">
                                                <div className="r-name">{r.name}</div>
                                                <div className="r-meta">
                                                    {r.avgRating && (
                                                        <span className="r-rating">★ {Number(r.avgRating).toFixed(1)}</span>
                                                    )}
                                                    <span className="r-cuisine">
                                                        {r.cuisineType?.charAt(0) + r.cuisineType?.slice(1).toLowerCase()}
                                                    </span>
                                                    {r.address?.city && (
                                                        <span className="r-city">📍 {r.address.city}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </section>

            {/* Footer */}
            <footer className="home-footer">
                © 2026 Flocko · Built for learning, designed with care.
            </footer>
        </div>
    );
};

export default HomePage;

