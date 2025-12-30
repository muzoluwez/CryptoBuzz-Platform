/**
 * Converts RTK Editor HTML content to HTML string with clickable links preserved
 * This function processes HTML and ensures links are properly formatted
 * 
 * @param {string} html - The HTML content from RTK Editor
 * @returns {string} - HTML string with clickable links preserved
 */
export function convertRtkEditorToHtmlWithLinks(html) {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Check if we're in a browser environment
  if (typeof document === 'undefined') {
    // Fallback for SSR: use regex to preserve links
    return html.replace(
      /<a\s+([^>]*?)>(.*?)<\/a>/gi,
      (match, attributes, text) => {
        const hrefMatch = attributes.match(/href=["']([^"']+)["']/i);
        const href = hrefMatch ? hrefMatch[1] : text.trim();
        return `<a href="${href}" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline cursor-pointer">${text}</a>`;
      }
    );
  }

  // Browser environment: use DOM manipulation
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Process all anchor tags to preserve them as clickable links
  const links = tempDiv.querySelectorAll('a');
  links.forEach((link) => {
    const href = link.getAttribute('href') || link.textContent;
    const text = link.textContent || href;
    
    // Set attributes for the link
    link.setAttribute('href', href);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    link.className = 'text-primary hover:underline cursor-pointer';
  });

  // Return the processed HTML (with clickable links preserved)
  return tempDiv.innerHTML;
}

/**
 * Converts RTK Editor HTML content to plain text (removes all HTML tags)
 * 
 * @param {string} html - The HTML content from RTK Editor
 * @returns {string} - Plain text without any HTML tags
 */
export function stripHtmlTags(html) {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Check if we're in a browser environment
  if (typeof document === 'undefined') {
    // SSR fallback: use regex to strip HTML tags
    return html
      .replace(/<[^>]+>/g, '') // Remove all HTML tags
      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
      .replace(/&amp;/g, '&') // Replace &amp; with &
      .replace(/&lt;/g, '<') // Replace &lt; with <
      .replace(/&gt;/g, '>') // Replace &gt; with >
      .replace(/&quot;/g, '"') // Replace &quot; with "
      .replace(/&#39;/g, "'") // Replace &#39; with '
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  }

  // Browser environment: use DOM manipulation for better accuracy
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Get text content (this automatically strips all HTML tags)
  return (tempDiv.textContent || tempDiv.innerText || '').trim();
}

/**
 * Converts RTK Editor content to formatted plain text with proper line breaks
 * Handles \r\n, HTML tags, and preserves formatting structure
 * 
 * @param {string} content - The content from RTK Editor (can be HTML or plain text with \r\n)
 * @param {boolean} preserveLineBreaks - Whether to preserve line breaks (default: true)
 * @returns {string} - Formatted plain text with proper line breaks
 */
export function convertRtkEditorToFormattedPlainText(content, preserveLineBreaks = true) {
  if (!content || typeof content !== 'string') {
    return '';
  }

  let plainText = content;

  // First, handle HTML structure - convert HTML tags to line breaks BEFORE stripping
  // This preserves the structure from RTK Editor (which uses <p> and <br> tags)
  plainText = plainText
    .replace(/<br\s*\/?>/gi, '\n') // <br> or <br/> -> newline
    .replace(/<\/p>/gi, '\n') // End of paragraph -> newline
    .replace(/<\/div>/gi, '\n') // End of div -> newline
    .replace(/<\/li>/gi, '\n') // End of list item -> newline
    .replace(/<\/ol>/gi, '\n') // End of ordered list -> newline
    .replace(/<\/ul>/gi, '\n') // End of unordered list -> newline
    .replace(/<p[^>]*>/gi, '') // Start of paragraph (remove tag)
    .replace(/<div[^>]*>/gi, '') // Start of div (remove tag)
    .replace(/<li[^>]*>/gi, '') // Start of list item (remove tag)
    .replace(/<ol[^>]*>/gi, '') // Start of ordered list (remove tag)
    .replace(/<ul[^>]*>/gi, ''); // Start of unordered list (remove tag)

  // Extract text from anchor tags - just keep the URL (we'll make it clickable later)
  // Replace <a> tags with just the URL so we can detect and make it clickable
  plainText = plainText.replace(/<a[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, (match, href, linkText) => {
    // Just return the URL - we'll make it clickable in the next step
    // Don't duplicate the link text, just use the URL
    return href;
  });

  // Strip remaining HTML tags
  plainText = stripHtmlTags(plainText);

  // Decode HTML entities while preserving line breaks
  if (typeof document !== 'undefined') {
    // Use a method that preserves line breaks
    // First, replace line breaks with a marker
    const lineBreakPreserve = '___PRESERVE_LB___';
    const textWithMarkers = plainText.replace(/\n/g, lineBreakPreserve);
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = textWithMarkers;
    let decodedText = tempDiv.textContent || tempDiv.innerText || textWithMarkers;
    
    // Restore line breaks
    plainText = decodedText.replace(new RegExp(lineBreakPreserve.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '\n');
  } else {
    // SSR fallback for HTML entities
    plainText = plainText
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/')
      .replace(/&#x60;/g, '`')
      .replace(/&#x3D;/g, '=');
  }

  if (preserveLineBreaks) {
    // Convert various line break formats to actual line breaks
    // Preserve ALL line breaks exactly as they are
    plainText = plainText
      .replace(/\r\n/g, '\n') // Windows line breaks
      .replace(/\r/g, '\n'); // Mac line breaks
    // Don't trim - preserve all line breaks exactly
  } else {
    // Replace all line breaks with spaces
    plainText = plainText
      .replace(/\r\n/g, ' ')
      .replace(/\r/g, ' ')
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  return plainText;
}

/**
 * Converts plain text with URLs to HTML with clickable links
 * Detects URLs and makes them clickable while preserving line breaks
 * 
 * @param {string} text - Plain text that may contain URLs
 * @param {boolean} preserveLineBreaks - Whether to preserve line breaks (default: true)
 * @returns {string} - HTML string with clickable links
 */
export function convertPlainTextWithClickableLinks(text, preserveLineBreaks = true) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // First, preserve line breaks by converting \n to a temporary marker
  // Use a unique marker that won't conflict with URLs or text
  const lineBreakMarker = '___LINE_BREAK_MARKER___';
  let processedText = text;
  if (preserveLineBreaks) {
    // Replace all newlines with marker, preserving multiple consecutive newlines
    processedText = text.replace(/\n/g, lineBreakMarker);
  }

  // Very strict URL regex - only matches actual URLs
  // Only matches: http://, https://, or www. followed by valid domain
  // This prevents false positives like "see" or "See you soon."
  const urlRegex = /(https?:\/\/[^\s<>"']+|www\.[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.[a-zA-Z]{2,}(?:\/[^\s<>"']*)?)/gi;

  // Replace URLs with clickable links
  // Note: replace callback with capturing group: (match, capturedGroup, offset, string)
  let html = processedText.replace(urlRegex, (match, ...args) => {
    // Extract offset and string from args
    // If there's a capturing group, args[0] is the group, args[1] is offset, args[2] is string
    // If no capturing group, args[0] is offset, args[1] is string
    let offset, string;
    if (args.length === 2) {
      // No capturing group: (match, offset, string)
      offset = args[0];
      string = args[1];
    } else {
      // Has capturing group: (match, group, offset, string)
      offset = args[1];
      string = args[2];
    }
    
    // Ensure string is actually a string
    if (typeof string !== 'string') {
      string = processedText;
    }
    
    // Get the character before and after the match to check context
    const beforeMatch = offset > 0 ? string.substring(Math.max(0, offset - 1), offset) : '';
    const afterMatch = string.substring(offset + match.length, offset + match.length + 1);
    
    // STRICT VALIDATION: Must start with http://, https://, or www.
    if (!match.startsWith('http://') && !match.startsWith('https://') && !match.startsWith('www.')) {
      return match; // Not a valid URL pattern
    }
    
    // Additional check: If the character before is a letter or number, it might be part of a word
    // e.g., "See you soon" - "see" shouldn't match, or "example.com" in "myexample.com"
    if (beforeMatch && beforeMatch.match(/[a-zA-Z0-9]/)) {
      return match; // Likely part of a word, not a URL
    }
    
    // Additional check: If it starts with www., verify it has a valid domain structure
    if (match.startsWith('www.')) {
      const domainPart = match.substring(4); // Remove "www."
      // Must have at least one dot and valid TLD (at least 2 chars after last dot)
      const parts = domainPart.split('.');
      if (parts.length < 2 || parts[parts.length - 1].length < 2) {
        return match; // Invalid domain structure
      }
      // Check if domain name is too short (likely false positive)
      if (parts[0].length < 2) {
        return match; // Domain name too short
      }
    }
    
    // Additional check: For http/https URLs, verify they have a valid domain structure
    if (match.startsWith('http://') || match.startsWith('https://')) {
      // Extract domain part (after protocol and //)
      const urlWithoutProtocol = match.replace(/^https?:\/\//, '');
      // Must have at least one dot (domain.tld)
      if (!urlWithoutProtocol.includes('.')) {
        return match; // No domain structure
      }
      // Check if it's too short to be a real URL
      if (match.length < 10) { // "https://a.b" is 10 chars minimum
        return match; // Too short to be a real URL
      }
    }
    
    // Final check: If the match is very short overall, it's likely not a URL
    // Real URLs are usually longer
    if (match.length < 8) {
      return match; // Too short to be a real URL
    }
    
    // All validations passed - it's a real URL
    const href = match.startsWith('www.') ? 'https://' + match : match;
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline cursor-pointer">${match}</a>`;
  });

  // Restore line breaks - convert markers back to <br> tags
  if (preserveLineBreaks) {
    // Replace each marker with <br> to preserve all line breaks
    // Use a simple string replace since we know the exact marker
    const escapedMarker = lineBreakMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    html = html.replace(new RegExp(escapedMarker, 'g'), '<br>');
    
    // Also ensure any remaining \n characters are converted (in case marker was missed)
    html = html.replace(/\n/g, '<br>');
  }

  return html;
}

/**
 * Converts RTK Editor content to formatted plain text with clickable links
 * This is the main function to use for displaying RTK editor content
 * 
 * @param {string} content - The content from RTK Editor (can be HTML or plain text with \r\n)
 * @param {boolean} makeLinksClickable - Whether to make URLs clickable (default: true)
 * @param {boolean} preserveLineBreaks - Whether to preserve line breaks (default: true)
 * @returns {string} - HTML string with formatted text and clickable links
 */
export function convertRtkEditorToDisplayFormat(content, makeLinksClickable = true, preserveLineBreaks = true) {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // First, convert to formatted plain text
  let plainText = convertRtkEditorToFormattedPlainText(content, preserveLineBreaks);

  // If we want clickable links, convert URLs to clickable links
  if (makeLinksClickable) {
    return convertPlainTextWithClickableLinks(plainText, preserveLineBreaks);
  }

  // If preserving line breaks but not making links clickable, just convert \n to <br>
  if (preserveLineBreaks) {
    return plainText.replace(/\n/g, '<br>');
  }

  return plainText;
}

/**
 * Converts RTK Editor HTML to React elements with clickable links
 * This function returns JSX-compatible structure
 * 
 * @param {string} html - The HTML content from RTK Editor
 * @returns {Array} - Array of React elements (text nodes and anchor elements)
 */
export function convertRtkEditorToReactElements(html) {
  if (!html || typeof html !== 'string') {
    return [];
  }

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  const elements = [];
  const processNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim();
      if (text) {
        elements.push(text);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.tagName === 'A') {
        const href = node.getAttribute('href') || node.textContent;
        const text = node.textContent || href;
        elements.push({
          type: 'link',
          href: href,
          text: text,
        });
      } else {
        // Process child nodes
        Array.from(node.childNodes).forEach(processNode);
      }
    }
  };

  Array.from(tempDiv.childNodes).forEach(processNode);
  return elements;
}

/**
 * Extracts plain text from HTML while preserving link information
 * Returns an object with text and links array
 * 
 * @param {string} html - The HTML content from RTK Editor
 * @returns {Object} - { text: string, links: Array<{href: string, text: string}> }
 */
export function extractTextWithLinks(html) {
  if (!html || typeof html !== 'string') {
    return { text: '', links: [] };
  }

  if (typeof document === 'undefined') {
    // SSR fallback: use regex
    const links = [];
    const text = html
      .replace(/<a\s+[^>]*?href=["']([^"']+)["'][^>]*?>(.*?)<\/a>/gi, (match, href, linkText) => {
        links.push({ href, text: linkText.trim() });
        return `[LINK_${links.length - 1}]`;
      })
      .replace(/<[^>]+>/g, '')
      .replace(/\[LINK_(\d+)\]/g, (match, index) => {
        const link = links[parseInt(index)];
        return link ? link.text : '';
      })
      .trim();
    
    return { text, links };
  }

  // Browser environment
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  const links = [];
  const processNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.tagName === 'A') {
        const href = node.getAttribute('href') || node.textContent;
        const text = node.textContent || href;
        links.push({ href, text: text.trim() });
        return text;
      } else {
        return Array.from(node.childNodes)
          .map(processNode)
          .join('');
      }
    }
    return '';
  };

  const text = Array.from(tempDiv.childNodes)
    .map(processNode)
    .join('')
    .replace(/\s+/g, ' ')
    .trim();

  return { text, links };
}

/**
 * Converts RTK Editor content to display format (like ShowMoreLess but without limit)
 * Always shows full content with clickable links and preserved line breaks
 * This is useful when you want to display full content without truncation
 * 
 * @param {string} content - The content from RTK Editor (can be HTML or plain text with \r\n)
 * @param {boolean} makeLinksClickable - Whether to make URLs clickable (default: true)
 * @param {boolean} preserveLineBreaks - Whether to preserve line breaks (default: true)
 * @returns {string} - HTML string with formatted text and clickable links (full content, no truncation)
 */
export function convertRtkEditorToFullDisplay(content, makeLinksClickable = true, preserveLineBreaks = true) {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // Use the existing display format function which already handles everything
  // This function always returns full content (no limit/truncation)
  return convertRtkEditorToDisplayFormat(content, makeLinksClickable, preserveLineBreaks);
}

