import type { TemplateTheme } from '../types';

export const wonderlandTheme: TemplateTheme = {
  colors: {
    primary: '#c5a028', // Golden accent
    secondary: '#8b0000', // Crimson red
    background: '#0a0a0f', // Deep dark gothic navy/black
    surface: '#14141d', // Dark card surface
    text: '#f8fafc', // Cream / bright white text
    textMuted: '#94a3b8', // Muted slate
    accent: '#dc2626', // Bright ruby heart accent
    border: 'rgba(197, 160, 40, 0.25)', // Subtle gold border
  },
  typography: {
    headingFont: 'Playfair Display, Georgia, serif',
    bodyFont: 'Montserrat, system-ui, -apple-system, sans-serif',
  },
  styles: {
    cardShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
    goldGlow: '0 0 15px rgba(197, 160, 40, 0.3)',
  },
};
