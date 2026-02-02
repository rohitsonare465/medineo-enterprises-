import { create } from 'zustand';
import api from '../services/api';

const useCustomerStore = create((set, get) => ({
  customers: [],
  customer: null,
  total: 0,
  pages: 0,
  isLoading: false,
  error: null,

  fetchCustomers: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/customers?${queryParams}`);
      set({
        customers: response.data.data,
        total: response.data.total,
        pages: response.data.pages,
        isLoading: false
      });
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false });
    }
  },

  fetchCustomer: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/customers/${id}`);
      set({ customer: response.data.data, isLoading: false });
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false });
      return null;
    }
  },

  searchCustomers: async (query) => {
    try {
      const response = await api.get(`/customers?search=${query}&limit=10`);
      return response.data.data || [];
    } catch (error) {
      return [];
    }
  },

  createCustomer: async (data) => {
    try {
      const response = await api.post('/customers', data);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },

  updateCustomer: async (id, data) => {
    try {
      const response = await api.put(`/customers/${id}`, data);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },

  deleteCustomer: async (id) => {
    try {
      await api.delete(`/customers/${id}`);
      set({ customers: get().customers.filter(c => c._id !== id) });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  }
}));

export default useCustomerStore;
