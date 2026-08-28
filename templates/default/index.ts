import type { InvitationTemplate } from '../types';
import { elegantTemplate } from '../elegant';

export const defaultTemplate: InvitationTemplate = {
  ...elegantTemplate,
  id: 'default',
  name: 'Default (Estándar)',
  description: 'Plantilla base por defecto.',
};
