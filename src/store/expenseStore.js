import { create } from 'zustand';
import api from '../services/api';

const useExpenseStore = create((set, get) => ({
  expenses: [],
  expense: null,
  summary: null,
  total: 0,
  pages: 0,
  isLoading: false,
  error: null,

  fetchExpenses: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/expenses?${queryParams}`);
      set({
        expenses: response.data.data,
        total: response.data.total,
        pages: response.data.pages,
        isLoading: false
      });
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false });
    }
  },

  fetchExpense: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/expenses/${id}`);
      set({ expense: response.data.data, isLoading: false });
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false });
      return null;
    }
  },

  fetchSummary: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/expenses/summary?${queryParams}`);
      set({ summary: response.data.data });
    } catch (error) {
      console.error('Failed to fetch expense summary:', error);
    }
  },

  createExpense: async (data) => {
    try {
      const response = await api.post('/expenses', data);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to create expense' };
    }
  },

  updateExpense: async (id, data) => {
    try {
      const response = await api.put(`/expenses/${id}`, data);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to update expense' };
    }
  },

  deleteExpense: async (id) => {
    try {
      await api.delete(`/expenses/${id}`);
      const expenses = get().expenses.filter(e => e._id !== id);
      set({ expenses });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to delete expense' };
    }
  }
}));

export default useExpenseStore;
