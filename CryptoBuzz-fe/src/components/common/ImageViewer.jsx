import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * ImageViewer Component
 * A reusable image viewer modal that supports both single and multiple images
 * 
 * @param {Object} props
 * @param {string|null} props.image - Single image URL (for single image mode)
 * @param {string[]} props.images - Array of image URLs (for multiple images mode)
 * @param {number} props.initialIndex - Initial image index when using images array (default: 0)
 * @param {boolean} props.isOpen - Whether the viewer is open
 * @param {Function} props.onClose - Callback when viewer is closed
 * @param {string} props.alt - Alt text for images (default: "Image")
 */
const ImageViewer = ({
  image = null,
  images = [],
  initialIndex = 0,
  isOpen = false,
  onClose,
  alt = "Image"
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Determine if we're in single or multiple image mode
  const imageList = images?.length > 0 ? images : (image ? [image] : []);
  const hasMultipleImages = imageList?.length > 1;
  const currentImage = imageList?.[currentIndex] || null;

  // Reset index when images change or modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex >= 0 && initialIndex < (imageList?.length || 0) ? initialIndex : 0);
    }
  }, [isOpen, initialIndex, imageList?.length]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e?.key === 'Escape') {
        onClose?.();
      } else if (e?.key === 'ArrowLeft' && hasMultipleImages) {
        handlePrevious();
      } else if (e?.key === 'ArrowRight' && hasMultipleImages) {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasMultipleImages, currentIndex, imageList?.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : (imageList?.length || 0) - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < (imageList?.length || 0) - 1 ? prev + 1 : 0));
  };

  if (!isOpen || !currentImage) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center"
        onClick={(e) => e?.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
          aria-label="Close image viewer"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Previous Button (only for multiple images) */}
        {hasMultipleImages && (
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        )}

        {/* Image */}
        {currentImage && (
          <img
            src={currentImage}
            alt={alt || "Image"}
            className="max-w-full max-h-[90vh] object-contain rounded-2xl animate-slideInUp"
            onError={(e) => {
              if (e?.target) {
                e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
              }
            }}
          />
        )}

        {/* Next Button (only for multiple images) */}
        {hasMultipleImages && (
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        )}

        {/* Image Counter (only for multiple images) */}
        {hasMultipleImages && imageList?.length > 0 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 rounded-full text-white text-sm">
            {currentIndex + 1} / {imageList.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageViewer;

