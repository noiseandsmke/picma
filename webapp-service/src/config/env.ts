export const ENV = {
    API_URL: import.meta.env.VITE_API_URL || 'http:
    CLIENT_ID: import.meta.env.VITE_CLIENT_ID || 'webapp-client',
};
export const ROUTES = {
    HOME: '/',
    SIGNIN: '/signin',
    SIGNUP: '/signup',
    DASHBOARD: {
        ADMIN: '/admin/dashboard',
        AGENT: '/agent/dashboard',
        OWNER: '/owner/dashboard',
    },
} as const;