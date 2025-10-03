import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaArrowLeft, FaArrowRight, FaSave, FaExclamationTriangle } from 'react-icons/fa';
import CustomScrollbar from './CustomScrollbar';
import CustomButton from './CustomButton';
import CustomTooltip from './CustomTooltip';

const MultiStepModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  currentStep,
  totalSteps,
  stepTitles = {},
  onNext,
  onPrevious,
  onSubmit,
  onStepClick,
  isLoading = false,
  submitText = "Save",
  className = "",
  maxWidth = "md:max-w-6xl", // Larger for multi-step forms
  bodyMaxHeight = "max-h-[75vh]", // Default body height
  showStepIndicator = true,
  allowSkipSteps = true, // Default to true for better UX
  stepValidation = {}, // Object with step numbers as keys and boolean values for validation
  stepMissingFields = {} // Object with step numbers as keys and arrays of missing field names
}) => {
  const [modalEnter, setModalEnter] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setModalEnter(true), 50);
    } else {
      setModalEnter(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setModalEnter(false);
    setTimeout(() => onClose(), 300);
  };

  if (!isOpen) return null;

  const currentStepTitle = stepTitles[currentStep] || `Step ${currentStep}`;

  const modalContent = (
    <div className={`fixed top-0 right-0 left-0 z-[9998] h-screen overflow-y-auto overflow-x-hidden md:inset-0 ${modalEnter ? 'backdrop-blur-md' : 'backdrop-blur-0'} transition-all duration-300 flex items-start md:items-center justify-center bg-gray-900 bg-opacity-50 md:pt-0`}>
      <div className={`relative w-full p-4 max-w-md ${maxWidth} ${className}`}>
        <div className={`relative rounded-lg bg-white shadow dark:bg-slate-900 flex flex-col max-h-[95vh] transform transition-all duration-300 ${modalEnter ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          
          {/* Header */}
          <div className="flex items-start justify-between p-3 sm:p-4 border-b rounded-t dark:border-gray-600">
            <div className="flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                Step {currentStep} of {totalSteps}: {currentStepTitle}
              </p>
            </div>
            
            {/* Step Progress Indicator - Desktop only */}
            {showStepIndicator && (
              <div className="hidden sm:flex items-center space-x-2 mr-4">
                {Array.from({ length: totalSteps }, (_, i) => {
                  const stepNumber = i + 1;
                  const isActive = stepNumber === currentStep;
                  const isCompleted = stepNumber < currentStep;
                  const isClickable = allowSkipSteps && onStepClick;
                  const isValid = stepValidation[stepNumber] !== false; // Default to true if not specified
                  
                  return (
                    <CustomTooltip
                      key={stepNumber}
                      title={isClickable && (isCompleted ? isValid : true) ? `Go to ${stepTitles[stepNumber] || `Step ${stepNumber}`}` : ''}
                      disabled={!isClickable || (isCompleted && !isValid)}
                    >
                      <div
                        className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-blue-600 dark:bg-teal-600 text-white shadow-lg scale-110'
                            : isCompleted
                            ? isValid 
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                        } ${
                          isClickable ? 'cursor-pointer hover:scale-105 hover:shadow-md' : ''
                        }`}
                        onClick={isClickable ? () => onStepClick(stepNumber) : undefined}
                      >
                      {isCompleted ? (
                        isValid ? '✓' : (
                          <CustomTooltip
                            title="Missing Required Fields"
                            content={stepMissingFields[stepNumber]?.join(', ') || 'Required fields not completed'}
                          >
                            <FaExclamationTriangle className="w-3 h-3" />
                          </CustomTooltip>
                        )
                      ) : stepNumber}
                      </div>
                    </CustomTooltip>
                  );
                })}
              </div>
            )}
            
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              onClick={handleClose}
              disabled={isLoading}
            >
              <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>
          
          {/* Step Progress Indicator - Mobile only, centered */}
          {showStepIndicator && (
            <div className="flex sm:hidden items-center justify-center space-x-2 py-3 px-4 border-b dark:border-gray-600">
              {Array.from({ length: totalSteps }, (_, i) => {
                const stepNumber = i + 1;
                const isActive = stepNumber === currentStep;
                const isCompleted = stepNumber < currentStep;
                const isClickable = allowSkipSteps && onStepClick;
                const isValid = stepValidation[stepNumber] !== false; // Default to true if not specified
                
                return (
                  <div
                    key={stepNumber}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 dark:bg-teal-600 text-white shadow-lg scale-110'
                        : isCompleted
                        ? isValid 
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                    } ${
                      isClickable ? 'cursor-pointer hover:scale-105 hover:shadow-md' : ''
                    }`}
                    onClick={isClickable ? () => onStepClick(stepNumber) : undefined}
                    title={isClickable ? `Go to ${stepTitles[stepNumber] || `Step ${stepNumber}`}` : undefined}
                  >
                    {isCompleted ? (
                      isValid ? '✓' : <FaExclamationTriangle className="w-3 h-3" />
                    ) : stepNumber}
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Body */}
          <div className={`max-h-[65vh] md:${bodyMaxHeight} overflow-hidden flex-1`}>
            <CustomScrollbar className="h-full">
              <div className="p-4 space-y-4">
                {children}
              </div>
            </CustomScrollbar>
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-t border-gray-200 rounded-b dark:border-gray-600">
            <div className="flex gap-2">
              {currentStep > 1 && (
                <CustomButton
                  onClick={onPrevious}
                  variant="gray"
                  icon={FaArrowLeft}
                  disabled={isLoading}
                  size="sm"
                  className="text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-2"
                >
                  Previous
                </CustomButton>
              )}
              <CustomButton
                onClick={handleClose}
                variant="red"
                icon={FaTimes}
                disabled={isLoading}
                size="sm"
                className="text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-2"
              >
                Cancel
              </CustomButton>
            </div>
            
            <div className="flex gap-2">
              {currentStep < totalSteps ? (
                <CustomButton
                  onClick={onNext}
                  variant="blueToTeal"
                  icon={FaArrowRight}
                  disabled={isLoading}
                  size="sm"
                  className="text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-2"
                >
                  Next
                </CustomButton>
              ) : (
                <CustomButton
                  onClick={onSubmit}
                  variant="teal"
                  icon={isLoading ? null : FaSave}
                  loading={isLoading}
                  disabled={isLoading}
                  size="sm"
                  className="text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-2"
                >
                  <span className="sm:hidden">
                    {submitText.includes('Create') ? 'Create' : 'Update'}
                  </span>
                  <span className="hidden sm:inline">
                    {submitText}
                  </span>
                </CustomButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Use portal to render modal at document root level
  return createPortal(modalContent, document.body);
};

export default MultiStepModal;
