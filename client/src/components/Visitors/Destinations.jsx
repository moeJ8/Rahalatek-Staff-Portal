import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FaMapMarkerAlt } from 'react-icons/fa';
import Flag from 'react-world-flags';
import HorizontalScrollbar from '../HorizontalScrollbar';
import { useLocalizedNavigate } from '../../hooks/useLocalizedNavigate';

const Destinations = () => {
  const { t, i18n } = useTranslation();
  const navigate = useLocalizedNavigate();
  const isRTL = i18n.language === 'ar';

  // Static destinations data with high-quality optimized Cloudinary images
  const destinations = useMemo(() => [
    {
      name: 'Turkey',
      code: 'TR',
      image: 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_80,w_600,h_450,c_fill,g_auto,dpr_auto/v1759680467/turkey_uabvzb.jpg'
    },
    {
      name: 'Malaysia',
      code: 'MY', 
      image: 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_80,w_600,h_450,c_fill,g_auto,dpr_auto/v1759681612/malaysia_y1j9qm.jpg'
    },
    {
      name: 'Thailand',
      code: 'TH',
      image: 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_80,w_600,h_450,c_fill,g_auto,dpr_auto/v1759681613/thailand_mevzsd.jpg'
    },
    {
      name: 'Indonesia',
      code: 'ID',
      image: 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_80,w_600,h_450,c_fill,g_auto,dpr_auto/v1759681593/indonesia_z0it15.jpg'
    },
    {
      name: 'Saudi Arabia',
      code: 'SA',
      image: 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_80,w_600,h_450,c_fill,g_auto,dpr_auto/v1759681608/saudi-arabia_n7v7gs.jpg'
    },
    {
      name: 'Morocco',
      code: 'MA',
      image: 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_80,w_600,h_450,c_fill,g_auto,dpr_auto/v1759681610/morocco_hll4kh.jpg'
    },
    {
      name: 'Egypt',
      code: 'EG',
      image: 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_80,w_600,h_450,c_fill,g_auto,dpr_auto/v1759681770/egypt_ehyxvu.jpg'
    },
    {
      name: 'Azerbaijan',
      code: 'AZ',
      image: 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_80,w_600,h_450,c_fill,g_auto,dpr_auto/v1759681625/azerbaijan_d4mecb.jpg'
    },
    {
      name: 'Georgia',
      code: 'GE',
      image: 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_80,w_600,h_450,c_fill,g_auto,dpr_auto/v1759681595/georgia_id0au5.jpg'
    },
    {
      name: 'Albania',
      code: 'AL',
      image: 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_80,w_600,h_450,c_fill,g_auto,dpr_auto/v1759681631/albania_ftb9qt.jpg'
    }
  ], []);


  // Memoized DestinationCard component for better performance
  const DestinationCard = React.memo(({ destination }) => {
    const handleCardClick = () => {
      navigate(`/country/${encodeURIComponent(destination.name)}`);
    };

    return (
      <div 
        className="relative bg-white dark:bg-slate-900 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 group h-40 sm:h-48 md:h-56 w-full cursor-pointer"
        onClick={handleCardClick}
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={destination.image}
            alt={destination.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 will-change-transform"
            loading="lazy"
            decoding="async"
            width="400"
            height="300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        </div>

        {/* Flag Icon */}
        <div className="absolute top-3 right-3 z-10">
          <Flag 
            code={destination.code} 
            height="24" 
            width="32"
            className="rounded-sm shadow-md border border-white/20"
          />
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 md:p-6 text-white z-10">
          {/* Country Name */}
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold group-hover:text-yellow-300 dark:group-hover:text-blue-400 transition-colors">
            {t(`countryPage.countryNames.${destination.name}`, destination.name)}
          </h3>
        </div>
      </div>
    );
  });

  return (
    <section className="py-6 sm:py-8 md:py-12" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">
            {t('home.destinations.title')}
          </h2>
          <div className={`flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 text-sm sm:text-base ${isRTL ? 'flex-row-reverse' : ''}`}>
            <FaMapMarkerAlt className="hidden sm:block w-4 h-4" />
            <p>{t('home.destinations.subtitle')}</p>
          </div>
        </div>

        {/* Destinations Horizontal Scroll */}
        <HorizontalScrollbar className="pb-4">
          <div className="flex gap-6" style={{ width: 'max-content' }}>
            {destinations.map((destination) => (
              <div key={destination.code} className="flex-shrink-0 w-[385px]">
                <DestinationCard destination={destination} />
              </div>
            ))}
          </div>
        </HorizontalScrollbar>
        </div>
    </section>
  );
};

export default Destinations;
