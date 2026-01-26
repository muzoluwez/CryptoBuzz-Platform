import React, { useState } from "react";
import Slider from "react-slick";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ShowMoreLess from "./ShowMoreLess";
import ImageViewer from "./ImageViewer";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

/**
 * Custom Previous Arrow Component
 */
function PrevArrow(props) {
  const { className, onClick } = props;
  return (
    <button
      className={`${className} !left-3 z-10 bg-white/70 hover:bg-white text-gray-700 rounded-full p-1 shadow-md transition-colors`}
      onClick={onClick}
      aria-label="Previous slide"
    >
      <ChevronLeft size={20} />
    </button>
  );
}

/**
 * Custom Next Arrow Component
 */
function NextArrow(props) {
  const { className, onClick } = props;
  return (
    <button
      className={`${className} !right-3 z-10 bg-white/70 hover:bg-white text-gray-700 rounded-full p-1 shadow-md transition-colors`}
      onClick={onClick}
      aria-label="Next slide"
    >
      <ChevronRight size={20} />
    </button>
  );
}

/**
 * ImageSlider Component
 * A reusable image slider/carousel component with optional description
 * 
 * @param {Object} props
 * @param {string[]} props.images - Array of image URLs to display
 * @param {string|Object} props.description - Description text or HTML to display below slider
 * @param {number} props.descriptionLimit - Character limit for description (default: 95)
 * @param {boolean} props.showDescription - Whether to show description section (default: true)
 * @param {string} props.alt - Alt text for images (default: "Image")
 * @param {string} props.imageClassName - Additional CSS classes for images
 * @param {number} props.height - Height of slider images (default: "h-96")
 * @param {Function} props.onImageClick - Optional callback when image is clicked
 */
const ImageSlider = ({
  images = [],
  description = "",
  descriptionLimit = 95,
  showDescription = true,
  alt = "Image",
  imageClassName = "",
  height = "h-96",
  onImageClick,
}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState(new Set());

  // Handle image click - open ImageViewer
  const handleImageClick = (image, index) => {
    if (image && typeof index === 'number') {
      setSelectedImageIndex(index);
      setSelectedImage(image);
      onImageClick?.(image, index);
    }
  };

  // Slider settings
  const settings = {
    dots: images?.length > 1,
    infinite: images?.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    appendDots: (dots) => (
      <div>
        <ul className="flex justify-center gap-2 mt-3">{dots || []}</ul>
      </div>
    ),
    customPaging: () => (
      <div className="w-2 h-2 bg-gray-400 rounded-full hover:bg-gray-700 transition-colors cursor-pointer" />
    ),
  };

  // Normalize description - handle both string and object
  const descriptionText = typeof description === 'string' 
    ? description 
    : description?.description || description?.html || description?.content || "";

  return (
    <div className="w-full">
      {/* Image Slider */}
      {images?.length > 0 ? (
        <div className="relative">
          <Slider {...settings}>
            {images?.map((image, index) => (
              image ? (
                <div
                  key={index}
                  onClick={() => handleImageClick(image, index)}
                  className="cursor-pointer group"
                >
                  {!imageErrors.has(index) ? (
                    <img
                      className={`w-full ${height || "h-96"} object-cover rounded-lg transition-opacity group-hover:opacity-90 ${imageClassName || ""}`}
                      src={image}
                      alt={`${alt || "Image"} ${index + 1}`}
                      onError={(e) => {
                        if (e?.target) {
                          e.target.style.display = 'none';
                          setImageErrors(prev => new Set(prev).add(index));
                        }
                      }}
                    />
                  ) : (
                    <div className={`w-full ${height || "h-96"} bg-gray-200 dark:bg-[#fff9e224] rounded-lg flex items-center justify-center ${imageClassName || ""}`}>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Image not available</p>
                    </div>
                  )}
                </div>
              ) : null
            ))}
          </Slider>
        </div>
      ) : (
        <div className="text-gray-500 text-center py-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
          No images available
        </div>
      )}

      {/* Description Section */}
      {showDescription && descriptionText && (
        <div className="flex flex-col gap-2 py-4">
          <ShowMoreLess
            className="text-gray-900 dark:text-gray-100 text-sm leading-relaxed"
            html={descriptionText}
            limit={descriptionLimit}
          />
        </div>
      )}

      {/* Image Viewer Modal */}
      <ImageViewer
        images={images || []}
        initialIndex={selectedImageIndex}
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        alt={alt || "Image"}
      />
    </div>
  );
};

export default ImageSlider;

