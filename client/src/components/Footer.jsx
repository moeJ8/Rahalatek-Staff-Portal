import React from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaWhatsapp, FaGlobe, FaEnvelope } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white dark:bg-slate-900 shadow-md mt-auto transition-colors duration-300">
      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <span className="text-gray-600 dark:text-gray-300">
              &copy; Rahalatek {currentYear}
            </span>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <div className="flex gap-6">
              <a 
                href="https://www.instagram.com/rahalatek_?igsh=MTZjeWU3eHI3enlmaQ==" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-teal-400 hover:text-blue-500 dark:hover:text-teal-300 text-xl"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>
              <a 
                href="https://wa.me/905539241644" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-teal-400 hover:text-blue-500 dark:hover:text-teal-300 text-xl"
                aria-label="WhatsApp"
              >
                <FaWhatsapp />
              </a>
              <a
               href="mailto:info@rahalatek.com"
               target="_blank"
               rel="noopener noreferrer"
               className="text-blue-600 dark:text-teal-400 hover:text-blue-500 dark:hover:text-teal-300 text-xl"
               aria-label="Email"
               >
                <FaEnvelope />
              </a>
              <a 
                href="https://rahalatek.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-teal-400 hover:text-blue-500 dark:hover:text-teal-300 text-xl"
                aria-label="Website"
              >
                <FaGlobe />
              </a>
            </div>
            
            <div className="hidden md:flex gap-6 text-sm">
              <Link 
                to="/" 
                className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-teal-400"
              >
                Home
              </Link>
              <Link 
                to="/tours" 
                className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-teal-400"
              >
                Tours
              </Link>
              <Link 
                to="/hotels" 
                className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-teal-400"
              >
                Hotels
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 