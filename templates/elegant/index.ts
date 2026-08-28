import type { InvitationTemplate } from '../types';
import { elegantTheme } from './theme';
import { ElegantEvent } from './components/ElegantEvent';
import { ElegantInvitation } from './components/ElegantInvitation';

export const elegantTemplate: InvitationTemplate = {
  id: 'elegant',
  name: 'Elegant',
  version: '1.0.0',
  description: 'Plantilla clásica y minimalista con estética limpia, tipografía editorial y tonos cálidos.',
  capabilities: ['countdown', 'dress_code', 'gifts', 'maps', 'share', 'custom_confirmation'],
  sections: ['hero', 'countdown', 'details', 'confirmation', 'share', 'footer'],
  theme: elegantTheme,
  EventPage: ElegantEvent,
  InvitationPage: ElegantInvitation,
};
