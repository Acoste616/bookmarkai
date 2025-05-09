/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html', // If index.html is at the root of 'frontend'
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: "class", // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: {
          DEFAULT: '#0a0a25',
          light: '#151530',
          dark: '#050515',
        },
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#00c3ff',
          dark: '#0099cc',
          light: '#33cfff',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: '#39ff14',
          dark: '#2ecc10',
          light: '#60ff3d',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      boxShadow: {
        'neon': '0 0 5px rgba(0, 195, 255, 0.5), 0 0 10px rgba(0, 195, 255, 0.3), 0 0 15px rgba(0, 195, 255, 0.2)',
        'neon-green': '0 0 5px rgba(57, 255, 20, 0.5), 0 0 10px rgba(57, 255, 20, 0.3), 0 0 15px rgba(57, 255, 20, 0.2)',
      },
    },
  },
  plugins: [],
} 