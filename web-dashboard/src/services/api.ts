import axios from 'axios';

// Use environment variable for API URL in production, fallback to /api (relative path for Nginx proxy)
export const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = {
    getStats: async () => {
        const response = await axios.get(`${API_URL}/stats`);
        return response.data;
    },
    getDailyActivity: async () => {
        const response = await axios.get(`${API_URL}/activity/daily`);
        return response.data;
    },
    getHourlyActivity: async () => {
        const response = await axios.get(`${API_URL}/activity/hourly`);
        return response.data;
    },
    getHeatmap: async () => {
        const response = await axios.get(`${API_URL}/heatmap`);
        return response.data;
    },
    getTopWords: async (limit = 20) => {
        const response = await axios.get(`${API_URL}/words?limit=${limit}`);
        return response.data;
    },
    getTopEmojis: async (limit = 10) => {
        const response = await axios.get(`${API_URL}/emojis?limit=${limit}`);
        return response.data;
    },
    getSenders: async () => {
        const response = await axios.get(`${API_URL}/senders`);
        return response.data;
    },
    getSenderAnalysis: async (name: string) => {
        const response = await axios.get(`${API_URL}/sender/${name}`);
        return response.data;
    }
};
