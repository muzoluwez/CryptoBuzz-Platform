// import React, { useState } from 'react';
// import { Play } from 'lucide-react';

// const RecordingThumbnail = ({ videoUrl, image, defaultImage, seekTime, onRecordingClick }) => {
//   const [imageError, setImageError] = useState(false);
//   const defaultThumbnail = defaultImage || '/media/images/placeholder-video.jpg';

// /*************  ✨ Windsurf Command ⭐  *************/
// /**
//  * Handles click event on recording thumbnail.
//  * If onRecordingClick is provided, it calls the function.
// /*******  fa34b4c2-9395-4b57-ae43-252e3714b056  *******/
//   const handleClick = () => {
//     if (onRecordingClick) {
//       onRecordingClick();
//     }
//   };

//   return (
//     <div
//       className="relative cursor-pointer group"
//       onClick={handleClick}
//     >
//       <img
//         src={imageError || !image ? defaultThumbnail : image}
//         alt="Recording thumbnail"
//         className="w-full h-full object-cover rounded"
//         onError={() => setImageError(true)}
//       />
//       <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-50 transition-opacity rounded">
//         <Play className="w-12 h-12 text-white" fill="white" />
//       </div>
//     </div>
//   );
// };

// export default RecordingThumbnail;
