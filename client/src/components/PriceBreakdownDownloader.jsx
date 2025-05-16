import React from 'react';
import { FaDownload } from 'react-icons/fa';
import html2canvas from 'html2canvas';

const PriceBreakdownDownloader = ({ breakdownRef }) => {
  const handleDownload = async () => {
    if (!breakdownRef.current) return;
    
    try {
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.background = 'white';
      container.style.width = Math.max(breakdownRef.current.offsetWidth, 800) + 'px';
      container.style.minWidth = '800px'; 
      container.style.overflowX = 'hidden'; 
      container.style.boxSizing = 'border-box';
      
      const clone = breakdownRef.current.cloneNode(true);
      
      const topHeading = clone.querySelector('div.mt-6.p-4 > div.flex.justify-between.items-center.mb-4 > h3');
      if (topHeading && topHeading.textContent.trim() === 'Price Breakdown') {
        const parent = topHeading.closest('.flex.justify-between.items-center.mb-4');
        if (parent) {
          parent.remove();
        } else {
          topHeading.remove();
        }
      }
      
      const thankYouDiv = document.createElement('div');
      thankYouDiv.style.padding = '15px 16px';
      thankYouDiv.style.textAlign = 'center';
      thankYouDiv.style.fontStyle = 'italic';
      thankYouDiv.style.backgroundColor = 'rgba(20, 83, 45, 0.3)'; 
      thankYouDiv.style.borderTop = '1px solid #166534'; 
      thankYouDiv.style.color = '#ecfdf5'; 
      thankYouDiv.style.fontSize = '14px';
      thankYouDiv.style.fontWeight = '500';
      thankYouDiv.style.marginTop = '-28px';
      thankYouDiv.textContent = 'Thank you for choosing our service!';
      
      const logoDiv = document.createElement('div');
      logoDiv.style.padding = '10px 16px 15px';
      logoDiv.style.textAlign = 'center';
      logoDiv.style.backgroundColor = 'rgba(20, 83, 45, 0.3)';
      
      const logo = document.createElement('img');
      logo.src = "/logodark.png";
      logo.style.height = '40px';
      logo.style.margin = '0 auto';
      
      logoDiv.appendChild(logo);
      
      // Remove calendar icon (only from the Travel Period text)
      const travelMonthElements = clone.querySelectorAll('p.text-sm.text-blue-200.mt-1');
      travelMonthElements.forEach(element => {
        if (element.textContent.includes('Travel Period')) {

          const calendarIcon = element.querySelector('.fa-calendar-alt');
          if (calendarIcon) {
            calendarIcon.remove();
          }
          const monthText = element.textContent.trim();
          element.innerHTML = monthText;
          element.style.textAlign = 'center';
        }
      });
      
      const hotelElements = clone.querySelectorAll('.font-semibold.text-white');
      hotelElements.forEach(element => {
        if (element.textContent.includes('★')) {
          element.textContent = element.textContent.replace('★', ' stars');
        }
      });
      
      const monthBadges = clone.querySelectorAll('.bg-yellow-500\\/20');
      monthBadges.forEach(badge => {
        badge.style.background = 'none';
        badge.style.padding = '0';
        badge.style.color = '#FBBF24';
      });
      
      const headingElements = clone.querySelectorAll('h3.text-xl.font-bold.text-gray-900.dark\\:text-white');
      headingElements.forEach(element => {
        if (element.textContent.includes('Price Breakdown')) {
          const parentElement = element.closest('.flex.justify-between.items-center.mb-4');
          if (parentElement) {
            parentElement.style.display = 'none';
          } else {
            element.style.display = 'none';
          }
        }
      });

      const priceComparisonElements = clone.querySelectorAll('.text-xs.mt-1.ml-4.text-blue-200');
      priceComparisonElements.forEach(element => {
        if (element.textContent.includes('Standard price:') || 
            element.textContent.includes('Children price:')) {
          element.parentNode.removeChild(element);
        }
      });

      const numberIcons = clone.querySelectorAll('.rounded-full');
      numberIcons.forEach(icon => {
        const number = icon.textContent.trim();
        const parent = icon.parentNode;

        const numberSpan = document.createElement('span');
        numberSpan.textContent = number + ". "; 
        numberSpan.style.display = 'inline-block';
        numberSpan.style.marginRight = '8px';
        numberSpan.style.fontWeight = 'bold';
        numberSpan.style.fontSize = '14px';

        parent.replaceChild(numberSpan, icon);
      });
      
      const priceElements = clone.querySelectorAll('.text-green-400');
      priceElements.forEach(priceEl => {
        if (priceEl.parentNode && priceEl.parentNode.classList.contains('flex')) {
          const flexContainer = priceEl.parentNode;

          flexContainer.style.display = 'flex';
          flexContainer.style.justifyContent = 'space-between';
          flexContainer.style.width = '100%';

          priceEl.style.marginLeft = 'auto';
          priceEl.style.textAlign = 'right';
        }
      });

      const vipBadges = clone.querySelectorAll('[class*="from-amber-500"]');
      vipBadges.forEach(badge => {
        const parent = badge.parentNode;
        const textNode = document.createTextNode(" [VIP]");
        parent.replaceChild(textNode, badge);
      });
      
      const groupBadges = clone.querySelectorAll('[class*="bg-blue-600"]');
      groupBadges.forEach(badge => {
        const parent = badge.parentNode;
        const textNode = document.createTextNode(" [Group]");
        parent.replaceChild(textNode, badge);
      });

      const replaceIconsWithText = (element) => {
        const iconContainers = element.querySelectorAll('[class*="react-icons"]');
        iconContainers.forEach(icon => {
          let iconText = "";
          
          if (icon.classList.contains('fa-crown')) {
            iconText = "👑 ";
          } else if (icon.classList.contains('fa-users')) {
            iconText = "👥 ";
          } else if (icon.classList.contains('fa-car')) {
            iconText = "Car: ";
          } else if (icon.classList.contains('fa-check-circle')) {
            iconText = "✓ ";
          } else {
            iconText = "• ";
          }
          
          const textSpan = document.createElement('span');
          textSpan.textContent = iconText;
          textSpan.style.marginRight = '4px';
          textSpan.style.display = 'inline-block'; // Ensure proper display
          icon.parentNode.replaceChild(textSpan, icon);
        });
      };
      
      replaceIconsWithText(clone);

      // Ensure all elements have explicit styling to prevent mobile rendering issues
      const allElements = clone.querySelectorAll('*');
      allElements.forEach(el => {
        // Explicitly set display style for all flex elements
        if (el.classList.contains('flex') && 
            el.classList.contains('justify-between')) {
          el.style.display = 'flex';
          el.style.justifyContent = 'space-between';
          el.style.width = '100%';
          el.style.flexWrap = 'nowrap'; // Prevent wrapping on small screens
        }
        else if (el.classList.contains('flex') || 
                 el.classList.contains('inline-flex')) {
          el.style.display = 'inline-block';
        }
        
        // Ensure text doesn't wrap unnecessarily
        if (el.classList.contains('font-semibold') || 
            el.classList.contains('font-medium')) {
          el.style.whiteSpace = 'normal';
        }
      });

      const priceValues = clone.querySelectorAll('.text-green-400');
      priceValues.forEach(price => {
        price.style.color = '#34D399';
      });
      
      const individualPrices = clone.querySelectorAll('.text-teal-300');
      individualPrices.forEach(price => {
        price.style.color = '#5EEAD4';
      });
      
      clone.appendChild(thankYouDiv);
      clone.appendChild(logoDiv);
      
      container.appendChild(clone);
      document.body.appendChild(container);

      // Use setTimeout to allow browser to fully render the element before capturing
      setTimeout(async () => {
        try {
          // Get accurate height after full rendering
          const fullHeight = clone.scrollHeight || clone.offsetHeight;
          
          // Set minimum width to ensure mobile doesn't shrink the output
          const minWidth = Math.max(breakdownRef.current.offsetWidth, 800);
          
          const canvas = await html2canvas(clone, {
            scale: 2,
            width: minWidth,
            height: fullHeight + 200, // Add extra padding at bottom
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
            logging: false,
            onclone: (document, element) => {
              // Force container width to be the minimum width we've set
              element.style.width = `${minWidth}px`;
              element.style.maxWidth = `${minWidth}px`;
            }
          });

          canvas.toBlob((blob) => {
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = `price_breakdown_${new Date().toISOString().split('T')[0]}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();

            // Clean up
            URL.revokeObjectURL(downloadLink.href);
            document.body.removeChild(downloadLink);
            document.body.removeChild(container);
          }, 'image/png', 1.0); // Use maximum quality
        } catch (error) {
          console.error('Error generating image:', error);
          document.body.removeChild(container);
        }
      }, 200); // Wait 200ms for elements to render fully
    } catch (error) {
      console.error('Error in setup:', error);
    }
  };

  return (
    <button 
      onClick={handleDownload}
      className="absolute top-3 right-3 w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center shadow-lg transition-colors duration-200"
      title="Download Price Breakdown"
    >
      <FaDownload className="text-white" size={16} />
    </button>
  );
};

export default PriceBreakdownDownloader; 