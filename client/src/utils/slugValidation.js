/**
 * Slug validation utilities for tours
 */

/**
 * Validates if a slug is SEO-friendly
 * @param {string} slug - The slug to validate
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateSlug = (slug) => {
  // Check if slug is empty
  if (!slug || slug.trim() === '') {
    return { isValid: true, message: '' }; // Empty is valid (will use auto-generated)
  }

  const trimmedSlug = slug.trim();

  // Check minimum length
  if (trimmedSlug.length < 3) {
    return { 
      isValid: false, 
      message: 'Slug must be at least 3 characters long' 
    };
  }

  // Check maximum length
  if (trimmedSlug.length > 100) {
    return { 
      isValid: false, 
      message: 'Slug cannot exceed 100 characters' 
    };
  }

  // Check for valid characters (lowercase letters, numbers, hyphens)
  const validSlugPattern = /^[a-z0-9-]+$/;
  if (!validSlugPattern.test(trimmedSlug)) {
    return { 
      isValid: false, 
      message: 'Slug can only contain lowercase letters, numbers, and hyphens' 
    };
  }

  // Check if it starts or ends with hyphen
  if (trimmedSlug.startsWith('-') || trimmedSlug.endsWith('-')) {
    return { 
      isValid: false, 
      message: 'Slug cannot start or end with a hyphen' 
    };
  }

  // Check for consecutive hyphens
  if (trimmedSlug.includes('--')) {
    return { 
      isValid: false, 
      message: 'Slug cannot contain consecutive hyphens' 
    };
  }

  // Check for reserved words/patterns
  const reservedWords = [
    'admin', 'api', 'www', 'mail', 'ftp', 'localhost', 'undefined', 'null',
    'create', 'edit', 'delete', 'new', 'add', 'remove', 'update'
  ];
  
  if (reservedWords.includes(trimmedSlug.toLowerCase())) {
    return { 
      isValid: false, 
      message: `"${trimmedSlug}" is a reserved word and cannot be used as a slug` 
    };
  }

  return { isValid: true, message: '' };
};

/**
 * Formats a string to be SEO-friendly slug format (for final processing)
 * @param {string} input - The input string to format
 * @returns {string} - Formatted slug
 */
export const formatSlug = (input) => {
  if (!input) return '';
  
  return input
    .toLowerCase()
    .trim()
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove special characters except hyphens
    .replace(/[^a-z0-9-]/g, '')
    // Remove consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, '');
};

/**
 * Formats input during typing (less aggressive)
 * @param {string} input - The input string to format
 * @returns {string} - Formatted slug (preserves user typing flow)
 */
export const formatSlugWhileTyping = (input) => {
  if (!input) return '';
  
  return input
    .toLowerCase()
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove special characters except hyphens (but allow user to type)
    .replace(/[^a-z0-9-]/g, '')
    // Remove consecutive hyphens (but allow user to type)
    .replace(/-{3,}/g, '--'); // Only remove 3+ consecutive hyphens
};

/**
 * Generates a preview of what the slug will look like
 * @param {string} slug - The current slug input
 * @param {string} tourName - The tour name for fallback
 * @returns {string} - Preview slug
 */
export const getSlugPreview = (slug, tourName) => {
  if (slug && slug.trim()) {
    return formatSlug(slug);
  }
  
  if (tourName && tourName.trim()) {
    return formatSlug(tourName) + ' (auto-generated)';
  }
  
  return 'tour-name (auto-generated)';
};
