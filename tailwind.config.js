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
        // Palette driven by CSS variables (see src/index.css) so it can flip
        // between the dark and light themes at runtime.
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        coal: 'rgb(var(--c-coal) / <alpha-value>)',
        ash: 'rgb(var(--c-ash) / <alpha-value>)',
        bone: 'rgb(var(--c-bone) / <alpha-value>)',
        line: 'rgb(var(--c-line) / <alpha-value>)',
        onaccent: 'rgb(var(--c-onaccent) / <alpha-value>)',
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
