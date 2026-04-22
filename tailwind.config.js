/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "vault-paper": "#FAFAF7",
        "vault-paper-deep": "#F2F0E8",
        "vault-ink": "#0A0A0A",
        "vault-ink-soft": "#1A1A18",
        "vault-graphite": "#6B6B68",
        "vault-graphite-light": "#9B9B96",
        "vault-forest": "#1A3D2E",
        "vault-forest-deep": "#0F2A1F",
        "vault-gold": "#8B7355",
        "vault-gold-light": "#A89074",
        "vault-oxblood": "#7A1F1F",
        "vault-hairline": "#E8E6E0",
        "vault-hairline-deep": "#D4D2CC",
        "vault-obsidian": "#0F0F0E",
        "vault-obsidian-soft": "#1C1C1A",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.04em",
        "tighter-alt": "-0.02em",
        "wider-alt": "0.18em",
        "widest-alt": "0.24em",
      },
      transitionTimingFunction: {
        vault: "cubic-bezier(0.25, 0.1, 0.25, 1)",
        "vault-slow": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      boxShadow: {
        hairline: "0 0 0 1px #E8E6E0",
        seal: "0 0 0 1px #E8E6E0, 0 8px 32px -12px rgba(10,10,10,0.08)",
      },
      backgroundImage: {
        "paper-grain":
          "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"200\" height=\"200\"><filter id=\"n\"><feTurbulence baseFrequency=\"0.9\" numOctaves=\"2\"/><feColorMatrix values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.03 0\"/></filter><rect width=\"200\" height=\"200\" filter=\"url(%23n)\"/></svg>')",
      },
    },
  },
  plugins: [],
};
