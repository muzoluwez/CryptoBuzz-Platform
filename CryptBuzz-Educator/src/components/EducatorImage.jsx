// import React from 'react';
// import { toAbsoluteUrl } from '@/utils';

// const EducatorImage = ({ educator, defaultImage }) => {
//   const imageUrl = educator?.image
//     ? toAbsoluteUrl(educator.image)
//     : defaultImage || toAbsoluteUrl('/media/avatars/300-6.png');

//   return (
//     <img
//       src={imageUrl}
//       alt={educator?.first_name && educator?.last_name
//         ? `${educator.first_name} ${educator.last_name}`
//         : educator?.name || 'Educator'}
//       className="rounded-full size-9 shrink-0 object-cover object-top"
//       onError={(e) => {
//         e.target.src = defaultImage || toAbsoluteUrl('/media/avatars/300-6.png');
//       }}
//     />
//   );
// };

// export default EducatorImage;
