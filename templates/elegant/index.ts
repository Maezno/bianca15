import type { InvitationTemplate } from '../types';
import { elegantTheme } from './theme';
import { ElegantEvent } from './components/ElegantEvent';
import { ElegantInvitation } from './components/ElegantInvitation';

export const elegantTemplate: InvitationTemplate = {
  id: 'elegant',
  name: 'Elegant',
  version: '1.0.0',
  description: 'Plantilla clásica y minimalista con estética limpia, tipografía editorial y tonos cálidos.',
  capabilities: ['countdown', 'dress_code', 'gifts', 'maps', 'share', 'custom_confirmation', 'schedule'],
  sections: ['hero', 'welcome', 'countdown', 'date', 'location', 'schedule', 'dress_code', 'gifts', 'confirmation', 'photos', 'share', 'footer'],
  supportedSections: ['hero', 'welcome', 'countdown', 'date', 'location', 'schedule', 'dress_code', 'gifts', 'confirmation', 'photos', 'share', 'footer'],
  colorPresets: [
    {
      id: 'original',
      name: 'Champán Editorial',
      colors: {
        primary: '#c9a96e',
        secondary: '#1c1c1e',
        background: '#faf9f6',
        surface: '#ffffff',
        text: '#1c1c1e',
        accent: '#9a7b4f',
      },
    },
    {
      id: 'monochrome',
      name: 'Blanco & Negro Minimal',
      colors: {
        primary: '#09090b',
        secondary: '#27272a',
        background: '#ffffff',
        surface: '#f4f4f5',
        text: '#09090b',
        accent: '#52525b',
      },
    },
    {
      id: 'rose-gold',
      name: 'Rose & Warm Gold',
      colors: {
        primary: '#be185d',
        secondary: '#831843',
        background: '#fff1f2',
        surface: '#ffffff',
        text: '#4c0519',
        accent: '#e11d48',
      },
    },
  ],
  theme: elegantTheme,
  EventPage: ElegantEvent,
  InvitationPage: ElegantInvitation,
};
