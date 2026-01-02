import { useState } from 'react';

const ShowMoreLess = ({
  text = '',
  html = '',
  limit = 120,
  showMoreText = ' Show More',
  showLessText = ' Show Less',
  className,
}) => {
  const [expanded, setExpanded] = useState(false);

  const isHtml = !!html;
  const content = isHtml ? html : text;
  const plainText = isHtml ? html.replace(/<[^>]+>/g, '') : text;
  
  // If limit is true or not a valid number, show full content without truncation
  const shouldLimit = typeof limit === 'number' && limit > 0;
  const isLong = shouldLimit ? plainText.length > limit : false;

  const displayed = !shouldLimit || expanded || !isLong
    ? content
    : plainText.substring(0, limit);

  return (
    <div className={className ? className : "text-sm text-gray-700 leading-relaxed"}>
      {isHtml ? (
        <span dangerouslySetInnerHTML={{ __html: displayed }} />
      ) : (
        <span style={{ whiteSpace: 'pre-line' }}>{displayed}</span>
      )}
      {isLong && (
        <span
          onClick={() => setExpanded(!expanded)}
          className="text-primary cursor-pointer hover:underline"
        >
          {expanded ? showLessText : showMoreText}
        </span>
      )}
    </div>
  );
};

export default ShowMoreLess;

