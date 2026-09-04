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
  isInteractivePreview?: boolean;
  selectedSectionId?: string | null;
  onUpdateSectionHeight?: (sectionId: string, height: number) => void;
}

export interface InvitationPageProps {
  event: PublicEvent;
  guestGroup: PublicGuestGroup;
  existingConfirmation: ExistingConfirmation | null;
}

export interface ColorPreset {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    accent: string;
  };
}

export interface InvitationTemplate {
  id: string;
  name: string;
  version: string;
  description: string;
  capabilities: string[];
  sections: string[];
  supportedSections?: string[];
  colorPresets?: ColorPreset[];
  theme: TemplateTheme;
  EventPage: React.ComponentType<EventPageProps>;
  InvitationPage: React.ComponentType<InvitationPageProps>;
}
