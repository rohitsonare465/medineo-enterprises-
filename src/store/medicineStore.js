import { create } from 'zustand';
import api from '../services/api';

const useMedicineStore = create((set, get) => ({
  medicines: [],
  medicine: null,
  total: 0,
  pages: 0,
  isLoading: false,
  error: null,

  fetchMedicines: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/medicines?${queryParams}`);
      set({
        medicines: response.data.data,
        total: response.data.total,
        pages: response.data.pages,
        isLoading: false
      });
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false });
    }
  },

  fetchMedicine: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/medicines/${id}`);
      set({ medicine: response.data.data, isLoading: false });
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false });
      return null;
    }
  },

  searchMedicines: async (query) => {
    try {
      const response = await api.get(`/medicines?search=${query}&limit=10`);
      return response.data.data || [];
    } catch (error) {
      return [];
    }
  },

  searchForBilling: async (query) => {
    try {
      const response = await api.get(`/medicines/billing?q=${query}`);
      return response.data.data;
    } catch (error) {
      return [];
    }
  },

  createMedicine: async (data) => {
    try {
      const response = await api.post('/medicines', data);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },

  updateMedicine: async (id, data) => {
    try {
      const response = await api.put(`/medicines/${id}`, data);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },

  deleteMedicine: async (id) => {
    try {
      await api.delete(`/medicines/${id}`);
      set({ medicines: get().medicines.filter(m => m._id !== id) });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  }
}));

export default useMedicineStore;
