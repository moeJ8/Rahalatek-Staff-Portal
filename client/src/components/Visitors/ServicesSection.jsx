import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function ServicesSection() {
  const { t } = useTranslation();
  const services = [
    {
      id: 'tours',
      name: 'Tours',
      image: 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1759789335/Istanbul-1_eqyqij.jpg',
      link: '/tourism'
    },
    {
      id: 'hotel-booking',
      name: 'Hotel Booking',
      image: 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1758985729/hotels/1758985728978_0.jpg',
      link: '/hotel-booking'
    },
    {
      id: 'luxury-suites',
      name: 'Luxury Suites',
      image: 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1759855915/492475786-960x630_kjybmn.jpg',
      link: '/luxury-suites'
    },
    {
      id: 'airport-service',
      name: 'Airport Reception & Farewell',
      image: 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1759859381/photo-1449965408869-eaa3f722e40d_gbhlay.jpg',
      link: '/airport-service'
    }
  ];

  return (
    <section className="py-6 sm:py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">
            {t('home.services.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
            {t('home.services.subtitle')}
          </p>
        </div>

        {/* Services Grid - 2x2 */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {services.map((service) => (
            <Link
              key={service.id}
              to={service.link}
              className="group block bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border border-gray-200 dark:border-slate-700"
            >
              {/* Service Image */}
              <div className="relative aspect-[5/3] overflow-hidden">
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300"></div>
                
                {/* Service Name on Image */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-white leading-tight group-hover:text-yellow-400 dark:group-hover:text-yellow-400 transition-colors duration-300 drop-shadow-lg">
                    {service.name}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
