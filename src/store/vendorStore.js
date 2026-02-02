import { create } from 'zustand';
import api from '../services/api';

const useVendorStore = create((set, get) => ({
  vendors: [],
  vendor: null,
  total: 0,
  pages: 0,
  isLoading: false,
  error: null,

  fetchVendors: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/vendors?${queryParams}`);
      set({
        vendors: response.data.data,
        total: response.data.total,
        pages: response.data.pages,
        isLoading: false
      });
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false });
    }
  },

  fetchVendor: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/vendors/${id}`);
      set({ vendor: response.data.data, isLoading: false });
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false });
      return null;
    }
  },

  searchVendors: async (query) => {
    try {
      const response = await api.get(`/vendors?search=${query}&limit=10`);
      return response.data.data || [];
    } catch (error) {
      return [];
    }
  },

  createVendor: async (data) => {
    try {
      const response = await api.post('/vendors', data);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },

  updateVendor: async (id, data) => {
    try {
      const response = await api.put(`/vendors/${id}`, data);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },

  deleteVendor: async (id) => {
    try {
      await api.delete(`/vendors/${id}`);
      set({ vendors: get().vendors.filter(v => v._id !== id) });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  }
}));

export default useVendorStore;
