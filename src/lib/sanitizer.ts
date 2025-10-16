/**
 * Sanitizer utilities for user-generated content
 */

import { INPUT_VALIDATION } from './constants';

const CONTROL_CHARACTERS_REGEX = /[\u0000-\u001F\u007F]+/g;
const SCRIPT_TAG_REGEX = /<script[\s\S]*?>[\s\S]*?<\/script>/gi;

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function sanitizeContent(value: string): string {
  if (typeof value !== 'string') {
    return '';
  }

  let sanitized = value.replace(SCRIPT_TAG_REGEX, '');
  sanitized = sanitized.replace(CONTROL_CHARACTERS_REGEX, '');
  sanitized = normalizeWhitespace(sanitized);

  if (sanitized.length > INPUT_VALIDATION.MAX_CONTENT_LENGTH) {
    sanitized = sanitized.slice(0, INPUT_VALIDATION.MAX_CONTENT_LENGTH);
  }

  return sanitized;
}

export function sanitizeFeeling(value: string): string {
  if (typeof value !== 'string') {
    return '';
  }

  let sanitized = value.replace(CONTROL_CHARACTERS_REGEX, '');
  sanitized = normalizeWhitespace(sanitized);

  if (sanitized.length > INPUT_VALIDATION.MAX_FEELING_LENGTH) {
    sanitized = sanitized.slice(0, INPUT_VALIDATION.MAX_FEELING_LENGTH);
  }

  return sanitized;
}
