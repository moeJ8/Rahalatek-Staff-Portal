import React from 'react';
import { FaBullseye, FaEye, FaStar, FaHandshake, FaShieldAlt, FaSmile } from 'react-icons/fa';

const MissionVisionValues = () => {
  const values = [
    {
      id: 1,
      icon: FaSmile,
      title: 'Customer First',
      description: 'Your satisfaction is our top priority in everything we do'
    },
    {
      id: 2,
      icon: FaStar,
      title: 'Quality Service',
      description: 'We deliver excellence in every aspect of your journey'
    },
    {
      id: 3,
      icon: FaHandshake,
      title: 'Trust & Transparency',
      description: 'Building lasting relationships through honesty and integrity'
    },
    {
      id: 4,
      icon: FaShieldAlt,
      title: 'Safety & Security',
      description: 'Your safety and comfort are always guaranteed'
    }
  ];

  return (
    <section className="py-16 md:py-20 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 mb-16">
          {/* Mission */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-yellow-600 dark:to-orange-600 rounded-2xl opacity-20 group-hover:opacity-30 blur transition duration-300"></div>
            <div className="relative bg-white dark:bg-slate-950 p-8 md:p-10 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-800">
              <div className="w-16 h-16 bg-blue-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                <FaBullseye className="text-blue-600 dark:text-yellow-500 text-3xl" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Our Mission
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                To deliver exceptional travel experiences that create lasting memories, connecting travelers with the 
                rich cultural heritage, natural beauty, and warm hospitality of Turkey and beyond. We strive to make 
                every journey seamless, enriching, and unforgettable.
              </p>
            </div>
          </div>

          {/* Vision */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-orange-600 dark:to-red-600 rounded-2xl opacity-20 group-hover:opacity-30 blur transition duration-300"></div>
            <div className="relative bg-white dark:bg-slate-950 p-8 md:p-10 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-800">
              <div className="w-16 h-16 bg-purple-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                <FaEye className="text-purple-600 dark:text-orange-500 text-3xl" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Our Vision
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                To be the leading travel agency recognized globally for our commitment to excellence, innovation, and 
                personalized service. We envision a world where every traveler experiences the magic of discovery through 
                our carefully curated journeys and unwavering dedication to their satisfaction.
              </p>
            </div>
          </div>
        </div>

        {/* Values */}
        <div>
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Core Values
            </h3>
            <div className="w-24 h-1 bg-blue-600 dark:bg-yellow-500 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              The principles that guide our every decision and action
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {values.map((value, index) => (
              <div
                key={value.id}
                className="group bg-white dark:bg-slate-950 p-6 md:p-8 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-yellow-500 hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-yellow-500 dark:to-orange-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <value.icon className="text-white text-2xl" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-yellow-500 transition-colors">
                  {value.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionVisionValues;

