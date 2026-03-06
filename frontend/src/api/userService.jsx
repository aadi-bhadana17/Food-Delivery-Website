import api from './axiosConfig';

const USER_BASE = '/api/users';

export const getUserProfile = async () => {
    const response = await api.get(`${USER_BASE}/profile`);
    return response.data;
};

export const getAddresses = async () => {
    const response = await api.get(`${USER_BASE}/addresses`);
    return response.data;
};

export const addAddress = async (addressData) => {
    const response = await api.post(`${USER_BASE}/addresses`, addressData);
    return response.data;
};

export const updateAddress = async (addressId, addressData) => {
    const response = await api.put(`${USER_BASE}/addresses/${addressId}`, addressData);
    return response.data;
};

export const setDefaultAddress = async (addressId) => {
    const response = await api.put(`${USER_BASE}/addresses/${addressId}/default`);
    return response.data;
};

export const deleteAddress = async (addressId) => {
    const response = await api.delete(`${USER_BASE}/addresses/${addressId}`);
    return response.data;
};

