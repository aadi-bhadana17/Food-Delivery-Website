import api from './axiosConfig';

const ADMIN_BASE = '/api/admin';
const RESTAURANT_BASE = '/api/restaurants';
const ORDER_BASE = '/api/order';

// ── Role Change Requests ──
export const getRoleRequests = async () => {
    const response = await api.get(`${ADMIN_BASE}/role-requests`);
    return response.data;
};

export const updateRoleRequest = async (requestId, action) => {
    const response = await api.put(`${ADMIN_BASE}/role-requests/${requestId}`, { action });
    return response.data;
};

// ── Restaurants (Admin can view all, update, toggle status) ──
export const getAllRestaurants = async () => {
    const response = await api.get(RESTAURANT_BASE);
    return response.data;
};

export const updateRestaurant = async (id, data) => {
    const response = await api.put(`${RESTAURANT_BASE}/${id}`, data);
    return response.data;
};

export const updateRestaurantStatus = async (id, open) => {
    const response = await api.patch(`${RESTAURANT_BASE}/${id}/status`, { open });
    return response.data;
};

// ── Orders (Admin only) ──
export const getAllOrders = async () => {
    const response = await api.get(`${ADMIN_BASE}/orders`);
    return response.data;
};

export const getAdminRestaurantOrders = async (restaurantId) => {
    const response = await api.get(`${ORDER_BASE}/restaurant/${restaurantId}`);
    return response.data;
};

