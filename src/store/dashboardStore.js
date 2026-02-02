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
      const response = await api.get('/dashboard');
      set({ stats: response.data.data, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch dashboard', isLoading: false });
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
