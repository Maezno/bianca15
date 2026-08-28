import type { TemplateTheme } from '../types';

export const elegantTheme: TemplateTheme = {
  colors: {
    primary: '#c9a96e', // Champagne gold accent
    secondary: '#2c3e50', // Soft deep navy
    background: '#faf9f6', // Alabaster / warm off-white
    surface: '#ffffff', // Crisp pure white card
    text: '#1c1c1e', // Dark charcoal
    textMuted: '#6b7280', // Medium slate gray
    accent: '#d4af37', // Warm metallic gold
    border: '#e5e0d8', // Delicate warm beige border
  },
  typography: {
    headingFont: 'Cormorant Garamond, Garamond, Georgia, serif',
    bodyFont: 'Lato, system-ui, -apple-system, sans-serif',
  },
  styles: {
    cardShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
  },
};
