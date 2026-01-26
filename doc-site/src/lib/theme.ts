// Theme configuration for qortex documentation site
// This file defines the color palette and can be easily modified to change the entire theme

export const theme = {
    colors: {
        primary: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
        },
        secondary: {
            50: '#ecfdf5',
            100: '#d1fae5',
            200: '#a7f3d0',
            300: '#6ee7b7',
            400: '#34d399',
            500: '#10b981',
            600: '#059669',
            700: '#047857',
            800: '#065f46',
            900: '#064e3b',
        },
        accent: {
            50: '#faf5ff',
            100: '#f3e8ff',
            200: '#e9d5ff',
            300: '#d8b4fe',
            400: '#c084fc',
            500: '#a855f7',
            600: '#9333ea',
            700: '#7c3aed',
            800: '#6b21a8',
            900: '#581c87',
        },
    },
    gradients: {
        primary: 'from-primary-600 to-secondary-600',
        background: 'from-primary-50 via-white to-secondary-50',
    },
    animations: {
        float: 'float 3s ease-in-out infinite',
        fadeIn: 'fadeIn 0.5s ease-in-out',
        slideUp: 'slideUp 0.5s ease-out',
    },
} as const

// Alternative theme presets
export const themePresets = {
    default: theme,

    // Blue & Green theme (current)
    blueGreen: {
        ...theme,
        colors: {
            primary: theme.colors.primary,
            secondary: theme.colors.secondary,
            accent: theme.colors.accent,
        },
    },

    // Purple & Pink theme
    purplePink: {
        ...theme,
        colors: {
            primary: {
                50: '#faf5ff',
                100: '#f3e8ff',
                200: '#e9d5ff',
                300: '#d8b4fe',
                400: '#c084fc',
                500: '#a855f7',
                600: '#9333ea',
                700: '#7c3aed',
                800: '#6b21a8',
                900: '#581c87',
            },
            secondary: {
                50: '#fdf2f8',
                100: '#fce7f3',
                200: '#fbcfe8',
                300: '#f9a8d4',
                400: '#f472b6',
                500: '#ec4899',
                600: '#db2777',
                700: '#be185d',
                800: '#9d174d',
                900: '#831843',
            },
            accent: theme.colors.accent,
        },
    },

    // Orange & Red theme
    orangeRed: {
        ...theme,
        colors: {
            primary: {
                50: '#fff7ed',
                100: '#ffedd5',
                200: '#fed7aa',
                300: '#fdba74',
                400: '#fb923c',
                500: '#f97316',
                600: '#ea580c',
                700: '#c2410c',
                800: '#9a3412',
                900: '#7c2d12',
            },
            secondary: {
                50: '#fef2f2',
                100: '#fee2e2',
                200: '#fecaca',
                300: '#fca5a5',
                400: '#f87171',
                500: '#ef4444',
                600: '#dc2626',
                700: '#b91c1c',
                800: '#991b1b',
                900: '#7f1d1d',
            },
            accent: theme.colors.accent,
        },
    },
} as const

export type Theme = typeof theme
export type ThemePreset = keyof typeof themePresets
