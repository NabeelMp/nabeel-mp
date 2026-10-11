/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bebas Neue"', 'Anton', 'Impact', 'sans-serif'],
        tall: ['Anton', '"Bebas Neue"', 'Impact', 'sans-serif'],
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
        hand: ['Caveat', 'cursive'],
      },
      colors: {
        ink: '#070707',
        coal: '#111111',
        ash: '#1b1b1b',
        bone: '#f2efe9',
        ember: '#ff5a1f',
        lime: '#d7ff3a',
      },
      keyframes: {
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
      },
      animation: {
        marquee: 'marquee var(--marquee-duration, 45s) linear infinite',
        float: 'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
