import React from 'react';
import type { PublicEvent } from '@/types/event';
import type { PublicGuestGroup } from '@/lib/guests/types';
import type { ExistingConfirmation } from '@/lib/confirmations/types';

export interface TemplateTheme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    accent: string;
    border: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
  };
  styles?: Record<string, string>;
}

export interface EventPageProps {
  event: PublicEvent;
}

export interface InvitationPageProps {
  event: PublicEvent;
  guestGroup: PublicGuestGroup;
  existingConfirmation: ExistingConfirmation | null;
}

export interface InvitationTemplate {
  id: string;
  name: string;
  version: string;
  description: string;
  capabilities: string[];
  sections: string[];
  theme: TemplateTheme;
  EventPage: React.ComponentType<EventPageProps>;
  InvitationPage: React.ComponentType<InvitationPageProps>;
}
