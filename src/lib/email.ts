import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;

export const resend = apiKey ? new Resend(apiKey) : null;

export const MAIL_FROM =
  process.env.RESEND_FROM ?? 'Travel2Rescue <kontakt@travel2rescue.de>';

export const MAIL_TO = process.env.RESEND_TO ?? 'travel2rescue@gmail.com';

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
