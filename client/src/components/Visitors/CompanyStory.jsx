import React from 'react';
import { useTranslation } from 'react-i18next';

const CompanyStory = () => {
  const { t } = useTranslation();
  
  return (
    <section className="py-16 md:py-18 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('aboutPage.companyStory.title')}
          </h2>
          <div className="w-24 h-1 bg-blue-600 dark:bg-yellow-500 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {t('aboutPage.companyStory.subtitle')}
          </p>
        </div>

        {/* Story Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1528543606781-2f6e6857f318?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                alt="Professional Tourism Services"
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white text-2xl font-bold">{t('aboutPage.companyStory.imageOverlay')}</p>
              </div>
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                {t('aboutPage.companyStory.paragraph1')}
                <span className="font-semibold text-blue-600 dark:text-yellow-500"> {t('aboutPage.companyStory.rahalatek')}</span> {t('aboutPage.companyStory.paragraph1End')}
              </p>
              
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                {t('aboutPage.companyStory.paragraph2')}
              </p>

              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                {t('aboutPage.companyStory.paragraph3')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompanyStory;

