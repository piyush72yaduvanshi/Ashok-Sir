// NCB Fest Design System
// Consistent colors, spacing, and styles across the application

export const colors = {
  // Primary Brand Colors
  primary: {
    50: "#FFF7ED",
    100: "#FFEDD5",
    200: "#FED7AA",
    300: "#FDBA74",
    400: "#FB923C",
    500: "#F97316", // Main Orange
    600: "#EA580C",
    700: "#C2410C",
    800: "#9A3412",
    900: "#7C2D12",
  },

  // Secondary Colors
  secondary: {
    50: "#FEF3C7",
    100: "#FDE68A",
    200: "#FCD34D",
    300: "#FBBF24",
    400: "#F59E0B", // Amber
    500: "#D97706",
    600: "#B45309",
    700: "#92400E",
    800: "#78350F",
    900: "#451A03",
  },

  // Neutral Colors
  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
  },

  // Status Colors
  success: {
    light: "#D1FAE5",
    main: "#10B981",
    dark: "#059669",
  },
  error: {
    light: "#FEE2E2",
    main: "#EF4444",
    dark: "#DC2626",
  },
  warning: {
    light: "#FEF3C7",
    main: "#F59E0B",
    dark: "#D97706",
  },
  info: {
    light: "#DBEAFE",
    main: "#3B82F6",
    dark: "#2563EB",
  },
};

export const spacing = {
  xs: "0.25rem", // 4px
  sm: "0.5rem", // 8px
  md: "1rem", // 16px
  lg: "1.5rem", // 24px
  xl: "2rem", // 32px
  "2xl": "3rem", // 48px
  "3xl": "4rem", // 64px
};

export const borderRadius = {
  sm: "0.375rem", // 6px
  md: "0.5rem", // 8px
  lg: "0.75rem", // 12px
  xl: "1rem", // 16px
  "2xl": "1.5rem", // 24px
  full: "9999px",
};

export const shadows = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
};

export const typography = {
  fontFamily: {
    sans: '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
    mono: '"Fira Code", "Courier New", monospace',
  },
  fontSize: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
};

// Common Component Styles
export const components = {
  button: {
    primary:
      "px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed",
    secondary:
      "px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
    danger:
      "px-6 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed",
    ghost:
      "px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
  },
  input:
    "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed",
  card: "bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300",
  badge: {
    success: "px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium",
    error: "px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium",
    warning: "px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium",
    info: "px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium",
    default: "px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium",
  },
};

// Animation Variants for Framer Motion
export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },
  stagger: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
};

// Breakpoints
export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};

export default {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
  components,
  animations,
  breakpoints,
};
