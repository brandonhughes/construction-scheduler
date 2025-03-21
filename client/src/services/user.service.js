import api from './api';

const UserService = {
  getAllUsers: async () => {
    try {
      const response = await api.get('/users');
      return response.data.users;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  getUserById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data.user;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  changePassword: async (id, passwordData) => {
    try {
      const response = await api.post(`/users/${id}/change-password`, passwordData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

export default UserService;
