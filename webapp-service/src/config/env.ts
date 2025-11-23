export const ENV = {
    API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
    AUTH_URL: import.meta.env.VITE_AUTH_URL || 'http://localhost:8081',
    CLIENT_ID: import.meta.env.VITE_CLIENT_ID || 'webapp-client',
};

export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    DASHBOARD: {
        ADMIN: '/admin/dashboard',
        AGENT: '/agent/dashboard',
        OWNER: '/owner/dashboard',
    },
};