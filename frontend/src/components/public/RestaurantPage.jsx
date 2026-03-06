import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getRestaurantById, getRestaurantMenu } from '../../api/publicService';
import { addToCart } from '../../api/cartService';
import { AuthContext } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import './RestaurantPage.css';

const RestaurantPage = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [restaurant, setRestaurant] = useState(null);
    const [menu, setMenu] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeCategory, setActiveCategory] = useState(null);
    const [addingToCart, setAddingToCart] = useState(null);
    const [cartMsg, setCartMsg] = useState('');
    const [selectedAddons, setSelectedAddons] = useState({});

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const [restaurantData, menuData] = await Promise.all([
                getRestaurantById(id),
                getRestaurantMenu(id)
            ]);
            setRestaurant(restaurantData);
            setMenu(menuData);
            if (menuData.categories?.length > 0) {
                setActiveCategory(menuData.categories[0].categoryId);
            }
        } catch (err) {
            setError('Unable to load restaurant details.');
        } finally {
            setLoading(false);
        }
    };

    const toggleAddon = (foodId, addonId) => {
        setSelectedAddons(prev => {
            const foodAddons = prev[foodId] || [];
            if (foodAddons.includes(addonId)) {
                return { ...prev, [foodId]: foodAddons.filter(id => id !== addonId) };
            }
            return { ...prev, [foodId]: [...foodAddons, addonId] };
        });
    };

    const handleAddToCart = async (foodId) => {
        if (!user) {
            navigate('/login');
            return;
        }
        setAddingToCart(foodId);
        setCartMsg('');
        try {
            const addonIds = selectedAddons[foodId] || [];
            await addToCart(foodId, 1, addonIds);
            setCartMsg(`Added to cart!`);
            setSelectedAddons(prev => ({ ...prev, [foodId]: [] }));
            setTimeout(() => setCartMsg(''), 2000);
        } catch (err) {
            setCartMsg(err.response?.data?.message || err.response?.data || 'Failed to add to cart.');
            setTimeout(() => setCartMsg(''), 3000);
        } finally {
            setAddingToCart(null);
        }
    };

    if (loading) {
        return (
            <div className="rp-page">
                <div className="rp-loading">
                    <motion.div
                        className="rp-loading-icon"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    >
                        🍽️
                    </motion.div>
                    <p>Loading restaurant...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rp-page">
                <div className="rp-error-container">
                    <span className="rp-error-icon">⚠️</span>
                    <h3>{error}</h3>
                    <Link to="/" className="rp-back-link">← Back to restaurants</Link>
                </div>
            </div>
        );
    }

    const cuisineEmoji = {
        INDIAN: '🍛', CHINESE: '🥡', ITALIAN: '🍕',
        MEXICAN: '🌮', CONTINENTAL: '🍽️', AMERICAN: '🍔',
    };

    const activeCategoryData = menu?.categories?.find(c => c.categoryId === activeCategory);

    return (
        <div className="rp-page">
            {/* Back Link */}
            <div className="rp-container">
                <Link to="/" className="rp-back-link">← All Restaurants</Link>
            </div>

            {/* Restaurant Header */}
            <motion.div
                className="rp-header"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="rp-container rp-header-inner">
                    <div className="rp-header-icon">
                        {cuisineEmoji[restaurant?.cuisineType] || '🍽️'}
                    </div>
                    <div className="rp-header-info">
                        <h1 className="rp-name">{restaurant?.name}</h1>
                        <div className="rp-meta-row">
                            <span className={`rp-status ${restaurant?.open ? 'open' : 'closed'}`}>
                                {restaurant?.open ? '● Open' : '● Closed'}
                            </span>
                            <span className="rp-cuisine">
                                {restaurant?.cuisineType?.charAt(0) + restaurant?.cuisineType?.slice(1).toLowerCase()}
                            </span>
                            {restaurant?.avgRating && (
                                <span className="rp-rating">★ {Number(restaurant.avgRating).toFixed(1)}</span>
                            )}
                            {restaurant?.address?.city && (
                                <span className="rp-city">📍 {restaurant.address.city}</span>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Menu */}
            {cartMsg && (
                <motion.div
                    className="rp-cart-toast"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                >
                    {cartMsg}
                </motion.div>
            )}
            <div className="rp-container rp-menu-layout">
                {/* Category Sidebar */}
                {menu?.categories?.length > 0 && (
                    <aside className="rp-sidebar">
                        <h3 className="rp-sidebar-title">Menu</h3>
                        {menu.categories.map((cat) => (
                            <motion.button
                                key={cat.categoryId}
                                className={`rp-cat-btn ${activeCategory === cat.categoryId ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat.categoryId)}
                                whileHover={{ x: 3 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                <span className="rp-cat-name">{cat.categoryName}</span>
                                <span className="rp-cat-count">{cat.foods?.length || 0}</span>
                            </motion.button>
                        ))}
                    </aside>
                )}

                {/* Food Items */}
                <main className="rp-menu-main">
                    <AnimatePresence mode="wait">
                        {activeCategoryData ? (
                            <motion.div
                                key={activeCategory}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="rp-category-header">
                                    <h2 className="rp-category-title">{activeCategoryData.categoryName}</h2>
                                    {activeCategoryData.description && (
                                        <p className="rp-category-desc">{activeCategoryData.description}</p>
                                    )}
                                </div>

                                {activeCategoryData.foods?.length > 0 ? (
                                    <div className="rp-food-grid">
                                        {activeCategoryData.foods.map((food) => (
                                            <motion.div
                                                key={food.foodId}
                                                className="rp-food-card"
                                                whileHover={{ y: -2, boxShadow: '0 6px 20px rgba(0,0,0,0.06)' }}
                                            >
                                                <div className="rp-food-body">
                                                    <div className="rp-food-badges">
                                                        {food.vegetarian && (
                                                            <span className="rp-veg-badge">🟢 Veg</span>
                                                        )}
                                                        {!food.available && (
                                                            <span className="rp-unavailable-badge">Unavailable</span>
                                                        )}
                                                    </div>
                                                    <h3 className="rp-food-name">{food.foodName}</h3>
                                                    {food.foodDescription && (
                                                        <p className="rp-food-desc">{food.foodDescription}</p>
                                                    )}
                                                    <div className="rp-food-price">₹{Number(food.foodPrice).toFixed(0)}</div>

                                                    {/* Addon selection for this food */}
                                                    {activeCategoryData.availableAddons?.length > 0 && (
                                                        <div className="rp-food-addon-select">
                                                            {activeCategoryData.availableAddons
                                                                .filter(a => a.available !== false)
                                                                .map(addon => (
                                                                    <label key={addon.addonId} className="rp-food-addon-label">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={(selectedAddons[food.foodId] || []).includes(addon.addonId)}
                                                                            onChange={() => toggleAddon(food.foodId, addon.addonId)}
                                                                        />
                                                                        <span>{addon.addonName} (+₹{Number(addon.price).toFixed(0)})</span>
                                                                    </label>
                                                                ))}
                                                        </div>
                                                    )}

                                                    {food.available !== false && (
                                                        <button
                                                            className="rp-add-to-cart-btn"
                                                            onClick={() => handleAddToCart(food.foodId)}
                                                            disabled={addingToCart === food.foodId}
                                                        >
                                                            {addingToCart === food.foodId ? 'Adding...' : '+ Add to Cart'}
                                                        </button>
                                                    )}
                                                </div>
                                                {food.images?.length > 0 && (
                                                    <div className="rp-food-img">
                                                        <img src={food.images[0]} alt={food.foodName} />
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rp-empty-cat">
                                        <p>No items in this category yet.</p>
                                    </div>
                                )}

                                {/* Addons */}
                                {activeCategoryData.availableAddons?.length > 0 && (
                                    <div className="rp-addons-section">
                                        <h3 className="rp-addons-title">Available Add-ons</h3>
                                        <div className="rp-addons-list">
                                            {activeCategoryData.availableAddons.map((addon) => (
                                                <div key={addon.addonId} className="rp-addon-chip">
                                                    <span className="rp-addon-name">{addon.addonName}</span>
                                                    <span className="rp-addon-price">+₹{Number(addon.price).toFixed(0)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <div className="rp-empty-cat">
                                <span style={{ fontSize: '2.5rem' }}>📋</span>
                                <p>Select a category to view items.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default RestaurantPage;

