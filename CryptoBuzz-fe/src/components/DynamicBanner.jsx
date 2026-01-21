import React from 'react';
import { useGetBannersQuery } from '@/store/client/clientBannerApiSlice';

/**
 * DynamicBanner Component
 * 
 * Displays a single banner (left or right) with:
 * - Desktop/Mobile responsive images
 * - Clickable links (optional)
 * - Open in new tab support
 * 
 * Usage:
 * <DynamicBanner position="left" />
 * <DynamicBanner position="right" />
 */
const DynamicBanner = ({ position }) => {
  // Fetch banners using RTK Query
  const { data, isLoading, isError } = useGetBannersQuery();
  
  // Get the specific banner based on position
  const banner = data?.data?.[position] || null;

  if (isLoading) {
    return (
      <>
        <div className="m-2 mt-4 hidden md:block">
          <div className="w-full h-auto bg-gray-100 animate-pulse"></div>
        </div>
        <div className="m-2 mt-4 block md:hidden w-full">
          <div className="w-full h-auto bg-gray-100 animate-pulse"></div>
        </div>
      </>
    );
  }

  // If no banner exists, don't render anything
  if (!banner || !banner.status) {
    return null;
  }

  const handleClick = () => {
    if (banner.link) {
      if (banner.openInNewTab) {
        window.open(banner.link, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = banner.link;
      }
    }
  };

  return (
    <>
      {/* Desktop Image */}
      <div className="m-2 mt-4 hidden md:block" onClick={handleClick} style={{ cursor: banner.link ? 'pointer' : 'default' }}>
        <img src={banner.desktopImage} alt={banner.title || ""} />
      </div>
      
      {/* Mobile Image */}
      <div className="m-2 mt-4 block md:hidden w-full" onClick={handleClick} style={{ cursor: banner.link ? 'pointer' : 'default' }}>
        <img src={banner.mobileImage} className='w-full mx-auto' alt={banner.title || ""} />
      </div>
    </>
  );
};

export default DynamicBanner;
