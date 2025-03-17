import { defineStore } from 'pinia';
import axios from 'axios';

export const useUserStore = defineStore('user', {
  state: () => ({
    email: '',
  }),
  actions: {
    async fetchUserEmail() {
      const response = await axios.get('/api/me');
      this.email = response.data.user.email;
    },
  },
});