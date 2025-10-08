// Generate inline SVG placeholder images instead of using external services
// This prevents ERR_NAME_NOT_RESOLVED errors and works offline

export const generatePlaceholderSVG = (text = 'No Image', width = 400, height = 300) => {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text 
        x="50%" 
        y="50%" 
        font-family="system-ui, -apple-system, sans-serif" 
        font-size="18" 
        fill="#9ca3af" 
        text-anchor="middle" 
        dominant-baseline="middle"
      >
        ${text}
      </text>
    </svg>
  `.trim();
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Pre-generated placeholders for common use cases
export const PLACEHOLDER_IMAGES = {
  tour: generatePlaceholderSVG('Tour Image'),
  hotel: generatePlaceholderSVG('Hotel Image'),
  package: generatePlaceholderSVG('Package Image'),
  room: generatePlaceholderSVG('Room Image'),
  noImage: generatePlaceholderSVG('No Image Available', 800, 400),
};

export default PLACEHOLDER_IMAGES;
