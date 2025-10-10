import React from 'react';

const CompanyStory = () => {
  return (
    <section className="py-16 md:py-18 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Our Story
          </h2>
          <div className="w-24 h-1 bg-blue-600 dark:bg-yellow-500 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            A journey that began with passion and dedication to creating unforgettable travel experiences
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
                <p className="text-white text-2xl font-bold">Exceptional Service, Memorable Journeys</p>
              </div>
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                Founded with a vision to connect travelers with the rich cultural heritage and breathtaking landscapes of Turkey and beyond, 
                <span className="font-semibold text-blue-600 dark:text-yellow-500"> Rahalatek</span> has grown from humble beginnings into a trusted name in the tourism industry.
              </p>
              
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                What started as a small operation in Istanbul has blossomed into a comprehensive travel service provider, 
                serving thousands of satisfied travelers from around the world. Our commitment to excellence and personalized 
                service has made us a preferred choice for tourists seeking authentic and memorable experiences.
              </p>

              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                Today, we operate across multiple countries, offering a diverse range of services from luxury hotel bookings 
                to expertly guided tours, all while maintaining the personal touch that has been our hallmark from the beginning.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompanyStory;

