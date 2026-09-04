import type { InvitationTemplate } from '../types';
import { wonderlandTheme } from './theme';
import { WonderlandEvent } from './components/WonderlandEvent';
import { WonderlandInvitation } from './components/WonderlandInvitation';

export const wonderlandTemplate: InvitationTemplate = {
  id: 'wonderland',
  name: 'Wonderland',
  version: '1.0.0',
  description: 'Plantilla teatral inspirada en fantasía y cartas, con detalles en dorado y carmín.',
  capabilities: ['countdown', 'dress_code', 'gifts', 'maps', 'share', 'custom_confirmation', 'schedule'],
  sections: ['hero', 'welcome', 'countdown', 'date', 'location', 'schedule', 'dress_code', 'gifts', 'confirmation', 'photos', 'share', 'footer'],
  supportedSections: ['hero', 'welcome', 'countdown', 'date', 'location', 'schedule', 'dress_code', 'gifts', 'confirmation', 'photos', 'share', 'footer'],
  colorPresets: [
    {
      id: 'original',
      name: 'Original (Dorado & Carmín)',
      colors: {
        primary: '#c5a028',
        secondary: '#8b0000',
        background: '#0a0a0f',
        surface: '#14141d',
        text: '#f8fafc',
        accent: '#dc2626',
      },
    },
    {
      id: 'midnight-ruby',
      name: 'Rojo & Negro',
      colors: {
        primary: '#e11d48',
        secondary: '#000000',
        background: '#09090b',
        surface: '#18181b',
        text: '#fafafa',
        accent: '#f43f5e',
      },
    },
    {
      id: 'royal-emerald',
      name: 'Esmeralda & Oro',
      colors: {
        primary: '#10b981',
        secondary: '#064e3b',
        background: '#022c22',
        surface: '#064e3b',
        text: '#ecfdf5',
        accent: '#34d399',
      },
    },
  ],
  theme: wonderlandTheme,
  EventPage: WonderlandEvent,
  InvitationPage: WonderlandInvitation,
};
