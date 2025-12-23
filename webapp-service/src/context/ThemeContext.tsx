import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeProviderProps {
    readonly children: React.ReactNode;
    readonly defaultTheme?: Theme;
    readonly storageKey?: string;
}

interface ThemeProviderState {
    theme: Theme;
    resolvedTheme: 'light' | 'dark';
    setTheme: (theme: Theme) => void;
}

const initialState: ThemeProviderState = {
    theme: 'system',
    resolvedTheme: 'light',
    setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
                                  children,
                                  defaultTheme = 'system',
                                  storageKey = 'picma-theme',
                              }: ThemeProviderProps) {
    const [theme, setThemeState] = useState<Theme>(
        () => (globalThis.localStorage.getItem(storageKey) as Theme) || defaultTheme
    );
    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        const root = globalThis.document.documentElement;

        const applyTheme = (t: Theme) => {
            root.classList.remove('light', 'dark');
            let resolved: 'light' | 'dark';

            if (t === 'system') {
                resolved = globalThis.matchMedia('(prefers-color-scheme: dark)').matches
                    ? 'dark'
                    : 'light';
            } else {
                resolved = t as 'light' | 'dark';
            }

            root.classList.add(resolved);
            setResolvedTheme(resolved);
        };

        applyTheme(theme);

        if (theme === 'system') {
            const mediaQuery = globalThis.matchMedia('(prefers-color-scheme: dark)');
            const listener = () => applyTheme('system');
            mediaQuery.addEventListener('change', listener);
            return () => mediaQuery.removeEventListener('change', listener);
        }
    }, [theme]);

    const setTheme = useCallback((theme: Theme) => {
        globalThis.localStorage.setItem(storageKey, theme);
        setThemeState(theme);
    }, [storageKey]);

    const value = useMemo(() => ({
        theme,
        resolvedTheme,
        setTheme,
    }), [theme, resolvedTheme, setTheme]);

    return (
        <ThemeProviderContext.Provider value={value}>
            {children}
        </ThemeProviderContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext);

    if (context === undefined)
        throw new Error('useTheme must be used within a ThemeProvider');

    return context;
};