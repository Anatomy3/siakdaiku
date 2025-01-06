// tailwind.config.js
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#e0f7fa',
        foreground: '#333',
        primary: '#1e40af',
        'primary-foreground': '#fff',
        secondary: '#0369a1',
        'muted-foreground': '#6b7280',
        card: '#fff',
        specialProject: '#b3e5fc',
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
