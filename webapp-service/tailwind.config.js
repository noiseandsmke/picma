import forms from '@tailwindcss/forms';

export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    plugins: [
        forms,
    ],
    theme: {
        extend: {
            colors: {
                primary: '#3b82f6',
                'primary-hover': '#2563eb',
                'bg-dark': '#0f172a',
                'background-dark': '#0f172a',
                'card-dark': '#1e293b',
                'surface-dark': '#1e293b',
                'input-dark': '#1e293b',
            }
        }
    }
}