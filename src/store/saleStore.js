import { create } from 'zustand';
import api from '../services/api';

const useSaleStore = create((set, get) => ({
  sales: [],
  sale: null,
  total: 0,
  pages: 0,
  isLoading: false,
  error: null,

  fetchSales: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/sales?${queryParams}`);
      set({
        sales: response.data.data,
        total: response.data.total,
        pages: response.data.pages,
        isLoading: false
      });
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false });
    }
  },

  fetchSale: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/sales/${id}`);
      set({ sale: response.data.data, isLoading: false });
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false });
      return null;
    }
  },

  createSale: async (data) => {
    try {
      const response = await api.post('/sales', data);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },

  updateSale: async (id, data) => {
    try {
      const response = await api.put(`/sales/${id}`, data);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  }
}));

export default useSaleStore;
