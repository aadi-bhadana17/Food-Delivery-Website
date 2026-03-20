import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getRestaurantById, getRestaurantMenu } from '../../api/publicService';
import { getMessPlans, getMessPlanById } from '../../api/restaurantService';
import { addToCart } from '../../api/cartService';
import { getFavourites, addFavourite, removeFavourite, subscribeToMessPlan } from '../../api/userService';
import { AuthContext } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';
import { motion, AnimatePresence } from 'framer-motion';
import './RestaurantPage.css';

const DAY_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const MEAL_TYPES = ['BREAKFAST', 'LUNCH', 'DINNER'];

const normalizeMessPlansPayload = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.content)) return payload.content;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.messPlans)) return payload.messPlans;
    return [];
};

const formatEnum = (value) => value
    ?.toLowerCase()
    .split('_')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');

const summarizePlan = (plan) => {
    const slots = plan?.slots || [];
    const days = new Set(slots.map(slot => slot.dayOfWeek)).size;
    const meals = new Set(slots.map(slot => slot.mealType)).size;
    return `${days || 0} days · ${meals || 0} meal types · ${slots.length} slots`;
};

const groupSlotsByDay = (plan) => {
    const grouped = new Map();
    DAY_OF_WEEK.forEach(day => grouped.set(day, new Map()));

    (plan?.slots || []).forEach(slot => {
        const dayMap = grouped.get(slot.dayOfWeek) || new Map();
        dayMap.set(slot.mealType, slot.foodItems || []);
        grouped.set(slot.dayOfWeek, dayMap);
    });

    return DAY_OF_WEEK
        .map(day => ({
            day,
            meals: MEAL_TYPES
                .filter(meal => grouped.get(day)?.has(meal))
                .map(meal => ({ mealType: meal, foods: grouped.get(day).get(meal) || [] })),
        }))
        .filter(section => section.meals.length > 0);
};

const getFoodName = (food) => food?.foodName || food?.name || `Food #${food?.foodId ?? food?.id}`;

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
    const [isFavourite, setIsFavourite] = useState(false);
    const [togglingFav, setTogglingFav] = useState(false);
    const [messPlans, setMessPlans] = useState([]);
    const [messLoading, setMessLoading] = useState(false);
    const [messError, setMessError] = useState('');
    const [subscribingPlanId, setSubscribingPlanId] = useState(null);
    const [messToast, setMessToast] = useState('');
    const [selectedMessPlanId, setSelectedMessPlanId] = useState(null);
    const [selectedMessPlan, setSelectedMessPlan] = useState(null);
    const [messDetailLoading, setMessDetailLoading] = useState(false);
    const [messDetailError, setMessDetailError] = useState('');

    useEffect(() => {
        fetchData();
    }, [id]);

    useEffect(() => {
        if (user) {
            getFavourites()
                .then(favs => setIsFavourite(favs.some(f => f.restaurantId === parseInt(id))))
                .catch(() => {});
        }
    }, [user, id]);

    const fetchData = async () => {
        setLoading(true);
        setMessLoading(true);
        setError('');
        setMessError('');
        setSelectedMessPlanId(null);
        setSelectedMessPlan(null);
        setMessDetailError('');
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

            try {
                const messPlanData = await getMessPlans(id);
                setMessPlans(normalizeMessPlansPayload(messPlanData));
            } catch {
                setMessPlans([]);
            }
        } catch (err) {
            setError('Unable to load restaurant details.');
        } finally {
            setLoading(false);
            setMessLoading(false);
        }
    };

    const handleSubscribe = async (messPlanId) => {
        if (!user) {
            navigate('/login');
            return;
        }
        setMessError('');
        setSubscribingPlanId(messPlanId);
        try {
            const responseMessage = await subscribeToMessPlan(messPlanId);
            setMessToast(typeof responseMessage === 'string' ? responseMessage : 'Subscribed to mess plan.');
            setTimeout(() => setMessToast(''), 3000);
        } catch (err) {
            setMessError(err.response?.data?.message || err.response?.data || 'Failed to subscribe to this plan.');
        } finally {
            setSubscribingPlanId(null);
        }
    };

    const handleViewMessPlan = async (messPlanId) => {
        if (selectedMessPlanId === messPlanId) {
            setSelectedMessPlanId(null);
            setSelectedMessPlan(null);
            setMessDetailError('');
            return;
        }

        setSelectedMessPlanId(messPlanId);
        setMessDetailLoading(true);
        setMessDetailError('');
        try {
            const fullPlan = await getMessPlanById(id, messPlanId);
            setSelectedMessPlan(fullPlan);
        } catch (err) {
            setSelectedMessPlan(null);
            setMessDetailError(err.response?.data?.message || err.response?.data || 'Unable to load mess plan details.');
        } finally {
            setMessDetailLoading(false);
        }
    };

    const handleToggleFavourite = async () => {
        if (!user) return;
        setTogglingFav(true);
        try {
            if (isFavourite) {
                await removeFavourite(parseInt(id));
                setIsFavourite(false);
            } else {
                await addFavourite(parseInt(id));
                setIsFavourite(true);
            }
        } catch { /* silent */ }
        finally { setTogglingFav(false); }
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
    const availableMessPlans = messPlans.filter(plan => (typeof plan?.active === 'boolean' ? plan.active : plan?.isActive !== false));

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
                    {user && (
                        <button
                            className={`rp-fav-btn ${isFavourite ? 'rp-fav-active' : ''}`}
                            onClick={handleToggleFavourite}
                            disabled={togglingFav}
                        >
                            {isFavourite ? '❤️ Saved' : '🤍 Save'}
                        </button>
                    )}
                </div>
            </motion.div>

            <div className="rp-container rp-mess-wrap">
                <div className="rp-mess-header">
                    <h2 className="rp-mess-title">Mess Plans</h2>
                    <span className="rp-mess-sub">Subscribe and get recurring meals from this restaurant</span>
                </div>

                {messToast && <div className="rp-mess-toast">{messToast}</div>}
                {messError && <div className="rp-mess-error">{messError}</div>}

                {messLoading ? (
                    <div className="rp-mess-empty">Loading mess plans...</div>
                ) : availableMessPlans.length === 0 ? (
                    <div className="rp-mess-empty">No active mess plans available for this restaurant.</div>
                ) : (
                    <div className="rp-mess-grid">
                        {availableMessPlans.map((plan) => (
                            <button
                                key={plan.messPlanId}
                                type="button"
                                className={`rp-mess-card rp-mess-card-button ${selectedMessPlanId === plan.messPlanId ? 'active' : ''}`}
                                onClick={() => handleViewMessPlan(plan.messPlanId)}
                            >
                                <div className="rp-mess-row">
                                    <h3 className="rp-mess-name">{plan.messPlanName}</h3>
                                    <span className="rp-mess-price">₹{Number(plan.price || 0).toFixed(0)}</span>
                                </div>
                                {plan.messPlanDescription && (
                                    <p className="rp-mess-desc">{plan.messPlanDescription}</p>
                                )}
                                <div className="rp-mess-meta">{summarizePlan(plan)}</div>
                                <div className="rp-mess-note">Click to view details</div>
                            </button>
                        ))}
                    </div>
                )}

                {selectedMessPlanId && (
                    <div className="rp-mess-detail-wrap">
                        {messDetailLoading ? (
                            <div className="rp-mess-empty">Loading plan details...</div>
                        ) : messDetailError ? (
                            <div className="rp-mess-error">{messDetailError}</div>
                        ) : selectedMessPlan ? (
                            <div className="rp-mess-detail-card">
                                <div className="rp-mess-row">
                                    <h3 className="rp-mess-name">{selectedMessPlan.messPlanName}</h3>
                                    <span className="rp-mess-price">₹{Number(selectedMessPlan.price || 0).toFixed(0)}</span>
                                </div>
                                {selectedMessPlan.messPlanDescription && (
                                    <p className="rp-mess-desc">{selectedMessPlan.messPlanDescription}</p>
                                )}

                                <div className="rp-mess-day-list">
                                    {groupSlotsByDay(selectedMessPlan).map(section => (
                                        <div key={section.day} className="rp-mess-day-section">
                                            <div className="rp-mess-day-title">{formatEnum(section.day)}</div>
                                            {section.meals.map(meal => (
                                                <div key={`${section.day}-${meal.mealType}`} className="rp-mess-meal-block">
                                                    <div className="rp-mess-meal-title">{formatEnum(meal.mealType)}</div>
                                                    <div className="rp-mess-food-chips">
                                                        {meal.foods.map(food => (
                                                            <span key={food.foodId ?? food.id} className="rp-mess-food-chip">
                                                                {getFoodName(food)}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>

                                {user?.role === ROLES.CUSTOMER ? (
                                    <button
                                        className="rp-mess-subscribe"
                                        onClick={() => handleSubscribe(selectedMessPlan.messPlanId)}
                                        disabled={subscribingPlanId === selectedMessPlan.messPlanId}
                                    >
                                        {subscribingPlanId === selectedMessPlan.messPlanId ? 'Subscribing...' : 'Subscribe'}
                                    </button>
                                ) : (
                                    <div className="rp-mess-note">Login as customer to subscribe.</div>
                                )}
                            </div>
                        ) : null}
                    </div>
                )}
            </div>

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

