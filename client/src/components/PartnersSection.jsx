import React, { useRef, useEffect } from 'react';

const PartnersSection = () => {
  const scrollRef = useRef(null);

  const partners = [
    {
      id: 1,
      name: 'Turkish Airlines',
      logo: '/logos/turkish-airlines-seeklogo.png',
    },
    {
      id: 2,
      name: 'Royal Jordanian',
      logo: '/logos/royal-jordanian-airlines-seeklogo.png',
    },
    {
      id: 3,
      name: 'Pegasus Airlines',
      logo: '/logos/pegasus-airlines-seeklogo.png',
    },
    {
      id: 4,
      name: 'Emirates',
      logo: '/logos/emirates-airlines-seeklogo.png',
    },
    {
      id: 5,
      name: 'Hilton',
      logo: '/logos/hilton-seeklogo.png',
    },
    {
      id: 6,
      name: 'Sheraton',
      logo: '/logos/sheraton-hotels-resorts-seeklogo.png',
    },
    {
      id: 7,
      name: 'Marriott',
      logo: '/logos/marriott-seeklogo.png',
    },
    {
      id: 8,
      name: 'Ramada',
      logo: '/logos/ramada-lake-balaton-seeklogo.png',
    },
    {
      id: 9,
      name: 'Swissôtel',
      logo: '/logos/swissotel-hotels-resorts-seeklogo.png',
    },
    {
      id: 10,
      name: 'Crowne Plaza',
      logo: '/logos/crowne-plaza-seeklogo.png',
    },
  ];

  // Duplicate partners multiple times for seamless infinite scroll
  const allPartners = [...partners, ...partners, ...partners, ...partners];

  // Auto-scroll effect with smooth infinite loop
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const scroll = () => {
      if (!scrollContainer) return;
      
      // Always scroll forward
      scrollContainer.scrollLeft += 1;
      
      // Calculate the width of one set of partners (1/4 of total since we have 4 duplicates)
      const singleSetWidth = scrollContainer.scrollWidth / 4;
      
      // Seamlessly loop: when we reach the second set, jump back to the first set
      // This creates the illusion of infinite scroll
      if (scrollContainer.scrollLeft >= singleSetWidth) {
        // Reset without visual jump by going back exactly one set width
        scrollContainer.scrollLeft -= singleSetWidth;
      }
    };

    const intervalId = setInterval(scroll, 20);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <section className="py-6 sm:py-8 md:py-12 bg-white dark:bg-slate-950">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Our Partners
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Trusted by leading brands worldwide
          </p>
        </div>

        {/* Scrolling Container */}
        <div
          ref={scrollRef}
          className="flex gap-12 sm:gap-16 md:gap-20 items-center overflow-x-hidden py-4"
        >
          {allPartners.map((partner, index) => {
            // Apply white filter in dark mode for Hilton, Sheraton, Swissôtel, and Ramada
            const needsWhiteInDark = partner.name === 'Hilton' || partner.name === 'Sheraton' || partner.name === 'Swissôtel' || partner.name === 'Ramada';
            
            return (
              <div
                key={`${partner.id}-${index}`}
                className="flex-shrink-0 flex items-center justify-center opacity-90 hover:opacity-100 transition-all duration-300 hover:scale-110 w-20 h-14 sm:w-32 sm:h-20 md:w-36 md:h-24 lg:w-40 lg:h-28"
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className={`max-w-full max-h-full object-contain pointer-events-none select-none ${
                    needsWhiteInDark ? 'dark:brightness-0 dark:invert' : ''
                  }`}
                  draggable={false}
                  loading="lazy"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom CSS to hide scrollbar */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default PartnersSection;

