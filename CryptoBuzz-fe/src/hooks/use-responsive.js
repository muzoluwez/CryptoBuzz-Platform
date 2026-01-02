import { useEffect, useState } from 'react';

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export function useResponsive(direction = 'up', breakpoint = 'md') {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const bp = breakpoints[breakpoint] || breakpoints.md;
    
    const mediaQuery = direction === 'up' 
      ? `(min-width: ${bp}px)`
      : `(max-width: ${bp - 1}px)`;

    const media = window.matchMedia(mediaQuery);
    
    const handleChange = (e) => {
      setMatches(e.matches);
    };

    // Set initial value
    setMatches(media.matches);

    // Add listener
    if (media.addEventListener) {
      media.addEventListener('change', handleChange);
      return () => media.removeEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      media.addListener(handleChange);
      return () => media.removeListener(handleChange);
    }
  }, [direction, breakpoint]);

  return matches;
}


