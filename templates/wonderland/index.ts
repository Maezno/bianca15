import type { InvitationTemplate } from '../types';
import { wonderlandTheme } from './theme';
import { WonderlandEvent } from './components/WonderlandEvent';
import { WonderlandInvitation } from './components/WonderlandInvitation';

export const wonderlandTemplate: InvitationTemplate = {
  id: 'wonderland',
  name: 'Wonderland',
  version: '1.0.0',
  description: 'Plantilla teatral inspirada en fantasía y cartas, con detalles en dorado y carmín.',
  capabilities: ['countdown', 'dress_code', 'gifts', 'maps', 'share', 'custom_confirmation'],
  sections: ['hero', 'countdown', 'details', 'confirmation', 'share', 'footer'],
  theme: wonderlandTheme,
  EventPage: WonderlandEvent,
  InvitationPage: WonderlandInvitation,
};
