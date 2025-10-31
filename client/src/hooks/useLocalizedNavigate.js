import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * Custom hook that wraps useNavigate and automatically preserves language prefix
 * Uses the same pattern as PublicPackagesPage.jsx
 */
export const useLocalizedNavigate = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  return (to, options) => {
    const lang = i18n.language;
    
    if (typeof to === 'string') {
      // If language is Arabic or French, add language prefix
      if (lang === 'ar' || lang === 'fr') {
        // Only add prefix if it doesn't already exist
        if (!to.startsWith(`/${lang}/`) && !to.startsWith('/ar/') && !to.startsWith('/fr/')) {
          to = `/${lang}${to}`;
        }
      }
    }
    
    return navigate(to, options);
  };
};

/**
 * Helper function to get localized path for Link components
 * @param {string} path - The path to localize
 * @param {string} currentLang - Current language from i18n
 * @returns {string} - Localized path
 */
export const getLocalizedPath = (path, currentLang) => {
  if (typeof path !== 'string') return path;
  
  // If language is Arabic or French, add language prefix
  if (currentLang === 'ar' || currentLang === 'fr') {
    // Only add prefix if it doesn't already exist
    if (!path.startsWith(`/${currentLang}/`) && !path.startsWith('/ar/') && !path.startsWith('/fr/')) {
      return `/${currentLang}${path}`;
    }
  }
  
  return path;
};

