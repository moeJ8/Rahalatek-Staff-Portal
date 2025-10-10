import React, { useState } from 'react';
import { FaWhatsapp, FaInstagram, FaEnvelope, FaTimes, FaComments } from 'react-icons/fa';

const FloatingContactButtons = () => {
  const [isOpen, setIsOpen] = useState(false);

  const contacts = [
    {
      id: 'whatsapp',
      icon: FaWhatsapp,
      label: 'WhatsApp',
      href: 'https://wa.me/905010684657',
      bgColor: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
    },
    {
      id: 'instagram',
      icon: FaInstagram,
      label: 'Instagram',
      href: 'https://www.instagram.com/rahalatek_/',
      bgColor: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400',
      hoverColor: 'hover:from-purple-600 hover:via-pink-600 hover:to-orange-500',
    },
    {
      id: 'email',
      icon: FaEnvelope,
      label: 'Email',
      href: 'mailto:info@rahalatek.com',
      bgColor: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
    },
  ];

  return (
    <>
      {/* Backdrop overlay when open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-transparent z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-50">
        {/* Contact Buttons Container - Stack vertically above main button */}
        <div className="flex flex-col-reverse items-start gap-2 sm:gap-3 mb-2 sm:mb-4 ml-1">
          {/* Contact Icon Buttons */}
          {contacts.map((contact, index) => {
            const Icon = contact.icon;
            
            return (
              <div
                key={contact.id}
                className={`transition-all duration-300 ease-out ${
                  isOpen
                    ? 'opacity-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 translate-y-4 pointer-events-none'
                }`}
                style={{
                  transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
                }}
              >
                <a
                  href={contact.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative"
                >
                  {/* Label (appears on hover) - Absolutely positioned - Hidden on mobile */}
                   <div className="hidden sm:block absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/80 dark:bg-gray-800/95 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap pointer-events-none backdrop-blur-sm">
                    {contact.label}
                  </div>

                  {/* Icon Button - Circular - Responsive sizing */}
                  <div
                    className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full ${contact.bgColor} ${contact.hoverColor} text-white flex items-center justify-center shadow-lg transform transition-all duration-300 hover:scale-110 hover:shadow-2xl`}
                  >
                    <Icon className="w-5 h-5 sm:w-7 sm:h-7" />
                  </div>
                </a>
              </div>
            );
          })}
        </div>

        {/* Main Toggle Button - Circular - Responsive sizing */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 dark:from-yellow-500 dark:to-yellow-600 text-white shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:scale-105 flex items-center justify-center group`}
          aria-label="Toggle contact options"
        >
          {/* Icon with smooth transition - Responsive sizing */}
          <div className="relative w-5 h-5 sm:w-7 sm:h-7">
            <FaComments 
              className={`absolute inset-0 w-5 h-5 sm:w-7 sm:h-7 transition-all duration-300 ${
                isOpen ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
              }`}
            />
            <FaTimes 
              className={`absolute inset-0 w-5 h-5 sm:w-7 sm:h-7 transition-all duration-300 ${
                isOpen ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'
              }`}
            />
          </div>
          
          {/* Pulse animation when not open */}
          {!isOpen && (
            <>
              <span className="absolute inset-0 rounded-full bg-blue-500 dark:bg-yellow-500 animate-ping opacity-20"></span>
              <span className="absolute inset-0 rounded-full bg-blue-500 dark:bg-yellow-500 animate-pulse opacity-20"></span>
            </>
          )}
        </button>
      </div>
    </>
  );
};

export default FloatingContactButtons;

