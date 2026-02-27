import { QuestionValidation } from './types';

/**
 * Check if the input looks like gibberish/random characters.
 * Returns true if the text appears to be nonsensical.
 */
export function isGibberishInput(text: string): boolean {
  if (!text || text.trim().length < 2) return true;

  const trimmed = text.trim();

  // Extract only alphabetic characters for vowel ratio calculation.
  // Prevents markdown/special characters from skewing the ratio.
  const lettersOnly = trimmed.toLowerCase().replace(/[^a-z]/g, '');

  // For very short inputs (like project names), be more lenient.
  if (lettersOnly.length < 10) {
    // Allow any input with substantial content (doc with formatting)
    if (trimmed.length >= 50) return false;

    const hasVowel = /[aeiou]/i.test(lettersOnly);
    if (hasVowel && lettersOnly.length >= 2) return false;

    // No vowels but short — could still be a valid acronym
    if (lettersOnly.length >= 2 && lettersOnly.length <= 6) return false;

    return lettersOnly.length < 2;
  }

  // Check for mostly random characters (low vowel ratio)
  const vowels = lettersOnly.match(/[aeiou]/g);
  const vowelRatio = vowels ? vowels.length / lettersOnly.length : 0;

  if (lettersOnly.length < 20 && vowelRatio < 0.1) return true;
  if (lettersOnly.length >= 20 && vowelRatio < 0.08) return true;

  // Excessive repeated patterns (e.g. "asdfasdfasdf", "aaaaaa")
  const hasRepeatedPattern = /(.{2,})\1{2,}/.test(trimmed.toLowerCase());
  if (hasRepeatedPattern) return true;

  // Keyboard mashing patterns
  const keyboardPatterns = /^[asdfghjkl]+$|^[qwertyuiop]+$|^[zxcvbnm]+$/i;
  if (keyboardPatterns.test(trimmed.replace(/\s/g, ''))) return true;

  // Single repeated character
  if (/^(.)\1+$/.test(trimmed.replace(/\s/g, ''))) return true;

  // Unusual consonant clusters in majority of words
  const words = trimmed.split(/\s+/);
  const gibberishWords = words.filter((word) => {
    if (word.length < 4) return false;
    return /[bcdfghjklmnpqrstvwxyz]{4,}/i.test(word);
  });

  const longerWords = words.filter((w) => w.length >= 4);
  if (longerWords.length > 0 && gibberishWords.length / longerWords.length > 0.5) return true;

  return false;
}

/**
 * Validate that text is meaningful (not gibberish).
 * Returns error message if invalid, null if valid.
 */
export function validateMeaningfulInput(text: string): string | null {
  if (isGibberishInput(text)) {
    return 'Please provide a meaningful response. Your input appears to be random characters.';
  }
  return null;
}

/**
 * Sanitize text to prevent markdown/HTML injection.
 */
export function sanitizeMarkdown(text: string): string {
  return text
    .replace(/\0/g, '')
    .replace(/([*_`#\[\]<>\\])/g, '\\$1')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Sanitize project name specifically — more restrictive.
 */
export function sanitizeProjectName(name: string): string {
  return name
    .replace(/\0/g, '')
    .replace(/[*_`#\[\]<>\\|~^]/g, '')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Validate text against question validation rules.
 * Returns error message if invalid, null if valid.
 */
export function validateAnswer(text: string, validation?: QuestionValidation): string | null {
  if (!validation) return null;

  const trimmed = text.trim();

  if (validation.minLength && trimmed.length < validation.minLength) {
    return `Must be at least ${validation.minLength} characters`;
  }

  if (validation.maxLength && trimmed.length > validation.maxLength) {
    return `Must be ${validation.maxLength} characters or less`;
  }

  if (validation.pattern && !validation.pattern.test(trimmed)) {
    return validation.patternMessage || 'Invalid format';
  }

  return null;
}

/**
 * Apply sanitization if required by validation rules.
 */
export function applySanitization(
  text: string,
  validation?: QuestionValidation,
  questionId?: number
): string {
  if (!validation?.sanitize) return text;
  // Use stricter project name sanitization for Q1
  if (questionId === 1) return sanitizeProjectName(text);
  return sanitizeMarkdown(text);
}
