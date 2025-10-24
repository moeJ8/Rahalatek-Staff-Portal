import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaAward, FaHeadset, FaUserTie, FaMoneyBillWave, FaMapMarkedAlt, FaShieldAlt } from 'react-icons/fa';

const WhyChooseUs = () => {
  const { t } = useTranslation();
  
  const features = [
    {
      id: 1,
      icon: FaAward,
      title: t('aboutPage.whyChooseUs.yearsOfExperience'),
      description: t('aboutPage.whyChooseUs.yearsOfExperienceDesc'),
      color: 'blue'
    },
    {
      id: 2,
      icon: FaHeadset,
      title: t('aboutPage.whyChooseUs.support247'),
      description: t('aboutPage.whyChooseUs.support247Desc'),
      color: 'green'
    },
    {
      id: 3,
      icon: FaUserTie,
      title: t('aboutPage.whyChooseUs.expertTeam'),
      description: t('aboutPage.whyChooseUs.expertTeamDesc'),
      color: 'purple'
    },
    {
      id: 4,
      icon: FaMoneyBillWave,
      title: t('aboutPage.whyChooseUs.bestPrices'),
      description: t('aboutPage.whyChooseUs.bestPricesDesc'),
      color: 'orange'
    },
    {
      id: 5,
      icon: FaMapMarkedAlt,
      title: t('aboutPage.whyChooseUs.tailoredPackages'),
      description: t('aboutPage.whyChooseUs.tailoredPackagesDesc'),
      color: 'red'
    },
    {
      id: 6,
      icon: FaShieldAlt,
      title: t('aboutPage.whyChooseUs.safetyFirst'),
      description: t('aboutPage.whyChooseUs.safetyFirstDesc'),
      color: 'cyan'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700',
        hover: 'group-hover:border-blue-500 dark:group-hover:border-blue-400',
        text: 'group-hover:text-blue-600 dark:group-hover:text-blue-400'
      },
      green: {
        bg: 'from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700',
        hover: 'group-hover:border-green-500 dark:group-hover:border-green-400',
        text: 'group-hover:text-green-600 dark:group-hover:text-green-400'
      },
      purple: {
        bg: 'from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700',
        hover: 'group-hover:border-purple-500 dark:group-hover:border-purple-400',
        text: 'group-hover:text-purple-600 dark:group-hover:text-purple-400'
      },
      orange: {
        bg: 'from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700',
        hover: 'group-hover:border-orange-500 dark:group-hover:border-orange-400',
        text: 'group-hover:text-orange-600 dark:group-hover:text-orange-400'
      },
      red: {
        bg: 'from-red-500 to-red-600 dark:from-red-600 dark:to-red-700',
        hover: 'group-hover:border-red-500 dark:group-hover:border-red-400',
        text: 'group-hover:text-red-600 dark:group-hover:text-red-400'
      },
      cyan: {
        bg: 'from-cyan-500 to-cyan-600 dark:from-cyan-600 dark:to-cyan-700',
        hover: 'group-hover:border-cyan-500 dark:group-hover:border-cyan-400',
        text: 'group-hover:text-cyan-600 dark:group-hover:text-cyan-400'
      }
    };
    return colors[color] || colors.blue;
  };

  return (
    <section className="py-16 md:py-20 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">
            {t('aboutPage.whyChooseUs.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
            {t('aboutPage.whyChooseUs.subtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => {
            const colorClasses = getColorClasses(feature.color);
            return (
              <div
                key={feature.id}
                className={`group relative bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 dark:border-slate-800 ${colorClasses.hover} hover:-translate-y-2`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Background Gradient on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent dark:from-slate-800 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`w-16 h-16 bg-gradient-to-br ${colorClasses.bg} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                    <feature.icon className="text-white text-3xl" />
                  </div>

                  {/* Title */}
                  <h3 className={`text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3 transition-colors ${colorClasses.text}`}>
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Decorative Corner */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-transparent to-gray-100 dark:to-slate-800 opacity-50 rounded-br-2xl rounded-tl-full"></div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800 p-8 md:p-10 rounded-2xl border border-blue-200 dark:border-slate-700">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('aboutPage.whyChooseUs.experienceTitle')}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-lg mb-6 max-w-2xl mx-auto">
              {t('aboutPage.whyChooseUs.experienceText')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 dark:bg-yellow-600 text-white font-semibold rounded-lg hover:bg-blue-700 dark:hover:bg-yellow-700 transition-colors duration-300 shadow-lg hover:shadow-xl"
              >
                {t('aboutPage.whyChooseUs.startPlanning')}
              </a>
              <a
                href="/packages"
                className="inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-slate-950 text-blue-600 dark:text-yellow-500 font-semibold rounded-lg border-2 border-blue-600 dark:border-yellow-600 hover:bg-blue-50 dark:hover:bg-slate-900 transition-colors duration-300"
              >
                {t('aboutPage.whyChooseUs.viewPackages')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;

