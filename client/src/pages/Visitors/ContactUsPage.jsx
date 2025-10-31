import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ContactForm from '../../components/ContactForm';
import { FaEnvelope, FaWhatsapp, FaInstagram, FaPhone, FaYoutube } from 'react-icons/fa';

export default function ContactUsPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  useEffect(() => {
    const baseUrl = window.location.origin;
    const currentLang = i18n.language;
    
    // Language-specific content
    const content = {
      en: {
        title: 'Contact Us - Rahalatek',
        description: 'Get in touch with Rahalatek. Contact us for tour bookings, hotel reservations, custom packages, and any travel inquiries. We\'re here to help plan your perfect journey.',
        keywords: 'contact Rahalatek, customer support, travel inquiries, tour booking contact, hotel reservations contact, travel agency contact, tourism help, contact us',
        ogLocale: 'en_US'
      },
      ar: {
        title: 'اتصل بنا - رحلاتك',
        description: 'تواصل مع رحلاتك. اتصل بنا لحجز الجولات، حجوزات الفنادق، الباقات المخصصة، وأي استفسارات سفر. نحن هنا لمساعدتك في التخطيط لرحلتك المثالية.',
        keywords: 'اتصل برحلاتك, دعم العملاء, استفسارات السفر, حجز جولات, حجز فنادق, وكالة سفر, مساعدة سياحة, اتصل بنا',
        ogLocale: 'ar_SA'
      },
      fr: {
        title: 'Contactez-Nous - Rahalatek',
        description: 'Contactez Rahalatek. Contactez-nous pour les réservations de visites, les réservations d\'hôtels, les forfaits personnalisés et toute demande de voyage. Nous sommes là pour vous aider à planifier votre voyage parfait.',
        keywords: 'contacter Rahalatek, support client, demandes voyage, contact réservation visite, contact réservation hôtel, contact agence voyage, aide tourisme, contactez-nous',
        ogLocale: 'fr_FR'
      }
    };

    const langContent = content[currentLang] || content.en;

    // Update page title
    document.title = langContent.title;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', langContent.description);
    }

    // Update keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', langContent.keywords);
    }

    // Update Open Graph
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', langContent.title);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', langContent.description);
    }

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) {
      ogImage.setAttribute('content', `${baseUrl}/last-logo-3.png`);
    }

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', window.location.href);
    }

    // Add multiple og:locale tags for all languages
    const existingOgLocales = document.querySelectorAll('meta[property="og:locale"]');
    existingOgLocales.forEach(tag => tag.remove());

    // Add og:locale for current language (primary)
    let ogLocale = document.createElement('meta');
    ogLocale.setAttribute('property', 'og:locale');
    ogLocale.setAttribute('content', langContent.ogLocale);
    document.head.appendChild(ogLocale);

    // Add alternate og:locale for other languages
    const alternateLocales = [
      { lang: 'en', locale: 'en_US' },
      { lang: 'ar', locale: 'ar_SA' },
      { lang: 'fr', locale: 'fr_FR' }
    ].filter(loc => loc.lang !== currentLang);

    alternateLocales.forEach(({ locale }) => {
      const altLocale = document.createElement('meta');
      altLocale.setAttribute('property', 'og:locale:alternate');
      altLocale.setAttribute('content', locale);
      document.head.appendChild(altLocale);
    });

    // Update Twitter Card
    const twitterCard = document.querySelector('meta[name="twitter:card"]');
    if (twitterCard) {
      twitterCard.setAttribute('content', 'summary_large_image');
    }

    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', langContent.title);
    }

    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', langContent.description);
    }

    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage) {
      twitterImage.setAttribute('content', `${baseUrl}/last-logo-3.png`);
    }

    // Add canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${baseUrl}/contact`;

    // Remove existing hreflang tags
    const existingHreflangs = document.querySelectorAll('link[rel="alternate"][hreflang]');
    existingHreflangs.forEach(tag => tag.remove());

    // Add hreflang tags for all language versions
    const languages = [
      { code: 'en', path: '/contact' },
      { code: 'ar', path: '/ar/contact' },
      { code: 'fr', path: '/fr/contact' }
    ];

    languages.forEach(({ code, path }) => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = code;
      link.href = `${baseUrl}${path}`;
      document.head.appendChild(link);
    });

    // Add x-default pointing to English
    const defaultLink = document.createElement('link');
    defaultLink.rel = 'alternate';
    defaultLink.hreflang = 'x-default';
    defaultLink.href = `${baseUrl}/contact`;
    document.head.appendChild(defaultLink);
  }, [i18n.language]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-4">
        {/* Page Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('contactPage.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
            {t('contactPage.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* Contact Information */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
                {t('contactPage.contactInformation')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                {t('contactPage.contactDescription')}
              </p>
            </div>

            {/* Contact Cards */}
            <div className="space-y-4">
              {/* WhatsApp */}
              <a
                href="https://wa.me/905010684657"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-4 bg-white dark:bg-slate-950 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaWhatsapp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    {t('contactPage.whatsapp')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm" dir="ltr">
                    +90 501 068 46 57
                  </p>
                </div>
              </a>

              {/* Email */}
              <a
                href="mailto:info@rahalatek.com"
                className="flex items-start gap-4 p-4 bg-white dark:bg-slate-950 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaEnvelope className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {t('contactPage.email')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm" dir="ltr">
                    info@rahalatek.com
                  </p>
                </div>
              </a>

              {/* Phone */}
              <a
                href="tel:+905010684657"
                className="flex items-start gap-4 p-4 bg-white dark:bg-slate-950 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaPhone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {t('contactPage.phone')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm" dir="ltr">
                    +90 501 068 46 57
                  </p>
                </div>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/rahalatek_/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-4 bg-white dark:bg-slate-950 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-pink-500 dark:hover:border-pink-500 hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaInstagram className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                    {t('contactPage.instagram')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm" dir="ltr">
                    @rahalatek_
                  </p>
                </div>
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <ContactForm />
          </div>
        </div>

        {/* YouTube Call to Action */}
        <div className="mt-6 mb-2">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-400 dark:from-red-500 dark:to-orange-500 rounded-2xl opacity-20 group-hover:opacity-30 blur transition duration-300"></div>
            <a
              href="https://www.youtube.com/@rahalatek"
              target="_blank"
              rel="noopener noreferrer"
              className="relative flex flex-col sm:flex-row items-center gap-6 bg-white dark:bg-slate-950 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:border-red-500 dark:hover:border-red-400 transition-all duration-300"
            >
              <div className="flex-shrink-0 w-20 h-20 bg-red-600 dark:bg-red-500 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <FaYoutube className="w-12 h-12 text-white" />
              </div>
              <div className={`flex-1 text-center ${isRTL ? 'sm:text-right' : 'sm:text-left'}`}>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                  {t('contactPage.followYoutube')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('contactPage.youtubeDescription')}
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

