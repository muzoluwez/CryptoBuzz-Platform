import { useState } from 'react';
import { convertRtkEditorToHtmlWithLinks, stripHtmlTags } from '@/lib/rtkEditorUtils';

/**
 * Enhanced ShowMoreLess component that handles RTK Editor content with clickable links
 */
const ShowMoreLessWithLinks = ({
  text = '',
  html = '',
  limit = 120,
  showMoreText = ' Show More',
  showLessText = ' Show Less',
  className,
  preserveLinks = true,
}) => {
  const [expanded, setExpanded] = useState(false);

  const isHtml = !!html;
  const content = isHtml ? html : text;
  
  // Get plain text for length calculation
  const plainText = isHtml ? stripHtmlTags(html) : text;
  const isLong = plainText.length > limit;

  // Process HTML to preserve links if needed
  let processedHtml = '';
  if (isHtml && preserveLinks) {
    processedHtml = convertRtkEditorToHtmlWithLinks(html);
  } else if (isHtml) {
    processedHtml = html;
  }

  // Determine what to display
  let displayed;
  if (isHtml) {
    if (expanded || !isLong) {
      displayed = processedHtml || html;
    } else {
      // Show truncated plain text
      displayed = plainText.substring(0, limit);
    }
  } else {
    displayed = expanded || !isLong
      ? content
      : plainText.substring(0, limit);
  }

  return (
    <div className={className ? className : "text-sm text-gray-700 leading-relaxed"}>
      {isHtml && (expanded || !isLong) ? (
        <span dangerouslySetInnerHTML={{ __html: displayed }} />
      ) : (
        <span>{displayed}</span>
      )}
      {isLong && (
        <span
          onClick={() => setExpanded(!expanded)}
          className="text-primary cursor-pointer hover:underline ml-1"
        >
          {expanded ? showLessText : showMoreText}
        </span>
      )}
    </div>
  );
};

export default ShowMoreLessWithLinks;

