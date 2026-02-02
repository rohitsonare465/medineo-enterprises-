import { create } from 'zustand';
import api from '../services/api';

const usePurchaseStore = create((set, get) => ({
  purchases: [],
  purchase: null,
  total: 0,
  pages: 0,
  isLoading: false,
  error: null,

  fetchPurchases: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/purchases?${queryParams}`);
      set({
        purchases: response.data.data,
        total: response.data.total,
        pages: response.data.pages,
        isLoading: false
      });
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false });
    }
  },

  fetchPurchase: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/purchases/${id}`);
      set({ purchase: response.data.data, isLoading: false });
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false });
      return null;
    }
  },

  createPurchase: async (data) => {
    try {
      const response = await api.post('/purchases', data);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },

  updatePurchase: async (id, data) => {
    try {
      const response = await api.put(`/purchases/${id}`, data);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  }
}));

export default usePurchaseStore;
