/**
 * Utility functions for handling translations in dynamic content
 * Base fields are English, and translations provide Arabic and French
 * German and Turkish will use English as fallback
 */

/**
 * Get the display language code that maps to our translation fields
 * @param {string} i18nLanguage - The language from i18n.language
 * @returns {string} - The language code to use for translations (ar, en, fr)
 */
export const getTranslationLang = (i18nLanguage) => {
  const langMap = {
    'ar': 'ar',
    'en': 'en',
    'fr': 'fr',
    'de': 'en', // German uses English
    'tr': 'en'  // Turkish uses English
  };

  return langMap[i18nLanguage] || 'en';
};

/**
 * Get translated text from a tour field
 * Base fields are assumed to be in English
 * @param {Object} tour - The tour object
 * @param {string} field - The field name (e.g., 'name', 'description', 'detailedDescription')
 * @param {string} language - The current i18n language
 * @returns {string} - The translated text or fallback to English base field
 */
export const getTranslatedText = (tour, field, language) => {
  const lang = getTranslationLang(language);

  // For English, always return the base field
  if (lang === 'en') {
    return tour[field] || '';
  }

  // For other languages, try to get translation from translations object
  if (tour.translations && tour.translations[field] && tour.translations[field][lang]) {
    const translation = tour.translations[field][lang];

    // If translation exists and is not empty, return it
    if (translation && translation.trim() !== '') {
      return translation;
    }
  }

  // Fallback to base field (English)
  return tour[field] || '';
};

/**
 * Get translated array of highlights or policies
 * Base arrays are assumed to be in English
 * @param {Object} tour - The tour object
 * @param {string} field - The field name ('highlights' or 'policies')
 * @param {string} language - The current i18n language
 * @returns {Array<string>} - Array of translated texts
 */
export const getTranslatedArray = (tour, field, language) => {
  const lang = getTranslationLang(language);

  // Get base array
  const baseArray = tour[field] || [];

  // For English, return base array directly
  if (lang === 'en') {
    return baseArray;
  }

  // For other languages, try to get translations
  const translations = tour.translations?.[field] || [];

  return baseArray.map((item, index) => {
    const translation = translations[index]?.[lang];

    // If translation exists and is not empty, return it
    if (translation && translation.trim() !== '') {
      return translation;
    }

    // Fallback to original English item
    return item;
  });
};

/**
 * Get translated FAQs
 * Base FAQs are assumed to be in English
 * @param {Object} tour - The tour object
 * @param {string} language - The current i18n language
 * @returns {Array<{question: string, answer: string}>} - Array of translated FAQs
 */
export const getTranslatedFaqs = (tour, language) => {
  const lang = getTranslationLang(language);
  
  // Get base FAQs array
  const baseFaqs = tour.faqs || [];
  
  // For English, return base FAQs directly
  if (lang === 'en') {
    return baseFaqs;
  }
  
  // For other languages, try to get translations
  const translations = tour.translations?.faqs || [];
  
  return baseFaqs.map((faq, index) => {
    const translation = translations[index];
    
    return {
      question: (translation?.question?.[lang] && translation.question[lang].trim() !== '') 
        ? translation.question[lang] 
        : faq.question,
      answer: (translation?.answer?.[lang] && translation.answer[lang].trim() !== '') 
        ? translation.answer[lang] 
        : faq.answer
    };
  });
};

/**
 * Get translated field based on current language
 * This is a convenience function that extracts common patterns
 */
export const getTourTranslation = (tour, field, i18nLanguage) => {
  if (field === 'highlights' || field === 'policies') {
    return getTranslatedArray(tour, field, i18nLanguage);
  }

  return getTranslatedText(tour, field, i18nLanguage);
};
