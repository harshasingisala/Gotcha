export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#002452",
        "navy-soft": "#1B3A6B",
        orange: "#FD761A",
        "orange-deep": "#9D4300",
        surface: "#F0F3FF",
        "surface-strong": "#E7EEFF",
        "surface-high": "#DEE8FF",
        page: "#F9F9FF",
        text: "#111C2D",
        muted: "#44474F",
        outline: "#C4C6D0"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 4px 12px rgba(0, 36, 82, 0.05)",
        lift: "0 12px 24px -8px rgba(0, 36, 82, 0.12)"
      }
    }
  },
  plugins: []
};
