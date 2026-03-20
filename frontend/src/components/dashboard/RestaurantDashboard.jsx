import React, { useState, useEffect } from 'react';
import {
    getMyRestaurants, createRestaurant, updateRestaurant, updateRestaurantStatus,
    getRestaurantStaff, addRestaurantStaff,
    getCategories, createCategory, updateCategory, deleteCategory,
    getFoods, createFood, updateFood, updateFoodStatus, deleteFood,
    getAddons, createAddon, updateAddon, updateAddonAvailability, deleteAddon,
    getMessPlans, createMessPlan, getMessPlanById, updateMessPlan, deleteMessPlan,
} from '../../api/restaurantService';
import { getRestaurantOrders, updateOrderStatus } from '../../api/orderService';
import { updateKitchenStatus } from '../../api/kitchenService';
import { motion, AnimatePresence } from 'framer-motion';
import './RestaurantDashboard.css';

const CUISINE_TYPES = ['INDIAN', 'CHINESE', 'ITALIAN', 'MEXICAN', 'CONTINENTAL', 'AMERICAN'];
const DAY_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const MEAL_TYPES = ['BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER'];
const TABS = ['restaurant', 'staff', 'orders', 'kitchen', 'categories', 'foods', 'addons', 'messPlans'];
const TAB_LABELS = {
    restaurant: '🏪 Restaurant',
    staff: '👥 Staff',
    orders: '📦 Orders',
    kitchen: '👨‍🍳 Kitchen',
    categories: '📂 Categories',
    foods: '🍕 Foods',
    addons: '🧩 Addons',
    messPlans: '📅 Mess Plans'
};

const normalizeMessPlan = (plan) => ({
    ...plan,
    active: typeof plan?.active === 'boolean' ? plan.active : !!plan?.isActive,
});

const normalizeMessPlansPayload = (payload) => {
    if (Array.isArray(payload)) return payload.map(normalizeMessPlan);
    if (Array.isArray(payload?.content)) return payload.content.map(normalizeMessPlan);
    if (Array.isArray(payload?.data)) return payload.data.map(normalizeMessPlan);
    if (Array.isArray(payload?.messPlans)) return payload.messPlans.map(normalizeMessPlan);
    return [];
};

const RestaurantDashboard = () => {
    const [activeTab, setActiveTab] = useState('restaurant');
    const [restaurant, setRestaurant] = useState(null);
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Sub-state
    const [categories, setCategories] = useState([]);
    const [foods, setFoods] = useState([]);
    const [addons, setAddons] = useState([]);
    const [orders, setOrders] = useState([]);
    const [messPlans, setMessPlans] = useState([]);
    const [staffMembers, setStaffMembers] = useState([]);
    const [createdStaff, setCreatedStaff] = useState(null);
    const [kitchenLoadIndicator, setKitchenLoadIndicator] = useState('MEDIUM');
    const [kitchenBusy, setKitchenBusy] = useState(false);
    const [kitchenResponse, setKitchenResponse] = useState(null);

    // Forms
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);

    useEffect(() => { fetchRestaurants(); }, []);

    useEffect(() => {
        if (restaurant) {
            if (activeTab === 'staff') fetchStaff();
            if (activeTab === 'categories') fetchCategories();
            if (activeTab === 'foods') fetchFoods();
            if (activeTab === 'addons') fetchAddons();
            if (activeTab === 'messPlans') {
                fetchFoods();
                fetchMessPlans();
            }
        }
        if (activeTab === 'orders') fetchOrders();
    }, [activeTab, restaurant]);

    const flash = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 2500); };
    const flashError = (err) => {
        const msg = err.response?.data?.message || err.response?.data || 'Something went wrong.';
        setError(typeof msg === 'string' ? msg : 'Something went wrong.');
        setTimeout(() => setError(''), 4000);
    };

    // ── Restaurant ──
    const fetchRestaurants = async () => {
        setLoading(true);
        try {
            const data = await getMyRestaurants();
            setRestaurants(data);
            if (data.length > 0) setRestaurant(data[0]);
        } catch (e) { flashError(e); }
        finally { setLoading(false); }
    };

    // ── Categories ──
    const fetchCategories = async () => {
        try { setCategories(await getCategories(restaurant.restaurantId)); }
        catch (e) { flashError(e); }
    };

    // ── Foods ──
    const fetchFoods = async () => {
        try { setFoods(await getFoods(restaurant.restaurantId)); }
        catch (e) { flashError(e); }
    };

    // ── Addons ──
    const fetchAddons = async () => {
        try { setAddons(await getAddons(restaurant.restaurantId)); }
        catch (e) { flashError(e); }
    };

    // ── Orders ──
    const fetchOrders = async () => {
        try { setOrders(await getRestaurantOrders()); }
        catch (e) { flashError(e); }
    };

    // ── Staff ──
    const fetchStaff = async () => {
        if (!restaurant) return;
        try { setStaffMembers(await getRestaurantStaff(restaurant.restaurantId)); }
        catch (e) { flashError(e); }
    };

    // ── Mess Plans ──
    const fetchMessPlans = async () => {
        if (!restaurant) return;
        try {
            const payload = await getMessPlans(restaurant.restaurantId);
            setMessPlans(normalizeMessPlansPayload(payload));
        }
        catch (e) { flashError(e); }
    };

    // ═══════════════════════════════════════
    //  RESTAURANT TAB
    // ═══════════════════════════════════════
    const RestaurantTab = () => {
        const empty = {
            restaurantName: '', restaurantDescription: '', cuisineType: 'INDIAN',
            address: { buildingNo: '', street: '', city: '', state: '', pincode: '', landmark: '' },
            contactInformation: { email: '', mobile: '', instagram: '', facebook: '', twitter: '' },
            openingTime: '09:00', closingTime: '22:00',
        };
        const [form, setForm] = useState(editing ? {
            restaurantName: editing.restaurantName || '',
            restaurantDescription: editing.restaurantDescription || '',
            cuisineType: editing.cuisineType || 'INDIAN',
            address: editing.address || empty.address,
            contactInformation: editing.contactInformation || empty.contactInformation,
            openingTime: editing.openingTime || '09:00',
            closingTime: editing.closingTime || '22:00',
        } : empty);
        const [saving, setSaving] = useState(false);

        const handleSave = async (e) => {
            e.preventDefault();
            setSaving(true);
            try {
                if (editing) {
                    const updated = await updateRestaurant(editing.restaurantId, form);
                    setRestaurant(updated);
                    flash('Restaurant updated!');
                } else {
                    const created = await createRestaurant(form);
                    setRestaurant(created);
                    setRestaurants(prev => [...prev, created]);
                    flash('Restaurant created!');
                }
                setShowForm(false);
                setEditing(null);
                fetchRestaurants();
            } catch (e) { flashError(e); }
            finally { setSaving(false); }
        };

        const handleToggleStatus = async () => {
            try {
                const updated = await updateRestaurantStatus(restaurant.restaurantId, !restaurant.open);
                setRestaurant(updated);
                flash(updated.open ? 'Restaurant is now Open!' : 'Restaurant is now Closed.');
            } catch (e) { flashError(e); }
        };

        if (showForm) {
            return (
                <form className="rd-form" onSubmit={handleSave}>
                    <h3 className="rd-form-title">{editing ? 'Edit Restaurant' : 'Create Restaurant'}</h3>
                    <input placeholder="Restaurant Name" value={form.restaurantName} onChange={e => setForm({ ...form, restaurantName: e.target.value })} required />
                    <textarea placeholder="Description" value={form.restaurantDescription} onChange={e => setForm({ ...form, restaurantDescription: e.target.value })} required />
                    <select value={form.cuisineType} onChange={e => setForm({ ...form, cuisineType: e.target.value })}>
                        {CUISINE_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                    <h4 className="rd-form-section">Address</h4>
                    <div className="rd-form-row">
                        <input placeholder="Building No" value={form.address.buildingNo} onChange={e => setForm({ ...form, address: { ...form.address, buildingNo: e.target.value } })} required />
                        <input placeholder="Street" value={form.address.street} onChange={e => setForm({ ...form, address: { ...form.address, street: e.target.value } })} required />
                    </div>
                    <div className="rd-form-row">
                        <input placeholder="City" value={form.address.city} onChange={e => setForm({ ...form, address: { ...form.address, city: e.target.value } })} required />
                        <input placeholder="State" value={form.address.state} onChange={e => setForm({ ...form, address: { ...form.address, state: e.target.value } })} required />
                    </div>
                    <div className="rd-form-row">
                        <input placeholder="Pincode" value={form.address.pincode} onChange={e => setForm({ ...form, address: { ...form.address, pincode: e.target.value } })} required />
                        <input placeholder="Landmark (optional)" value={form.address.landmark} onChange={e => setForm({ ...form, address: { ...form.address, landmark: e.target.value } })} />
                    </div>

                    <h4 className="rd-form-section">Contact</h4>
                    <div className="rd-form-row">
                        <input type="email" placeholder="Email" value={form.contactInformation.email} onChange={e => setForm({ ...form, contactInformation: { ...form.contactInformation, email: e.target.value } })} required />
                        <input placeholder="Mobile" value={form.contactInformation.mobile} onChange={e => setForm({ ...form, contactInformation: { ...form.contactInformation, mobile: e.target.value } })} required />
                    </div>

                    <h4 className="rd-form-section">Timings</h4>
                    <div className="rd-form-row">
                        <input type="time" value={form.openingTime} onChange={e => setForm({ ...form, openingTime: e.target.value })} required />
                        <input type="time" value={form.closingTime} onChange={e => setForm({ ...form, closingTime: e.target.value })} required />
                    </div>

                    <div className="rd-form-actions">
                        <button type="submit" className="rd-btn rd-btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                        <button type="button" className="rd-btn rd-btn-outline" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</button>
                    </div>
                </form>
            );
        }

        if (!restaurant) {
            return (
                <div className="rd-empty">
                    <span className="rd-empty-icon">🏪</span>
                    <h3>No restaurant yet</h3>
                    <p>Create your restaurant to get started.</p>
                    <button className="rd-btn rd-btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>+ Create Restaurant</button>
                </div>
            );
        }

        return (
            <div className="rd-restaurant-info">
                <div className="rd-restaurant-header">
                    <div>
                        <h2 className="rd-restaurant-name">{restaurant.restaurantName}</h2>
                        <span className="rd-restaurant-cuisine">{restaurant.cuisineType}</span>
                    </div>
                    <div className="rd-restaurant-actions">
                        <button className={`rd-status-toggle ${restaurant.open ? 'open' : 'closed'}`} onClick={handleToggleStatus}>
                            {restaurant.open ? '● Open' : '● Closed'}
                        </button>
                        <button className="rd-btn rd-btn-outline" onClick={() => { setEditing(restaurant); setShowForm(true); }}>✏️ Edit</button>
                    </div>
                </div>
                <div className="rd-detail-grid">
                    <div className="rd-detail-card">
                        <h4>📍 Address</h4>
                        <p>{restaurant.address?.buildingNo}, {restaurant.address?.street}</p>
                        <p>{restaurant.address?.city}, {restaurant.address?.state} - {restaurant.address?.pincode}</p>
                    </div>
                    <div className="rd-detail-card">
                        <h4>📞 Contact</h4>
                        <p>{restaurant.contactInformation?.email}</p>
                        <p>{restaurant.contactInformation?.mobile}</p>
                    </div>
                    <div className="rd-detail-card">
                        <h4>🕐 Timings</h4>
                        <p>{restaurant.openingTime} – {restaurant.closingTime}</p>
                    </div>
                </div>
            </div>
        );
    };

    // ═══════════════════════════════════════
    //  CATEGORIES TAB
    // ═══════════════════════════════════════
    const CategoriesTab = () => {
        const empty = { categoryName: '', description: '', displayOrder: 1 };
        const [form, setForm] = useState(empty);
        const [editId, setEditId] = useState(null);
        const [saving, setSaving] = useState(false);

        const handleSave = async (e) => {
            e.preventDefault();
            setSaving(true);
            try {
                if (editId) {
                    await updateCategory(restaurant.restaurantId, editId, form);
                    flash('Category updated!');
                } else {
                    await createCategory(restaurant.restaurantId, form);
                    flash('Category created!');
                }
                setForm(empty);
                setEditId(null);
                setShowForm(false);
                fetchCategories();
            } catch (e) { flashError(e); }
            finally { setSaving(false); }
        };

        const handleDelete = async (id) => {
            if (!window.confirm('Delete this category?')) return;
            try { await deleteCategory(restaurant.restaurantId, id); flash('Category deleted.'); fetchCategories(); }
            catch (e) { flashError(e); }
        };

        const startEdit = (cat) => {
            setEditId(cat.categoryId);
            setForm({ categoryName: cat.categoryName, description: cat.description, displayOrder: cat.displayOrder });
            setShowForm(true);
        };

        return (
            <div>
                <div className="rd-tab-header">
                    <h3>Categories ({categories.length})</h3>
                    {!showForm && <button className="rd-btn rd-btn-primary" onClick={() => { setEditId(null); setForm(empty); setShowForm(true); }}>+ Add Category</button>}
                </div>

                <AnimatePresence>
                    {showForm && (
                        <motion.form className="rd-inline-form" onSubmit={handleSave} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                            <input placeholder="Category Name" value={form.categoryName} onChange={e => setForm({ ...form, categoryName: e.target.value })} required />
                            <input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
                            <input type="number" placeholder="Display Order" min="1" value={form.displayOrder} onChange={e => setForm({ ...form, displayOrder: parseInt(e.target.value) || 1 })} required />
                            <div className="rd-form-actions">
                                <button type="submit" className="rd-btn rd-btn-primary" disabled={saving}>{saving ? 'Saving...' : (editId ? 'Update' : 'Create')}</button>
                                <button type="button" className="rd-btn rd-btn-outline" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>

                {categories.length === 0 && !showForm ? (
                    <div className="rd-empty-small"><p>No categories yet. Add one to get started.</p></div>
                ) : (
                    <div className="rd-card-grid">
                        {categories.map(cat => (
                            <div key={cat.categoryId} className="rd-entity-card">
                                <div className="rd-entity-content">
                                    <span className="rd-list-name">{cat.categoryName}</span>
                                    <span className="rd-list-sub">{cat.description} · Order: {cat.displayOrder}</span>
                                    {cat.addons?.length > 0 && (
                                        <div className="rd-list-tags">
                                            {cat.addons.map(a => <span key={a.addonId} className="rd-tag">{a.addonName}</span>)}
                                        </div>
                                    )}
                                </div>
                                <div className="rd-list-actions">
                                    <button className="rd-icon-btn" onClick={() => startEdit(cat)} title="Edit">✏️</button>
                                    <button className="rd-icon-btn danger" onClick={() => handleDelete(cat.categoryId)} title="Delete">🗑️</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // ═══════════════════════════════════════
    //  FOODS TAB
    // ═══════════════════════════════════════
    const FoodsTab = () => {
        const empty = { foodName: '', foodDescription: '', foodPrice: '', categoryId: '', vegetarian: false, available: true, images: [''] };
        const [form, setForm] = useState(empty);
        const [editId, setEditId] = useState(null);
        const [saving, setSaving] = useState(false);
        const [catList, setCatList] = useState([]);

        useEffect(() => {
            if (restaurant) getCategories(restaurant.restaurantId).then(setCatList).catch(() => {});
        }, [restaurant]);

        const handleSave = async (e) => {
            e.preventDefault();
            setSaving(true);
            const payload = { ...form, foodPrice: parseFloat(form.foodPrice), categoryId: parseInt(form.categoryId), images: form.images.filter(i => i.trim()) };
            try {
                if (editId) {
                    await updateFood(restaurant.restaurantId, editId, payload);
                    flash('Food updated!');
                } else {
                    await createFood(restaurant.restaurantId, payload);
                    flash('Food created!');
                }
                setForm(empty);
                setEditId(null);
                setShowForm(false);
                fetchFoods();
            } catch (e) { flashError(e); }
            finally { setSaving(false); }
        };

        const handleToggle = async (food) => {
            try { await updateFoodStatus(restaurant.restaurantId, food.id, !food.available); flash(`${food.name} is now ${!food.available ? 'available' : 'unavailable'}.`); fetchFoods(); }
            catch (e) { flashError(e); }
        };

        const handleDelete = async (id) => {
            if (!window.confirm('Delete this food item?')) return;
            try { await deleteFood(restaurant.restaurantId, id); flash('Food deleted.'); fetchFoods(); }
            catch (e) { flashError(e); }
        };

        const startEdit = (food) => {
            setEditId(food.id);
            setForm({
                foodName: food.name, foodDescription: food.description,
                foodPrice: food.price?.toString() || '', categoryId: food.category?.categoryId?.toString() || '',
                vegetarian: food.vegetarian, available: food.available, images: food.images?.length ? food.images : [''],
            });
            setShowForm(true);
        };

        return (
            <div>
                <div className="rd-tab-header">
                    <h3>Foods ({foods.length})</h3>
                    {!showForm && <button className="rd-btn rd-btn-primary" onClick={() => { setEditId(null); setForm(empty); setShowForm(true); }}>+ Add Food</button>}
                </div>

                <AnimatePresence>
                    {showForm && (
                        <motion.form className="rd-inline-form" onSubmit={handleSave} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                            <input placeholder="Food Name" value={form.foodName} onChange={e => setForm({ ...form, foodName: e.target.value })} required />
                            <textarea placeholder="Description" value={form.foodDescription} onChange={e => setForm({ ...form, foodDescription: e.target.value })} required />
                            <div className="rd-form-row">
                                <input type="number" step="0.01" min="1" placeholder="Price (₹)" value={form.foodPrice} onChange={e => setForm({ ...form, foodPrice: e.target.value })} required />
                                <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} required>
                                    <option value="">Select Category</option>
                                    {catList.map(c => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
                                </select>
                            </div>
                            <div className="rd-form-row">
                                <label className="rd-checkbox"><input type="checkbox" checked={form.vegetarian} onChange={e => setForm({ ...form, vegetarian: e.target.checked })} /> Vegetarian</label>
                                <label className="rd-checkbox"><input type="checkbox" checked={form.available} onChange={e => setForm({ ...form, available: e.target.checked })} /> Available</label>
                            </div>
                            <input placeholder="Image URL" value={form.images[0]} onChange={e => setForm({ ...form, images: [e.target.value] })} required />
                            <div className="rd-form-actions">
                                <button type="submit" className="rd-btn rd-btn-primary" disabled={saving}>{saving ? 'Saving...' : (editId ? 'Update' : 'Create')}</button>
                                <button type="button" className="rd-btn rd-btn-outline" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>

                {foods.length === 0 && !showForm ? (
                    <div className="rd-empty-small"><p>No food items yet. Add one to get started.</p></div>
                ) : (
                    <div className="rd-card-grid">
                        {foods.map(food => (
                            <div key={food.id} className="rd-entity-card rd-food-card">
                                <div className="rd-food-image-wrap">
                                    <img
                                        src={food.images?.[0] || '/vite.svg'}
                                        alt={food.name}
                                        className="rd-food-image"
                                    />
                                </div>
                                <div className="rd-entity-content">
                                    <div className="rd-food-title-row">
                                        <span className="rd-list-name">
                                            {food.vegetarian && <span className="rd-veg">🟢</span>}
                                            {food.name}
                                        </span>
                                        <span className="rd-food-price">₹{Number(food.price).toFixed(0)}</span>
                                    </div>
                                    <span className="rd-list-sub">{food.description}</span>
                                    <span className="rd-list-sub">Category: {food.category?.categoryName || '—'}</span>
                                </div>
                                <div className="rd-list-actions">
                                    <button className={`rd-avail-toggle ${food.available ? 'on' : 'off'}`} onClick={() => handleToggle(food)}>
                                        {food.available ? 'Available' : 'Unavailable'}
                                    </button>
                                    <button className="rd-icon-btn" onClick={() => startEdit(food)} title="Edit">✏️</button>
                                    <button className="rd-icon-btn danger" onClick={() => handleDelete(food.id)} title="Delete">🗑️</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // ═══════════════════════════════════════
    //  ADDONS TAB
    // ═══════════════════════════════════════
    const AddonsTab = () => {
        const empty = { addonName: '', price: '', available: true, categoryIds: [] };
        const [form, setForm] = useState(empty);
        const [editId, setEditId] = useState(null);
        const [saving, setSaving] = useState(false);
        const [catList, setCatList] = useState([]);

        useEffect(() => {
            if (restaurant) getCategories(restaurant.restaurantId).then(setCatList).catch(() => {});
        }, [restaurant]);

        const toggleCat = (catId) => {
            setForm(prev => ({
                ...prev,
                categoryIds: prev.categoryIds.includes(catId)
                    ? prev.categoryIds.filter(id => id !== catId)
                    : [...prev.categoryIds, catId]
            }));
        };

        const handleSave = async (e) => {
            e.preventDefault();
            setSaving(true);
            const payload = { ...form, price: parseFloat(form.price) };
            try {
                if (editId) {
                    await updateAddon(restaurant.restaurantId, editId, payload);
                    flash('Addon updated!');
                } else {
                    await createAddon(restaurant.restaurantId, payload);
                    flash('Addon created!');
                }
                setForm(empty);
                setEditId(null);
                setShowForm(false);
                fetchAddons();
            } catch (e) { flashError(e); }
            finally { setSaving(false); }
        };

        const handleToggle = async (addon) => {
            try { await updateAddonAvailability(restaurant.restaurantId, addon.addonId, !addon.available); flash(`${addon.addonName} is now ${!addon.available ? 'available' : 'unavailable'}.`); fetchAddons(); }
            catch (e) { flashError(e); }
        };

        const handleDelete = async (id) => {
            if (!window.confirm('Delete this addon?')) return;
            try { await deleteAddon(restaurant.restaurantId, id); flash('Addon deleted.'); fetchAddons(); }
            catch (e) { flashError(e); }
        };

        const startEdit = (addon) => {
            setEditId(addon.addonId);
            setForm({
                addonName: addon.addonName,
                price: addon.price?.toString() || '',
                available: addon.available,
                categoryIds: addon.categories?.map(c => c.categoryId) || [],
            });
            setShowForm(true);
        };

        return (
            <div>
                <div className="rd-tab-header">
                    <h3>Addons ({addons.length})</h3>
                    {!showForm && <button className="rd-btn rd-btn-primary" onClick={() => { setEditId(null); setForm(empty); setShowForm(true); }}>+ Add Addon</button>}
                </div>

                <AnimatePresence>
                    {showForm && (
                        <motion.form className="rd-inline-form" onSubmit={handleSave} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                            <input placeholder="Addon Name" value={form.addonName} onChange={e => setForm({ ...form, addonName: e.target.value })} required />
                            <input type="number" step="0.01" min="0" placeholder="Price (₹)" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                            <label className="rd-checkbox"><input type="checkbox" checked={form.available} onChange={e => setForm({ ...form, available: e.target.checked })} /> Available</label>
                            {catList.length > 0 && (
                                <div className="rd-cat-checkboxes">
                                    <span className="rd-cat-label">Assign to categories:</span>
                                    {catList.map(c => (
                                        <label key={c.categoryId} className="rd-checkbox">
                                            <input type="checkbox" checked={form.categoryIds.includes(c.categoryId)} onChange={() => toggleCat(c.categoryId)} />
                                            {c.categoryName}
                                        </label>
                                    ))}
                                </div>
                            )}
                            <div className="rd-form-actions">
                                <button type="submit" className="rd-btn rd-btn-primary" disabled={saving}>{saving ? 'Saving...' : (editId ? 'Update' : 'Create')}</button>
                                <button type="button" className="rd-btn rd-btn-outline" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>

                {addons.length === 0 && !showForm ? (
                    <div className="rd-empty-small"><p>No addons yet. Add one to get started.</p></div>
                ) : (
                    <div className="rd-card-grid">
                        {addons.map(addon => (
                            <div key={addon.addonId} className="rd-entity-card">
                                <div className="rd-entity-content">
                                    <div className="rd-food-title-row">
                                        <span className="rd-list-name">{addon.addonName}</span>
                                        <span className="rd-food-price">₹{Number(addon.price).toFixed(0)}</span>
                                    </div>
                                    {addon.categories?.length > 0 && (
                                        <div className="rd-list-tags">
                                            {addon.categories.map(c => <span key={c.categoryId} className="rd-tag">{c.categoryName}</span>)}
                                        </div>
                                    )}
                                </div>
                                <div className="rd-list-actions">
                                    <button className={`rd-avail-toggle ${addon.available ? 'on' : 'off'}`} onClick={() => handleToggle(addon)}>
                                        {addon.available ? 'Available' : 'Unavailable'}
                                    </button>
                                    <button className="rd-icon-btn" onClick={() => startEdit(addon)} title="Edit">✏️</button>
                                    <button className="rd-icon-btn danger" onClick={() => handleDelete(addon.addonId)} title="Delete">🗑️</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // ═══════════════════════════════════════
    //  STAFF TAB
    // ═══════════════════════════════════════
    const StaffTab = () => {
        const empty = { firstName: '', lastName: '', email: '', phone: '' };
        const [form, setForm] = useState(empty);
        const [saving, setSaving] = useState(false);
        const [copied, setCopied] = useState(false);

        const handleSave = async (e) => {
            e.preventDefault();
            setSaving(true);
            try {
                const created = await addRestaurantStaff(restaurant.restaurantId, form);
                setCreatedStaff(created);
                setForm(empty);
                setShowForm(false);
                flash(`Staff member ${created.firstName} added.`);
                fetchStaff();
            } catch (e) { flashError(e); }
            finally { setSaving(false); }
        };

        const copyPassword = async () => {
            if (!createdStaff?.password) return;
            try {
                if (navigator?.clipboard?.writeText) {
                    await navigator.clipboard.writeText(createdStaff.password);
                } else {
                    const input = document.createElement('input');
                    input.value = createdStaff.password;
                    document.body.appendChild(input);
                    input.select();
                    document.execCommand('copy');
                    document.body.removeChild(input);
                }
                setCopied(true);
                setTimeout(() => setCopied(false), 1800);
            } catch {
                setError('Could not copy password. Please copy it manually.');
                setTimeout(() => setError(''), 2500);
            }
        };

        return (
            <div>
                <div className="rd-tab-header">
                    <h3>Staff ({staffMembers.length})</h3>
                    {!showForm && (
                        <button className="rd-btn rd-btn-primary" onClick={() => setShowForm(true)}>
                            + Add Staff
                        </button>
                    )}
                </div>

                {createdStaff && (
                    <div className="rd-staff-created">
                        <div>
                            <div className="rd-staff-created-title">Temporary password generated</div>
                            <div className="rd-staff-created-row">
                                <code>{createdStaff.password}</code>
                                <button className="rd-btn rd-btn-outline rd-btn-sm" onClick={copyPassword} type="button">
                                    {copied ? 'Copied' : 'Copy'}
                                </button>
                            </div>
                            <p>Share this once. Staff will be asked to change it after login.</p>
                        </div>
                    </div>
                )}

                <AnimatePresence>
                    {showForm && (
                        <motion.form className="rd-inline-form" onSubmit={handleSave} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                            <div className="rd-form-row">
                                <input placeholder="First Name" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required />
                                <input placeholder="Last Name" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required />
                            </div>
                            <div className="rd-form-row">
                                <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                                <input type="tel" placeholder="Phone (10 digits)" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} pattern="^(\\+91)?[6-9][0-9]{9}$" required />
                            </div>
                            <div className="rd-form-actions">
                                <button type="submit" className="rd-btn rd-btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Create Staff'}</button>
                                <button type="button" className="rd-btn rd-btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>

                {staffMembers.length === 0 && !showForm ? (
                    <div className="rd-empty-small"><p>No staff members yet.</p></div>
                ) : (
                    <div className="rd-list">
                        {staffMembers.map((staff) => (
                            <div key={staff.userId} className="rd-list-item rd-staff-row">
                                <div className="rd-list-info">
                                    <span className="rd-list-name">{staff.userName}</span>
                                    <span className="rd-list-sub">ID: {staff.userId}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // ═══════════════════════════════════════
    //  MESS PLANS TAB
    // ═══════════════════════════════════════
    const MessPlansTab = () => {
        const emptySlot = { dayOfWeek: 'MONDAY', mealType: 'BREAKFAST', foodIds: [] };
        const empty = {
            messPlanName: '',
            messPlanDescription: '',
            price: '',
            slots: [emptySlot],
        };

        const [form, setForm] = useState(empty);
        const [saving, setSaving] = useState(false);
        const [showCreateForm, setShowCreateForm] = useState(false);
        const [editId, setEditId] = useState(null);
        const [selectedPlan, setSelectedPlan] = useState(null);
        const [busyPlanId, setBusyPlanId] = useState(null);

        const getFoodId = (food) => Number(food?.id ?? food?.foodId);
        const getFoodName = (food) => food?.name ?? food?.foodName ?? `Food #${getFoodId(food)}`;

        const resetForm = () => {
            setForm(empty);
            setEditId(null);
            setShowCreateForm(false);
        };

        const toForm = (plan) => ({
            messPlanName: plan?.messPlanName || '',
            messPlanDescription: plan?.messPlanDescription || '',
            price: plan?.price?.toString() || '',
            slots: (plan?.slots || []).length > 0
                ? plan.slots.map(slot => ({
                    dayOfWeek: slot.dayOfWeek,
                    mealType: slot.mealType,
                    foodIds: (slot.foodItems || []).map(food => Number(food.foodId ?? food.id)),
                }))
                : [emptySlot],
        });

        const summarizePlan = (plan) => {
            const slots = plan?.slots || [];
            const days = new Set(slots.map(slot => slot.dayOfWeek)).size;
            const meals = new Set(slots.map(slot => slot.mealType)).size;
            return `${days} days · ${meals} meal types · ${slots.length} slots`;
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

        const setSlot = (index, updates) => {
            setForm(prev => ({
                ...prev,
                slots: prev.slots.map((slot, idx) => (idx === index ? { ...slot, ...updates } : slot))
            }));
        };

        const toggleSlotFood = (index, foodId) => {
            const target = form.slots[index];
            const exists = target.foodIds.includes(foodId);
            setSlot(index, {
                foodIds: exists
                    ? target.foodIds.filter(id => id !== foodId)
                    : [...target.foodIds, foodId]
            });
        };

        const addSlot = () => {
            setForm(prev => ({ ...prev, slots: [...prev.slots, { ...emptySlot }] }));
        };

        const removeSlot = (index) => {
            setForm(prev => ({
                ...prev,
                slots: prev.slots.filter((_, idx) => idx !== index)
            }));
        };

        const formatEnum = (value) => value
            ?.toLowerCase()
            .split('_')
            .map(s => s.charAt(0).toUpperCase() + s.slice(1))
            .join(' ');

        const handleSave = async (e) => {
            e.preventDefault();
            const hasInvalidSlot = form.slots.some(slot => !slot.foodIds.length);
            if (hasInvalidSlot) {
                flashError({ response: { data: 'Please select at least one food item in each slot.' } });
                return;
            }

            setSaving(true);
            try {
                const payload = {
                    ...form,
                    price: parseFloat(form.price),
                    slots: form.slots.map(slot => ({
                        dayOfWeek: slot.dayOfWeek,
                        mealType: slot.mealType,
                        foodIds: slot.foodIds.map(id => Number(id)),
                    })),
                };

                if (editId) {
                    const updatedPlan = normalizeMessPlan(await updateMessPlan(restaurant.restaurantId, editId, payload));
                    setMessPlans(prev => prev.map(p => (p.messPlanId === editId ? updatedPlan : p)));
                    flash('Mess plan updated!');
                } else {
                    const createdPlan = normalizeMessPlan(await createMessPlan(restaurant.restaurantId, payload));
                    setMessPlans(prev => [createdPlan, ...prev]);
                    flash('Mess plan created!');
                }
                resetForm();
                setSelectedPlan(null);
                await fetchMessPlans();
            } catch (e) { flashError(e); }
            finally { setSaving(false); }
        };

        const handleView = async (messPlanId) => {
            if (selectedPlan?.messPlanId === messPlanId) {
                setSelectedPlan(null);
                return;
            }

            setBusyPlanId(messPlanId);
            try {
                const plan = normalizeMessPlan(await getMessPlanById(restaurant.restaurantId, messPlanId));
                setSelectedPlan(plan);
            } catch (e) { flashError(e); }
            finally { setBusyPlanId(null); }
        };

        const startEdit = async (messPlanId) => {
            setBusyPlanId(messPlanId);
            try {
                const plan = normalizeMessPlan(await getMessPlanById(restaurant.restaurantId, messPlanId));
                setEditId(messPlanId);
                setForm(toForm(plan));
                setShowCreateForm(true);
            } catch (e) { flashError(e); }
            finally { setBusyPlanId(null); }
        };

        const handleDelete = async (messPlanId, planName) => {
            if (!window.confirm(`Delete mess plan \"${planName}\"?`)) return;
            setBusyPlanId(messPlanId);
            try {
                const message = await deleteMessPlan(restaurant.restaurantId, messPlanId);
                flash(typeof message === 'string' ? message : 'Mess plan scheduled for deletion.');
                if (selectedPlan?.messPlanId === messPlanId) {
                    setSelectedPlan(null);
                }
                await fetchMessPlans();
            } catch (e) { flashError(e); }
            finally { setBusyPlanId(null); }
        };

        return (
            <div>
                <div className="rd-tab-header">
                    <h3>Mess Plans ({messPlans.length})</h3>
                    {!showCreateForm && (
                        <button
                            className="rd-btn rd-btn-primary"
                            onClick={() => {
                                setForm(empty);
                                setEditId(null);
                                setShowCreateForm(true);
                            }}
                        >
                            + Create Mess Plan
                        </button>
                    )}
                </div>

                <AnimatePresence>
                    {showCreateForm && (
                        <motion.form className="rd-inline-form" onSubmit={handleSave} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                            <input
                                placeholder="Mess Plan Name"
                                value={form.messPlanName}
                                onChange={e => setForm({ ...form, messPlanName: e.target.value })}
                                required
                            />
                            <textarea
                                placeholder="Description"
                                value={form.messPlanDescription}
                                onChange={e => setForm({ ...form, messPlanDescription: e.target.value })}
                                required
                            />
                            <input
                                type="number"
                                step="0.01"
                                min="1"
                                placeholder="Plan Price (₹)"
                                value={form.price}
                                onChange={e => setForm({ ...form, price: e.target.value })}
                                required
                            />

                            <div className="rd-mp-slots-head">
                                <span className="rd-cat-label">Slots</span>
                                <button type="button" className="rd-btn rd-btn-outline rd-btn-sm" onClick={addSlot}>+ Add Slot</button>
                            </div>

                            {form.slots.map((slot, index) => (
                                <div key={`${slot.dayOfWeek}-${slot.mealType}-${index}`} className="rd-mp-slot">
                                    <div className="rd-form-row">
                                        <select value={slot.dayOfWeek} onChange={e => setSlot(index, { dayOfWeek: e.target.value })}>
                                            {DAY_OF_WEEK.map(day => <option key={day} value={day}>{formatEnum(day)}</option>)}
                                        </select>
                                        <select value={slot.mealType} onChange={e => setSlot(index, { mealType: e.target.value })}>
                                            {MEAL_TYPES.map(type => <option key={type} value={type}>{formatEnum(type)}</option>)}
                                        </select>
                                    </div>

                                    <div className="rd-cat-checkboxes">
                                        <span className="rd-cat-label">Foods for this slot:</span>
                                        {foods.length === 0 ? (
                                            <span className="rd-list-sub">No foods available. Add foods first.</span>
                                        ) : (
                                            foods.map(food => (
                                                <label key={`${food.id}-${index}`} className="rd-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        checked={slot.foodIds.includes(food.id)}
                                                        onChange={() => toggleSlotFood(index, food.id)}
                                                    />
                                                    {food.name}
                                                </label>
                                            ))
                                        )}
                                    </div>

                                    {form.slots.length > 1 && (
                                        <button type="button" className="rd-btn rd-btn-danger rd-btn-sm" onClick={() => removeSlot(index)}>
                                            Remove Slot
                                        </button>
                                    )}
                                </div>
                            ))}

                            <div className="rd-form-actions">
                                <button type="submit" className="rd-btn rd-btn-primary" disabled={saving}>{saving ? 'Saving...' : (editId ? 'Update' : 'Create')}</button>
                                <button type="button" className="rd-btn rd-btn-outline" onClick={resetForm}>Cancel</button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>

                {messPlans.length === 0 && !showCreateForm ? (
                    <div className="rd-empty-small"><p>No mess plans yet. Create one to get started.</p></div>
                ) : (
                    <div className="rd-list">
                        {messPlans.map(plan => (
                            <div key={plan.messPlanId} className="rd-list-item rd-mp-item rd-mp-card">
                                <div className="rd-list-info">
                                    <div className="rd-mp-head-row">
                                        <div className="rd-mp-title-wrap">
                                            <span className="rd-list-name">{plan.messPlanName}</span>
                                            <span className={`rd-mp-status ${plan.active ? 'active' : 'inactive'}`}>
                                                {plan.active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <span className="rd-food-price">₹{Number(plan.price).toFixed(0)}</span>
                                    </div>
                                    <span className="rd-list-sub rd-mp-summary">{summarizePlan(plan)}</span>

                                    {selectedPlan?.messPlanId === plan.messPlanId && (
                                        <div className="rd-mp-detail">
                                            {groupSlotsByDay(selectedPlan).map(section => (
                                                <div key={section.day} className="rd-mp-day-section">
                                                    <div className="rd-mp-day-title">{formatEnum(section.day)}</div>
                                                    {section.meals.map(meal => (
                                                        <div key={`${section.day}-${meal.mealType}`} className="rd-mp-meal-block">
                                                            <div className="rd-mp-meal-title">{formatEnum(meal.mealType)}</div>
                                                            <div className="rd-list-tags rd-mp-food-chips">
                                                                {meal.foods.map(food => (
                                                                    <span key={food.foodId ?? food.id} className="rd-tag">
                                                                        {getFoodName(food)}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="rd-list-actions">
                                    <button
                                        className="rd-btn rd-btn-outline rd-btn-sm"
                                        onClick={() => handleView(plan.messPlanId)}
                                        disabled={busyPlanId === plan.messPlanId}
                                    >
                                        {busyPlanId === plan.messPlanId ? '...' : (selectedPlan?.messPlanId === plan.messPlanId ? 'Hide' : 'View')}
                                    </button>
                                    <button
                                        className="rd-btn rd-btn-outline rd-btn-sm"
                                        onClick={() => startEdit(plan.messPlanId)}
                                        disabled={busyPlanId === plan.messPlanId}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="rd-btn rd-btn-danger rd-btn-sm"
                                        onClick={() => handleDelete(plan.messPlanId, plan.messPlanName)}
                                        disabled={busyPlanId === plan.messPlanId}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // ═══════════════════════════════════════
    //  KITCHEN TAB
    // ═══════════════════════════════════════
    const KitchenTab = () => {
        const handleKitchenUpdate = async (e) => {
            e.preventDefault();
            if (!restaurant?.restaurantId) return;

            setKitchenBusy(true);
            try {
                const response = await updateKitchenStatus(restaurant.restaurantId, kitchenLoadIndicator);
                setKitchenResponse(response);
                flash('Kitchen load updated.');
            } catch (e) { flashError(e); }
            finally { setKitchenBusy(false); }
        };

        return (
            <div className="rd-kitchen-wrap">
                <form className="rd-kitchen-form" onSubmit={handleKitchenUpdate}>
                    <h3>Kitchen Controller</h3>
                    <p>Restaurant: <strong>{restaurant?.restaurantName || '—'}</strong></p>

                    <label>Kitchen Load</label>
                    <select value={kitchenLoadIndicator} onChange={e => setKitchenLoadIndicator(e.target.value)}>
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                    </select>

                    <button type="submit" className="rd-btn rd-btn-primary" disabled={kitchenBusy}>
                        {kitchenBusy ? 'Updating...' : 'Update Kitchen Status'}
                    </button>
                </form>

                {kitchenResponse && (
                    <div className="rd-kitchen-card">
                        <h4>{kitchenResponse.restaurantName}</h4>
                        <div className="rd-kitchen-meta">
                            <span>Restaurant ID: {kitchenResponse.restaurantId}</span>
                            <span>Current Orders: {kitchenResponse.currentOrders}</span>
                        </div>
                        <span className="rd-kitchen-badge">Load: {kitchenResponse.kitchenLoadStatus}</span>
                        <p>{kitchenResponse.message}</p>
                    </div>
                )}
            </div>
        );
    };

    // ═══════════════════════════════════════
    //  ORDERS TAB
    // ═══════════════════════════════════════
    const VALID_TRANSITIONS = {
        CREATED: ['CONFIRMED', 'CANCELLED'],
        CONFIRMED: ['PREPARING', 'CANCELLED'],
        PREPARING: ['OUT_FOR_DELIVERY'],
        OUT_FOR_DELIVERY: ['DELIVERED'],
        DELIVERED: [],
        CANCELLED: [],
    };

    const STATUS_LABELS = {
        CREATED: 'Created', CONFIRMED: 'Confirmed', PREPARING: 'Preparing',
        OUT_FOR_DELIVERY: 'Out for Delivery', DELIVERED: 'Delivered', CANCELLED: 'Cancelled',
    };

    const STATUS_STYLES = {
        CREATED: { bg: '#DBEAFE', color: '#1D4ED8' },
        CONFIRMED: { bg: '#DCFCE7', color: '#16A34A' },
        PREPARING: { bg: '#FEF3C7', color: '#B45309' },
        OUT_FOR_DELIVERY: { bg: '#FFF7ED', color: '#C2410C' },
        DELIVERED: { bg: '#DCFCE7', color: '#15803D' },
        CANCELLED: { bg: '#FEE2E2', color: '#DC2626' },
    };

    const OrdersTab = () => {
        const [updatingId, setUpdatingId] = useState(null);
        const [orderFilter, setOrderFilter] = useState('ALL');

        const filteredOrders = orderFilter === 'ALL'
            ? orders
            : orders.filter(o => o.orderStatus === orderFilter);

        const handleStatusChange = async (orderId, newStatus) => {
            setUpdatingId(orderId);
            try {
                await updateOrderStatus(orderId, newStatus);
                flash(`Order #${orderId} → ${STATUS_LABELS[newStatus]}`);
                fetchOrders();
            } catch (e) { flashError(e); }
            finally { setUpdatingId(null); }
        };

        const formatDate = (dateStr) => {
            if (!dateStr) return '';
            return new Date(dateStr).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
            });
        };

        return (
            <div>
                <div className="rd-tab-header">
                    <h3>Orders ({orders.length})</h3>
                    <button className="rd-btn rd-btn-outline" onClick={fetchOrders}>↻ Refresh</button>
                </div>

                <div className="rd-order-filters">
                    {['ALL', 'CREATED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map(f => (
                        <button key={f} className={`rd-order-filter ${orderFilter === f ? 'active' : ''}`} onClick={() => setOrderFilter(f)}>
                            {f === 'ALL' ? 'All' : STATUS_LABELS[f]}
                        </button>
                    ))}
                </div>

                {filteredOrders.length === 0 ? (
                    <div className="rd-empty-small"><p>No {orderFilter !== 'ALL' ? STATUS_LABELS[orderFilter]?.toLowerCase() : ''} orders.</p></div>
                ) : (
                    <div className="rd-list">
                        {filteredOrders.map(order => {
                            const style = STATUS_STYLES[order.orderStatus] || STATUS_STYLES.CREATED;
                            const nextStatuses = VALID_TRANSITIONS[order.orderStatus] || [];
                            return (
                                <div key={order.orderId} className="rd-order-card">
                                    <div className="rd-order-top">
                                        <div>
                                            <span className="rd-order-id">Order #{order.orderId}</span>
                                            <span className="rd-order-date">{formatDate(order.createdAt)}</span>
                                        </div>
                                        <span className="rd-order-badge" style={{ background: style.bg, color: style.color }}>
                                            {STATUS_LABELS[order.orderStatus]}
                                        </span>
                                    </div>

                                    <div className="rd-order-customer">
                                        👤 {order.user?.firstName || 'Customer'} {order.user?.lastName || ''}
                                    </div>

                                    <div className="rd-order-items">
                                        {order.orderItems?.map(item => (
                                            <span key={item.orderItemId} className="rd-order-item-chip">
                                                {item.foodName} × {item.quantity}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="rd-order-bottom">
                                        <span className="rd-order-total">₹{Number(order.totalPrice).toFixed(0)}</span>
                                        {nextStatuses.length > 0 && (
                                            <div className="rd-order-status-actions">
                                                {nextStatuses.map(status => (
                                                    <button
                                                        key={status}
                                                        className={`rd-btn rd-btn-sm ${status === 'CANCELLED' ? 'rd-btn-danger' : 'rd-btn-primary'}`}
                                                        disabled={updatingId === order.orderId}
                                                        onClick={() => handleStatusChange(order.orderId, status)}
                                                    >
                                                        {updatingId === order.orderId ? '...' : STATUS_LABELS[status]}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    // ═══════════════════════════════════════
    //  RENDER
    // ═══════════════════════════════════════
    if (loading) {
        return (
            <div className="rd-page">
                <div className="rd-loading">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} className="rd-loading-icon">🏪</motion.div>
                    <p>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rd-page">
            <div className="rd-container">
                <div className="rd-page-header">
                    <h1 className="rd-page-title">Restaurant Dashboard</h1>
                    <span className="rd-page-sub">Manage your restaurant</span>
                </div>

                {error && <div className="rd-toast rd-toast-error">{error}</div>}
                {success && <div className="rd-toast rd-toast-success">{success}</div>}

                {/* Restaurant selector if user owns multiple */}
                {restaurants.length > 1 && (
                    <div className="rd-restaurant-selector">
                        <label>Restaurant:</label>
                        <select value={restaurant?.restaurantId || ''} onChange={e => {
                            const r = restaurants.find(r => r.restaurantId === parseInt(e.target.value));
                            if (r) setRestaurant(r);
                        }}>
                            {restaurants.map(r => <option key={r.restaurantId} value={r.restaurantId}>{r.restaurantName}</option>)}
                        </select>
                    </div>
                )}

                {/* Tabs */}
                <div className="rd-tabs">
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            className={`rd-tab ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => { setActiveTab(tab); setShowForm(false); setEditing(null); }}
                        >
                            {TAB_LABELS[tab]}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="rd-tab-content">
                    {activeTab === 'restaurant' && <RestaurantTab />}
                    {activeTab === 'staff' && (restaurant ? <StaffTab /> : <div className="rd-empty-small"><p>Create a restaurant first.</p></div>)}
                    {activeTab === 'orders' && <OrdersTab />}
                    {activeTab === 'kitchen' && (restaurant ? <KitchenTab /> : <div className="rd-empty-small"><p>Create a restaurant first.</p></div>)}
                    {activeTab === 'categories' && (restaurant ? <CategoriesTab /> : <div className="rd-empty-small"><p>Create a restaurant first.</p></div>)}
                    {activeTab === 'foods' && (restaurant ? <FoodsTab /> : <div className="rd-empty-small"><p>Create a restaurant first.</p></div>)}
                    {activeTab === 'addons' && (restaurant ? <AddonsTab /> : <div className="rd-empty-small"><p>Create a restaurant first.</p></div>)}
                    {activeTab === 'messPlans' && (restaurant ? <MessPlansTab /> : <div className="rd-empty-small"><p>Create a restaurant first.</p></div>)}
                </div>
            </div>
        </div>
    );
};

export default RestaurantDashboard;

