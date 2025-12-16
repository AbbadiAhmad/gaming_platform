import { defineStore } from 'pinia';
import { getDashboard } from '@/services/api';
import socket from '@/services/socket';

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    data: null,
    loading: false
  }),

  actions: {
    async fetchDashboard() {
      this.loading = true;
      try {
        const response = await getDashboard();
        this.data = response.data;
      } finally {
        this.loading = false;
      }
    },

    connectSocket() {
      if (!socket.connected) {
        socket.connect();
        socket.emit('join_dashboard');

        socket.on('evaluation_updated', () => {
          this.fetchDashboard();
        });
      }
    },

    disconnectSocket() {
      socket.disconnect();
    }
  }
});
