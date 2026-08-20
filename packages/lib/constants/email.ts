import { env } from '../utils/env';

export const FROM_ADDRESS = env('NEXT_PRIVATE_SMTP_FROM_ADDRESS') || 'noreply@documenso.com';
export const FROM_NAME = env('NEXT_PRIVATE_SMTP_FROM_NAME') || 'Documenso';

// Fork-specific: self-hosted SMTP relays often cap outbound message size
// well below what a signed multi-file envelope needs. Defaults to a safe
// universal value (Gmail's own inbound limit) since most self-hosters won't
// have configured this — set it to match your actual mail relay's limit. See
// packages/lib/utils/estimate-email-attachment-size.ts.
export const SMTP_MAX_MESSAGE_SIZE_MB = Number(env('NEXT_PRIVATE_SMTP_MAX_MESSAGE_SIZE_MB')) || 25;

export const DOCUMENSO_INTERNAL_EMAIL = {
  name: FROM_NAME,
  address: FROM_ADDRESS,
};

export const EMAIL_VERIFICATION_STATE = {
  NOT_FOUND: 'NOT_FOUND',
  VERIFIED: 'VERIFIED',
  EXPIRED: 'EXPIRED',
  ALREADY_VERIFIED: 'ALREADY_VERIFIED',
} as const;

export const USER_SIGNUP_VERIFICATION_TOKEN_IDENTIFIER = 'confirmation-email';
