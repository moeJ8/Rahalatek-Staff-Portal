import React, { useState, useEffect, useRef } from 'react';
import { FaUsers, FaMapMarkedAlt, FaHotel, FaGlobe } from 'react-icons/fa';

const Statistics = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  const stats = [
    {
      id: 1,
      icon: FaUsers,
      count: 2000,
      suffix: '+',
      label: 'Happy Travelers',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 2,
      icon: FaMapMarkedAlt,
      count: 500,
      suffix: '+',
      label: 'Tours Conducted',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 3,
      icon: FaHotel,
      count: 200,
      suffix: '+',
      label: 'Hotel Partners',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const CountUp = ({ end, duration = 2000, suffix = '' }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (!isVisible) return;

      let startTime = null;
      const step = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const percentage = Math.min(progress / duration, 1);
        
        setCount(Math.floor(end * percentage));

        if (percentage < 1) {
          requestAnimationFrame(step);
        }
      };

      requestAnimationFrame(step);
    }, [isVisible, end, duration]);

    return <span>{count}{suffix}</span>;
  };

  return (
    <section 
      ref={sectionRef}
      className="py-16 md:py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Flying Plane Animation */}
      <div className="cloud cloud1">
        <div className="plane-trail plane-trail-top"></div>
        <div className="plane-trail plane-trail-main"></div>
        <div className="plane-trail plane-trail-bottom"></div>
        <div className="light"></div>
        <img 
          src="https://images.vexels.com/media/users/3/145795/isolated/preview/05cd33059a006bf49006097af4ccba98-plane-in-flight-by-vexels.png" 
          alt="Flying plane"
          className="plane-img"
        />
      </div>

      <style>{`
        .light {
          width: 10px;
          height: 10px;
          background: #FCD34D;
          border-radius: 50%;
          bottom: 50%;
          position: absolute;
          z-index: 10;
          left: 20px;
          animation: light 800ms ease-in-out 0s infinite alternate;
          box-shadow: 0 0 10px #FCD34D;
          transform: translateY(50%);
        }
        
        .plane-trail {
          position: absolute;
          height: 3px;
          background: linear-gradient(
            to left,
            rgba(255, 255, 255, 0.8),
            rgba(255, 255, 255, 0.5) 30%,
            rgba(255, 255, 255, 0.2) 60%,
            transparent
          );
          right: 95%;
          filter: blur(1px);
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
        }
        
        .plane-trail-main {
          width: 200px;
          top: 59%;
          transform: translateY(-50%);
          opacity: 0.7;
        }
        
        .plane-trail-top {
          width: 150px;
          top: 55%;
          transform: translateY(-50%);
          opacity: 0.5;
          height: 2px;
        }
        
        .plane-trail-bottom {
          width: 150px;
          top: 63%;
          transform: translateY(-50%);
          opacity: 0.5;
          height: 2px;
          right: 88%;
        }
        
        .cloud {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          left: -500px;
          opacity: 0.9;
          animation: cloud 15s linear 0s infinite;
          z-index: 5;
        }
        
        .plane-img {
          width: 180px;
          height: auto;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
          position: relative;
          z-index: 2;
        }
        
        @keyframes light {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        @keyframes cloud {
          from { left: -500px; }
          to { left: 102%; }
        }
        
        @media (max-width: 768px) {
          .plane-img {
            width: 120px;
          }
          .plane-trail-main {
            width: 150px;
            height: 2px;
          }
          .plane-trail-top,
          .plane-trail-bottom {
            width: 100px;
            height: 1.5px;
          }
          .light {
            left: 15px;
            width: 8px;
            height: 8px;
          }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white dark:text-white mb-4">
            Our Achievements in Numbers
          </h2>
          <p className="text-lg text-blue-100 dark:text-gray-400 max-w-2xl mx-auto">
            Proud milestones that reflect our commitment to excellence
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.id}
              className="group relative bg-white/10 dark:bg-slate-800/50 backdrop-blur-lg p-6 md:p-8 rounded-2xl border border-white/20 dark:border-slate-700 hover:bg-white/20 dark:hover:bg-slate-800/70 transition-all duration-300 hover:scale-105"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:rotate-12 transition-transform duration-300`}>
                <stat.icon className="text-white text-3xl" />
              </div>

              {/* Count */}
              <div className="text-center">
                <h3 className="text-4xl md:text-5xl font-bold text-white dark:text-white mb-2">
                  {isVisible ? <CountUp end={stat.count} suffix={stat.suffix} /> : '0' + stat.suffix}
                </h3>
                <p className="text-blue-100 dark:text-gray-300 font-medium text-lg">
                  {stat.label}
                </p>
              </div>

              {/* Decorative Element */}
              <div className="absolute -top-2 -right-2 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-300"></div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-blue-100 dark:text-gray-400 text-lg max-w-3xl mx-auto">
            These numbers represent more than just statistics – they represent thousands of smiles, 
            unforgettable memories, and journeys that have touched hearts around the world.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Statistics;

