import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ContactForm from '../../components/ContactForm';
import { FaEnvelope, FaWhatsapp, FaInstagram, FaPhone, FaYoutube } from 'react-icons/fa';

export default function ContactUsPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  useEffect(() => {
    document.title = 'Contact Us | Rahalatek';
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'Get in touch with Rahalatek. Contact us for tour bookings, hotel reservations, custom packages, and any travel inquiries. We\'re here to help plan your perfect journey.'
      );
    }

    // Update keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 
        'contact Rahalatek, customer support, travel inquiries, tour booking contact, hotel reservations contact, travel agency contact, tourism help, contact us'
      );
    }

    // Update Open Graph
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', 'Contact Us - Rahalatek | Get in Touch');
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', 
        'Get in touch with Rahalatek for tour bookings, hotel reservations, and travel inquiries.'
      );
    }
  }, []);

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

