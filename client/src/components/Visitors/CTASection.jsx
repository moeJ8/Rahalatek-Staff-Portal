import React from 'react';
import { Link } from 'react-router-dom';
import { FaPhone, FaEnvelope, FaWhatsapp } from 'react-icons/fa';

const CTASection = () => {
  return (
    <section className="py-20 md:py-24 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Floating Shapes */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-cyan-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-block mb-6">
            <span className="px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-semibold border border-white/30">
              ✈️ Start Your Adventure Today
            </span>
          </div>

          {/* Main Heading */}
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Ready to Create
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-orange-200">
              Unforgettable Memories?
            </span>
          </h2>

          {/* Description */}
          <p className="text-xl md:text-2xl text-blue-100 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Let us craft the perfect journey for you. From breathtaking destinations to exceptional service, 
            your dream vacation is just one click away.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              to="/contact"
              className="group relative inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 dark:text-blue-600 font-bold text-lg rounded-xl hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 min-w-[200px]"
            >
              <span className="relative z-10">Get Started Now</span>
              <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
            </Link>

            <Link
              to="/packages"
              className="group inline-flex items-center justify-center px-8 py-4 bg-transparent text-white font-bold text-lg rounded-xl border-2 border-white hover:bg-white hover:text-blue-600 transition-all duration-300 min-w-[200px]"
            >
              <span>Explore Packages</span>
            </Link>
          </div>

          {/* Contact Options */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <p className="text-blue-100 dark:text-gray-400 font-medium">
              Or reach us directly:
            </p>

            <div className="flex gap-4">
              {/* WhatsApp */}
              <a
                href="https://wa.me/905010684657"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <FaWhatsapp className="text-xl" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>

              {/* Email */}
              <a
                href="mailto:info@rahalatek.com"
                className="group flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 border border-white/30"
              >
                <FaEnvelope className="text-xl" />
                <span className="hidden sm:inline">Email</span>
              </a>

              {/* Phone */}
              <a
                href="tel:+905010684657"
                className="group flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 border border-white/30"
              >
                <FaPhone className="text-xl" />
                <span className="hidden sm:inline">Call</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CTASection;

