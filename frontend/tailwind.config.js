/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "rgb(var(--bg-primary) / <alpha-value>)",
          surface: "rgb(var(--bg-surface) / <alpha-value>)",
          elevated: "rgb(var(--bg-elevated) / <alpha-value>)"
        },
        border: "rgb(var(--border) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          light: "rgb(var(--primary-light) / <alpha-value>)"
        },
        success: "rgb(var(--success) / <alpha-value>)",
        info: "rgb(var(--info) / <alpha-value>)",
        warning: "rgb(var(--warning) / <alpha-value>)",
        error: "rgb(var(--error) / <alpha-value>)",
        text: {
          primary: "rgb(var(--text-primary) / <alpha-value>)",
          muted: "rgb(var(--text-muted) / <alpha-value>)",
          subtle: "rgb(var(--text-subtle) / <alpha-value>)"
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(124, 58, 237, 0.3), 0 0 30px rgba(124, 58, 237, 0.18)",
        card: "0 20px 40px rgba(6, 8, 18, 0.25)"
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top, rgba(124, 58, 237, 0.25), transparent 35%), radial-gradient(circle at bottom right, rgba(59, 130, 246, 0.18), transparent 30%), linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 60%)",
        "panel-noise":
          "linear-gradient(120deg, rgba(255,255,255,0.04), rgba(255,255,255,0)), radial-gradient(circle at 20% 20%, rgba(124, 58, 237, 0.18), transparent 30%)"
      },
      animation: {
        "fade-in": "fadeIn 200ms ease-out forwards",
        "slide-up": "slideUp 240ms ease-out forwards",
        float: "float 8s ease-in-out infinite",
        shimmer: "shimmer 1.6s linear infinite",
        pulseSoft: "pulseSoft 1.6s ease-in-out infinite",
        shake: "shake 360ms ease-in-out",
        glow: "glow 2.2s ease-in-out infinite"
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        float: {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -12px, 0)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.75" },
          "50%": { opacity: "1" }
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-8px)" },
          "75%": { transform: "translateX(8px)" }
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 0 1px rgba(124, 58, 237, 0.35), 0 0 0 rgba(124, 58, 237, 0)" },
          "50%": { boxShadow: "0 0 0 1px rgba(124, 58, 237, 0.5), 0 0 24px rgba(124, 58, 237, 0.24)" }
        }
      }
    }
  },
  plugins: []
};
