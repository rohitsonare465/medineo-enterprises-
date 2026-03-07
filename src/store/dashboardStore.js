import { create } from 'zustand';
import api from '../services/api';

const MAX_RETRIES = 3;
const RETRY_DELAY = 3000; // 3 seconds between retries

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const useDashboardStore = create((set, get) => ({
  stats: null,
  salesChart: [],
  topCustomers: [],
  topMedicines: [],
  isLoading: false,
  error: null,
  serverWaking: false,

  fetchDashboardStats: async () => {
    set({ isLoading: true, error: null, serverWaking: false });

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await api.get('/dashboard');
        set({ stats: response.data.data, isLoading: false, serverWaking: false });
        return; // success
      } catch (error) {
        const isTimeout = error.code === 'ECONNABORTED';
        const isNetworkError = !error.response && error.message?.includes('Network Error');
        const isServerDown = error.response?.status >= 500;

        if ((isTimeout || isNetworkError || isServerDown) && attempt < MAX_RETRIES) {
          set({ serverWaking: true });
          await sleep(RETRY_DELAY);
          continue; // retry
        }

        const message = (isTimeout || isNetworkError)
          ? 'Server is starting up. Please wait and retry.'
          : error.response?.data?.message || 'Failed to fetch dashboard';
        set({ error: message, isLoading: false, serverWaking: false });
        return;
      }
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
