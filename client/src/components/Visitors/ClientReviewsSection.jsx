import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { FaYoutube, FaPlay } from 'react-icons/fa';
import CustomButton from '../CustomButton';
import CustomModal from '../CustomModal';
import RahalatekLoader from '../RahalatekLoader';

export default function ClientReviewsSection() {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const scrollContainerRef = useRef(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [reviewsPerSlide, setReviewsPerSlide] = useState(3);

  useEffect(() => {
    fetchReviews();
  }, []);

  // Screen size detection
  const updateScreenSize = () => {
    const width = window.innerWidth;
    
    if (width < 768) {
      setReviewsPerSlide(1);
      setIsDesktop(false);
    } else if (width < 1024) {
      setReviewsPerSlide(2);
      setIsDesktop(false);
    } else {
      setReviewsPerSlide(3);
      setIsDesktop(true);
    }
  };

  useEffect(() => {
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);


  const fetchReviews = async () => {
    try {
      const response = await axios.get('/api/youtube-shorts/active?category=reviews');
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching Client Reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClick = async (review) => {
    // Increment view count
    try {
      await axios.patch(`/api/youtube-shorts/${review._id}/view`);
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
    
    // Open modal with embedded video
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReview(null);
  };

  const totalSlides = Math.ceil(reviews.length / reviewsPerSlide);

  // Reset slide when screen size changes
  useEffect(() => {
    if (currentSlide >= totalSlides) {
      setCurrentSlide(0);
    }
  }, [totalSlides, currentSlide]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (slideIndex) => {
    setCurrentSlide(slideIndex);
  };


  if (loading) {
    return (
      <section className="py-6 sm:py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <RahalatekLoader size="lg" />
          </div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return null; // Don't show section if no reviews
  }

  return (
    <section className="py-6 sm:py-8 md:py-12 bg-white dark:bg-slate-950" dir="ltr">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="relative text-center mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">
            {t('aboutPage.clientReviews.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('aboutPage.clientReviews.subtitle')}
          </p>
        </div>

        {/* Reviews Carousel */}
        {reviews.length > 0 ? (
          <>
            {isDesktop ? (
              // Desktop: Slide-based carousel with arrows and dots
              <>
                {/* Carousel Container with Side Arrows */}
                <div className="relative flex items-center mb-6">
                  {/* Left Arrow */}
                  {totalSlides > 1 && (
                    <button
                      onClick={prevSlide}
                      className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 transition-all duration-300 ease-in-out bg-blue-600 hover:bg-blue-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-yellow-400/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900 z-10 mr-2 sm:mr-3 md:mr-4"
                      aria-label="Previous reviews"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}

                  {/* Reviews Container */}
                  <div className="flex-1 overflow-hidden" ref={scrollContainerRef}>
                    <div 
                      className="flex transition-transform duration-500 ease-in-out"
                      style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                    >
                      {/* Generate slides */}
                      {Array.from({ length: totalSlides }, (_, slideIndex) => (
                        <div 
                          key={slideIndex} 
                          className="w-full flex-shrink-0 grid grid-cols-3 gap-6"
                        >
                          {/* Review cards for this slide */}
                          {reviews
                            .slice(slideIndex * reviewsPerSlide, (slideIndex + 1) * reviewsPerSlide)
                            .map((review, reviewIndex) => (
                                <div
                                  key={`${slideIndex}-${reviewIndex}`}
                                  className="group cursor-pointer"
                                  onClick={() => handleReviewClick(review)}
                                >
                                <div className="relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
                                  {/* Thumbnail */}
                                  <div className="relative aspect-[9/16] overflow-hidden">
                                    <img
                                      src={review.thumbnail}
                                      alt={review.title}
                                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                      onError={(e) => {
                                        e.target.src = `https://img.youtube.com/vi/${review.videoId}/default.jpg`;
                                      }}
                                      loading="lazy"
                                    />
                                    
                                    {/* Subtle gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    
                                    {/* Play Button - Only shows on hover */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                      <div className="bg-red-600 rounded-full p-3 transform scale-90 group-hover:scale-100 transition-all duration-300 shadow-lg">
                                        <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M8 5v14l11-7z"/>
                                        </svg>
                                      </div>
                                    </div>

                                    {/* YouTube Shorts Badge - Top right */}
                                    <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                                      {t('aboutPage.clientReviews.review')}
                                    </div>

                                    {/* Clean title and description overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                                      <h3 className="text-white font-bold text-sm line-clamp-2 mb-1">
                                        {review.title}
                                      </h3>
                                      {review.description && (
                                        <p className="text-gray-200 text-xs line-clamp-2">
                                          {review.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          }
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Arrow */}
                  {totalSlides > 1 && (
                    <button
                      onClick={nextSlide}
                      className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 transition-all duration-300 ease-in-out bg-blue-600 hover:bg-blue-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-yellow-400/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900 z-10 ml-2 sm:ml-3 md:ml-4"
                      aria-label="Next reviews"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Dots Indicator */}
                {totalSlides > 1 && (
                  <div className="flex justify-center mb-6 space-x-2">
                    {Array.from({ length: totalSlides }, (_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                          index === currentSlide
                            ? 'bg-yellow-400 dark:bg-blue-500 scale-125'
                            : 'bg-gray-300 dark:bg-gray-600 hover:bg-yellow-500 dark:hover:bg-blue-400'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              // Mobile/Tablet: Scroll-based carousel
              <div
                ref={scrollContainerRef}
                className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scroll-smooth w-full"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch',
                  scrollBehavior: 'smooth'
                }}
              >
                 {reviews.map((review, index) => (
                   <div
                     key={review._id}
                     className="flex-shrink-0 w-80 sm:w-80 md:w-80 group cursor-pointer"
                     style={{ animationDelay: `${index * 100}ms` }}
                     onClick={() => handleReviewClick(review)}
                   >
                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
                      {/* Thumbnail */}
                      <div className="relative aspect-[9/16] overflow-hidden">
                        <img
                          src={review.thumbnail}
                          alt={review.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={(e) => {
                            e.target.src = `https://img.youtube.com/vi/${review.videoId}/default.jpg`;
                          }}
                          loading="lazy"
                        />
                        
                        {/* Subtle gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        {/* Play Button - Only shows on hover */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <div className="bg-red-600 rounded-full p-3 transform scale-90 group-hover:scale-100 transition-all duration-300 shadow-lg">
                            <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        </div>

                        {/* YouTube Shorts Badge - Top right */}
                        <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                          {t('aboutPage.clientReviews.review')}
                        </div>

                        {/* Clean title and description overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                          <h3 className="text-white font-bold text-sm line-clamp-2 mb-1">
                            {review.title}
                          </h3>
                          {review.description && (
                            <p className="text-gray-200 text-xs line-clamp-2">
                              {review.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Scroll Hint - Only for mobile/tablet */}
            {!isDesktop && (
              <div className="text-center mt-4 sm:mt-6">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                  </svg>
                  {t('aboutPage.clientReviews.scrollHint')}
                  <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </p>
              </div>
            )}

          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">{t('aboutPage.clientReviews.noReviews')}</p>
          </div>
        )}
      </div>

      {/* Video Modal */}
      <CustomModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedReview?.title || 'Client Review'}
        subtitle=""
        maxWidth="md:max-w-4xl"
      >
        {selectedReview && (
          <div className="space-y-4">
            {/* Video Container */}
            <div className="relative">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${selectedReview.videoId}?autoplay=1&rel=0&modestbranding=1&showinfo=0`}
                  title={selectedReview.title}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>

            {/* Description */}
            {selectedReview.description && (
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {selectedReview.description}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-slate-700">
              <CustomButton
                onClick={() => window.open(selectedReview.youtubeUrl, '_blank')}
                variant="red"
                size="sm"
                icon={FaYoutube}
              >
                {t('aboutPage.clientReviews.watchOnYoutube')}
              </CustomButton>
              <CustomButton
                onClick={closeModal}
                variant="gray"
                size="sm"
              >
                {t('aboutPage.clientReviews.close')}
              </CustomButton>
            </div>
          </div>
        )}
      </CustomModal>

      {/* Hide scrollbar styles */}
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
        div {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}

