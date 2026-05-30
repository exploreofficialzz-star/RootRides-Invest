/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#0F766E",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#14B8A6",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#F59E0B",
          foreground: "#02231c",
        },
        "dark-green": "#02231c",
        forest: "#004d40",
        paper: "#f8f6f1",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "#4a635e",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        display: ['"Instrument Serif"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
        card: "16px",
        pill: "9999px",
        small: "8px",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        card: "0 4px 24px rgba(0, 0, 0, 0.08)",
        "card-hover": "0 8px 40px rgba(0, 0, 0, 0.12)",
        "referral": "0 8px 40px rgba(245, 158, 11, 0.12)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "shimmer-gold": {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "card-glow": {
          "0%": { boxShadow: "0 0 20px rgba(20, 184, 166, 0.1)" },
          "50%": { boxShadow: "0 0 40px rgba(20, 184, 166, 0.2)" },
          "100%": { boxShadow: "0 0 20px rgba(20, 184, 166, 0.1)" },
        },
        "card-glow-amber": {
          "0%": { boxShadow: "0 0 20px rgba(245, 158, 11, 0.1)" },
          "50%": { boxShadow: "0 0 40px rgba(245, 158, 11, 0.2)" },
          "100%": { boxShadow: "0 0 20px rgba(245, 158, 11, 0.1)" },
        },
        "faq-divider-shimmer": {
          "0%": { backgroundPosition: "-150% 0" },
          "100%": { backgroundPosition: "250% 0" },
        },
        "float-up": {
          "0%": { transform: "translateY(0) scale(1)", opacity: "0.3" },
          "50%": { opacity: "0.6" },
          "100%": { transform: "translateY(-100px) scale(0.5)", opacity: "0" },
        },
        "ticker-scroll": {
          "100%": { transform: "translate3d(-100%, 0, 0)" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "perspective(500px) translate3d(0, 30px, -20px) rotateX(45deg)" },
          "60%": { opacity: "1", transform: "perspective(500px) translate3d(0, -5px, 5px) rotateX(-10deg)" },
          "80%": { transform: "perspective(500px) translate3d(0, 2px, 0) rotateX(3deg)" },
          "100%": { opacity: "1", transform: "perspective(500px) translate3d(0, 0, 0) rotateX(0)" },
        },
        "radial-wipe": {
          "0%": { background: "conic-gradient(transparent 0%, #02231c 0%, #02231c 100%)" },
          "20%": { background: "conic-gradient(transparent 0%, #02231c 12.5%, #02231c 100%)" },
          "40%": { background: "conic-gradient(transparent 0%, #02231c 25%, #02231c 100%)" },
          "60%": { background: "conic-gradient(transparent 0%, #02231c 50%, #02231c 100%)" },
          "80%": { background: "conic-gradient(transparent 0%, #02231c 75%, #02231c 100%)" },
          "100%": { background: "conic-gradient(transparent 0%, transparent 100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "shimmer-gold": "shimmer-gold 3s ease-in-out infinite alternate",
        "card-glow": "card-glow 6s ease-in-out infinite alternate",
        "card-glow-amber": "card-glow-amber 6s ease-in-out infinite alternate",
        "faq-divider-shimmer": "faq-divider-shimmer 3s linear infinite",
        "float-up": "float-up 8s ease-in infinite",
        "ticker-scroll": "ticker-scroll 30s linear infinite",
        "pop-in": "pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
        "radial-wipe": "radial-wipe 6s cubic-bezier(0.87, 0, 0.13, 1) forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
