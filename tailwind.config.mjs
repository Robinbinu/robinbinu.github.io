// tailwind.config.js
import { fontFamily } from 'tailwindcss/defaultTheme';

export default {
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Bricolage Grotesque Variable',
          'Inter Variable',
          ...fontFamily.sans,
        ],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
