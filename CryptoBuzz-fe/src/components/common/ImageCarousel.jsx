import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import ImageViewer from "./ImageViewer";
import { Loader2 } from "lucide-react";

/**
 * ImageCarousel Component
 * A reusable image carousel that handles both single and multiple images
 * with navigation, loading states, and image preloading
 * 
 * @param {Object} props
 * @param {string|string[]} props.images - Single image URL or array of image URLs
 * @param {string} props.alt - Alt text for images (default: "Image")
 * @param {string} props.className - Additional CSS classes for container
 * @param {string} props.imageClassName - Additional CSS classes for images
 * @param {string} props.height - Height class for images (default: "h-[220px]")
 * @param {boolean} props.showViewButton - Show view/eye button (default: true)
 * @param {Function} props.onImageClick - Optional callback when image is clicked
 * @param {boolean} props.autoPlay - Auto-play carousel (default: false)
 * @param {number} props.autoPlayInterval - Auto-play interval in ms (default: 3000)
 */
const ImageCarousel = ({
  images = [],
  alt = "Image",
  className = "",
  imageClassName = "",
  height = "h-[220px]",
  showViewButton = true,
  onImageClick,
  autoPlay = false,
  autoPlayInterval = 3000,
}) => {
  // Normalize images to array
  const imageArray = Array.isArray(images) 
    ? images?.filter(Boolean) || [] // Remove any null/undefined values
    : images 
    ? [images] 
    : [];

  const hasMultipleImages = imageArray?.length > 1;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageError, setImageError] = useState(false);

  // Preload all images on mount
  useEffect(() => {
    imageArray?.forEach((imgSrc) => {
      if (imgSrc) {
        const img = new Image();
        img.src = imgSrc;
      }
    });
  }, [imageArray]);

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || !hasMultipleImages) return;

    const interval = setInterval(() => {
      const newIndex = currentIndex === (imageArray?.length || 0) - 1 ? 0 : currentIndex + 1;
      changeImage(newIndex);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, hasMultipleImages, currentIndex, imageArray?.length]);

  // Handle next image
  const handleNext = () => {
    if (!hasMultipleImages) return;
    
    const newIndex = currentIndex === (imageArray?.length || 0) - 1 ? 0 : currentIndex + 1;
    changeImage(newIndex);
  };

  // Handle previous image
  const handlePrevious = () => {
    if (!hasMultipleImages) return;
    
    const newIndex = currentIndex === 0 ? (imageArray?.length || 0) - 1 : currentIndex - 1;
    changeImage(newIndex);
  };

  // Change image with preloading
  const changeImage = (newIndex) => {
    if (newIndex === currentIndex || newIndex < 0 || newIndex >= (imageArray?.length || 0)) return;

    setIsLoading(true);
    setImageError(false); // Reset error state when changing images

    // Preload next image
    const nextImage = imageArray?.[newIndex];
    if (!nextImage) {
      setIsLoading(false);
      setImageError(true);
      return;
    }

    const img = new Image();
    img.src = nextImage;
    
    img.onload = () => {
      setCurrentIndex(newIndex);
      setIsLoading(false);
      setImageError(false);
    };

    img.onerror = () => {
      setIsLoading(false);
      setImageError(true);
    };
  };

  // Handle image click - open ImageViewer
  const handleImageClick = () => {
    if (imageArray?.length > 0 && imageArray[currentIndex]) {
      setSelectedImage(imageArray[currentIndex]);
      onImageClick?.(imageArray[currentIndex], currentIndex);
    }
  };

  // Handle dot click
  const handleDotClick = (index) => {
    if (index !== currentIndex) {
      changeImage(index);
    }
  };

  if (!imageArray?.length || imageArray.length === 0) {
    return (
      <div className={`${height} bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center ${className}`}>
        <p className="text-gray-500 text-sm">No image available</p>
      </div>
    );
  }

  const currentImage = imageArray?.[currentIndex];

  return (
    <>
      <div className={`relative ${className}`}>
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-20 rounded-lg">
            <Loader2 className="w-6 h-6 animate-spin text-white" />
          </div>
        )}

        {/* Image */}
        {currentImage && !imageError ? (
          <img
            src={currentImage}
            alt={alt || "Image"}
            className={`w-full ${height} object-cover transition-opacity duration-200 ${
              isLoading ? "opacity-0" : "opacity-100"
            } ${imageClassName || ""}`}
            onError={(e) => {
              if (e?.target) {
                e.target.style.display = 'none';
                setImageError(true);
              }
            }}
          />
        ) : imageError ? (
          <div className={`w-full ${height} bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center ${imageClassName || ""}`}>
            <div className="text-center p-4">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Image not available</p>
            </div>
          </div>
        ) : null}

        {/* View Button (moved to bottom-left so it sits above other image controls) */}
        {showViewButton && (
          <button
            onClick={(e) => {
              e?.stopPropagation();
              handleImageClick();
            }}
            className="absolute left-3 bottom-3 z-30 text-primary p-2 bg-white bg-opacity-95 hover:bg-opacity-100 rounded-full shadow-md transition-all"
            aria-label="View image"
          >
            <Eye size={20} />
          </button>
        )}

        {/* Navigation Arrows (only for multiple images) */}
        {hasMultipleImages && (
          <>
            {/* Previous Button */}
            <button
              onClick={(e) => {
                e?.stopPropagation();
                handlePrevious();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-white/60 hover:bg-white text-gray-700 rounded-full p-1 shadow-md transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Next Button */}
            <button
              onClick={(e) => {
                e?.stopPropagation();
                handleNext();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-white/60 hover:bg-white text-gray-700 rounded-full p-1 shadow-md transition-colors"
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Dot Indicators (only for multiple images) */}
        {hasMultipleImages && imageArray?.length > 0 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-10">
            {imageArray.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e?.stopPropagation();
                  handleDotClick(idx);
                }}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  currentIndex === idx
                    ? "bg-primary"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Image Viewer Modal */}
      <ImageViewer
        images={imageArray || []}
        initialIndex={currentIndex}
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        alt={alt || "Image"}
      />
    </>
  );
};

export default ImageCarousel;

