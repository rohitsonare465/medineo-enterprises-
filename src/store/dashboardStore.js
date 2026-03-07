import { create } from 'zustand';
import api from '../services/api';

const useDashboardStore = create((set) => ({
  stats: null,
  salesChart: [],
  topCustomers: [],
  topMedicines: [],
  isLoading: false,
  error: null,

  fetchDashboardStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/dashboard', { timeout: 15000 });
      set({ stats: response.data.data, isLoading: false });
    } catch (error) {
      const message = error.code === 'ECONNABORTED'
        ? 'Server is waking up, please retry in a few seconds'
        : error.response?.data?.message || 'Failed to fetch dashboard';
      set({ error: message, isLoading: false });
    }
  },

  fetchSalesChart: async (period = 'month') => {
    try {
      const response = await api.get(`/dashboard/sales-chart?period=${period}`);
      set({ salesChart: response.data.data });
    } catch (error) {
      console.error('Failed to fetch sales chart:', error);
    }
  },

  fetchTopCustomers: async (limit = 10) => {
    try {
      const response = await api.get(`/dashboard/top-customers?limit=${limit}`);
      set({ topCustomers: response.data.data });
    } catch (error) {
      console.error('Failed to fetch top customers:', error);
    }
  },

  fetchTopMedicines: async (limit = 10, period = 'month') => {
    try {
      const response = await api.get(`/dashboard/top-medicines?limit=${limit}&period=${period}`);
      set({ topMedicines: response.data.data });
    } catch (error) {
      console.error('Failed to fetch top medicines:', error);
    }
  }
}));

export default useDashboardStore;
