/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // STRICT BLACK & WHITE B2B THEME
        black: '#0F0F0F',
        white: '#FFFFFF',
        primary: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
          950: '#0F0F0F',
          DEFAULT: '#0F0F0F'
        },
        secondary: {
          DEFAULT: '#FFFFFF', // Secondary actions usually white/bordered
          accent: '#6B7280'   // Subtle gray accent
        },
        success: {
          50: '#F0FDF4', // Keep subtle green just for success state badges
          500: '#22C55E',
          DEFAULT: '#22C55E'
        },
        warning: {
          50: '#FFFBEB',
          500: '#F59E0B',
          DEFAULT: '#F59E0B'
        },
        error: {
          50: '#FEF2F2',
          500: '#EF4444',
          DEFAULT: '#EF4444'
        },
        border: '#E5E7EB'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}