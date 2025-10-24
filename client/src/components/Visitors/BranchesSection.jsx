import React from 'react';
import { useTranslation } from 'react-i18next';

const BranchesSection = () => {
  const { t } = useTranslation();
  
  const branches = [
    {
      id: 1,
      country: t('aboutPage.branches.countries.saudiArabia'),
      countryCode: 'SA',
      city: t('aboutPage.branches.openingSoon'),
      status: 'opening'
    },
    {
      id: 2,
      country: t('aboutPage.branches.countries.syria'),
      countryCode: 'SY',
      city: t('aboutPage.branches.cities.aleppo'),
      status: 'active'
    },
    {
      id: 3,
      country: t('aboutPage.branches.countries.turkey'),
      countryCode: 'TR',
      city: t('aboutPage.branches.cities.istanbul'),
      status: 'active'
    },
    {
      id: 4,
      country: t('aboutPage.branches.countries.morocco'),
      countryCode: 'MA',
      city: t('aboutPage.branches.cities.tangier'),
      status: 'active'
    },
    {
      id: 5,
      country: t('aboutPage.branches.countries.kuwait'),
      countryCode: 'KW',
      city: t('aboutPage.branches.openingSoon'),
      status: 'opening'
    }
  ];

  return (
    <section className="py-16 md:py-20 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">
            {t('aboutPage.branches.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
            {t('aboutPage.branches.subtitle')}
          </p>
        </div>

        {/* Branches Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
          {branches.map((branch) => (
            <div
              key={branch.id}
              className={`group flex flex-col items-center ${
                branch.country === 'Turkey' ? 'sm:col-span-2 lg:col-span-1' : ''
              }`}
            >
              {/* Flag Card */}
              <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-slate-800 mb-4 w-full">
                <div className="h-40 overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900">
                  <img 
                    src={`https://flagcdn.com/w320/${branch.countryCode.toLowerCase()}.png`}
                    alt={`${branch.country} flag`}
                    className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                
                {/* Hover Effect */}
                <div className="absolute inset-0 border-2 border-blue-500 dark:border-yellow-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>

              {/* Country and City - Outside Card */}
              <div className="text-center">
                <h3 className={`font-bold text-gray-900 dark:text-white mb-1 ${
                  branch.country === 'Turkey' ? 'text-xl' : 'text-lg'
                }`}>
                  {branch.country}
                </h3>
                <p className={`text-sm font-medium ${
                  branch.status === 'opening' 
                    ? 'text-blue-600 dark:text-yellow-400' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {branch.city}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BranchesSection;

