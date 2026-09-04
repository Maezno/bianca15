import type { TemplateTheme } from '@/templates/types';
import type { PublicEvent } from '@/types/event';
import type { PublicGuestGroup } from '@/lib/guests/types';
import type { ExistingConfirmation } from '@/lib/confirmations/types';

export interface SectionBaseProps {
  event: PublicEvent;
  theme: TemplateTheme;
  guestGroup?: PublicGuestGroup | null;
  existingConfirmation?: ExistingConfirmation | null;
}
