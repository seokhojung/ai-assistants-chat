/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 헬스장 브랜드 컬러
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
        gym: {
          orange: '#ff6b35',
          'orange-light': '#ff8c42',
          'orange-dark': '#e55a2b',
          blue: '#004e89',
          'blue-light': '#0066b3',
          'blue-dark': '#003d6b',
        },
        success: {
          light: '#d1fae5',
          DEFAULT: '#10b981',
          dark: '#047857',
        },
        warning: {
          light: '#fef3c7',
          DEFAULT: '#f59e0b',
          dark: '#d97706',
        },
        danger: {
          light: '#fee2e2',
          DEFAULT: '#ef4444',
          dark: '#dc2626',
        },
      },
      // 타이포그래피
      fontSize: {
        'display-lg': ['3rem', { lineHeight: '1.2' }],
        'display-md': ['2.25rem', { lineHeight: '1.3' }],
        'display-sm': ['1.875rem', { lineHeight: '1.4' }],
        'title-xl': ['1.5rem', { lineHeight: '1.4' }],
        'title-lg': ['1.25rem', { lineHeight: '1.5' }],
        'title-md': ['1.125rem', { lineHeight: '1.5' }],
        'title-sm': ['1rem', { lineHeight: '1.5' }],
        'body-xl': ['1.125rem', { lineHeight: '1.7' }],
        'body-lg': ['1rem', { lineHeight: '1.7' }],
        'body-md': ['0.875rem', { lineHeight: '1.6' }],
        'body-sm': ['0.75rem', { lineHeight: '1.6' }],
        'caption': ['0.625rem', { lineHeight: '1.5' }],
      },
      // 애니메이션
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      // 박스 섀도우
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1)',
        'gym': '0 4px 20px -2px rgba(255, 107, 53, 0.25)',
        'primary': '0 4px 20px -2px rgba(59, 130, 246, 0.25)',
      },
    },
  },
  plugins: [],
} 