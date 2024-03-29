/** @type {import('tailwindcss').Config} */

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,html}"],
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      transitionProperty: {
        height: "height",
        // padding: "padding",
      },
      colors: {
        stat: {
          light: {
            health: "rgb(212, 110, 111)",
            temp: "rgb(156, 172, 130)",
            armor: "rgb(150, 169, 206)",
          },
          dark: {
            health: "rgba(255, 0, 0, 0.4)",
            temp: "rgba(106, 142, 35, 0.4)",
            armor: "rgba(100, 148, 237, 0.4)",
          },
        },
        default: {
          DEFAULT: "#dde1ee",
          dark: "#222639",
        },
        paper: {
          DEFAULT: "#f1f3f9",
          dark: "#3d4051",
        },
        text: {
          primary: {
            DEFAULT: "rgba(0, 0, 0, 0.87)",
            dark: "rgb(255, 255, 255)",
          },
          secondary: {
            DEFAULT: "rgba(0, 0, 0, 0.6)",
            dark: "rgb(255, 255, 255, 0.7)",
          },
          disabled: {
            DEFAULT: "rgba(0, 0, 0, 0.38)",
            dark: "rgb(255, 255, 255, 0.5)",
          },
        },
      },
    },
  },
  plugins: [],
  darkMode: "class",
};
