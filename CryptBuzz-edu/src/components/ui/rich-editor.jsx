// import { Editor } from "@tinymce/tinymce-react";
// import { cn } from "@/lib/utils";
// import { useEffect, useRef } from "react";
// import { useSettings } from '@/providers/SettingsProvider';

// // RichEditor component
// const RichEditor = ({ content, onChange, className }) => {
//   const editorRef = useRef(null);
//  const {
//     settings,
//   } = useSettings();
//   const handleEditorChange = (content) => {
//     if (onChange) {
//       onChange(content);
//     }
//   };

//   // Update editor content when theme changes
//   useEffect(() => {
//     const iframe = editorRef.current?.iframeElement;
//     if (!iframe?.contentDocument) return;

//     const { documentElement, body } = iframe.contentDocument;

//     // Clean previous theme classes
//     documentElement.classList.remove('light', 'dark');
//     // Add current theme class
//     documentElement.classList.add(settings.themeMode);

//     // Force redraw for immediate theme application
//     body.style.display = 'none';
//     body.offsetHeight; // Trigger reflow
//     body.style.display = '';
//   }, [settings.themeMode]);

//   return (
//     <div
//       className={cn("border rounded-md overflow-hidden", className)}
//     >
//       <Editor
//         apiKey="mu4agh8e1hzw8g8dfzjj88c3yfdp79aahr24szna1gg3mdlu" // Replace with your TinyMCE API key or remove this line for development
//         onInit={(evt, editor) => (editorRef.current = editor)}
//         initialValue={content || ""}
//         onChange={(e) => handleEditorChange(e.target.getContent())}
//         init={{
//           height: 300,
//           menubar: false,
//           plugins: [
//             "advlist",
//             "autolink",
//             "lists",
//             "link",
//             "image",
//             "charmap",
//             "preview",
//             "anchor",
//             "searchreplace",
//             "visualblocks",
//             "code",
//             "fullscreen",
//             "insertdatetime",
//             "media",
//             "table",
//             "code",
//             "help",
//             "wordcount",
//           ],
//           toolbar:
//             "undo redo | blocks | " +
//             "bold italic forecolor | alignleft aligncenter " +
//             "alignright alignjustify | bullist numlist outdent indent | " +
//             "removeformat | image link table | help",
//             content_style: `
//           /* Base styles */
//           body {
//             font-family: Helvetica, Arial, sans-serif;
//             font-size: 14px;
//             padding: 12px;
//             transition: color 0.3s ease, background-color 0.3s ease;
//           }

//           /* Light theme */
//           .light body {
//             color: #333333;
//             background-color: #ffffff;
//           }
//           .light a {
//             color: #2563eb;
//           }
//           .light table {
//             border-color: #e2e8f0;
//           }

//           /* Dark theme */
//           .dark body {
//             color: #ffffff !important;
//             background-color: #111217;
//           }
//           .dark a {
//             color: #93c5fd;
//           }
//           .dark p {
//             color: #ffffff !important;
//           }
//           .dark table {
//             border-color: #334155;
//           }

//           /* Common elements */
//           table {
//             border-collapse: collapse;
//             width: 100%;
//           }
//           td, th {
//             border: 1px solid;
//             padding: 8px;
//           }
//         `,
//           placeholder: "Start typing or paste content...",
//           // skin: settings.themeMode === 'dark' ? 'oxide-dark' : 'oxide',
//           statusbar: false,
//           branding: false,
//           force_br_newlines: true,
//           force_p_newlines: false,
//           forced_root_block: "",
//           entity_encoding: "raw",
//           newline_behavior: "linebreak",
//         }}
//       />
//     </div>
//   );
// };

// export default RichEditor;


import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import ReactQuill from 'react-quill';
import Quill from 'quill';
import ImageUploader from 'quill-image-uploader';
import 'react-quill/dist/quill.snow.css';
import 'react-quill/dist/quill.bubble.css';
import 'quill-image-uploader/dist/quill.imageUploader.min.css';
import { cn } from '@/lib/utils';
import { useSettings } from '@/providers/SettingsProvider';

// Register quill-image-uploader module
Quill.register('modules/imageUploader', ImageUploader);

// Wrapper to suppress findDOMNode warning in React 18
const QuillWrapper = React.forwardRef((props, ref) => {
  return <ReactQuill ref={ref} {...props} />;
});
QuillWrapper.displayName = 'QuillWrapper';

// Image uploader configuration - will be used in modules

const RichEditor = ({ content, onChange, className, onImagesChange }) => {
  const editorRef = useRef(null);
  const { settings } = useSettings();
  const uploadedImagesRef = useRef(new Set()); // Track uploaded image URLs
  const previousImagesRef = useRef(new Set()); // Track previous image URLs to detect deletions
  const onChangeRef = useRef(onChange); // Store onChange in ref to avoid dependency issues
  const onImagesChangeRef = useRef(onImagesChange); // Store onImagesChange in ref
  const lastCleanedContentRef = useRef(''); // Track last cleaned content to prevent unnecessary updates
  const isInternalChangeRef = useRef(false); // Flag to prevent onChange loops
  
  // Update refs when props change
  useEffect(() => {
    onChangeRef.current = onChange;
    onImagesChangeRef.current = onImagesChange;
  }, [onChange, onImagesChange]);

  // Extract all image URLs from HTML content
  const extractImageUrls = (html) => {
    if (!html) return new Set();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const images = doc.querySelectorAll('img');
    const urls = new Set();
    images.forEach(img => {
      const src = img.getAttribute('src');
      if (src && (src.startsWith('http://') || src.startsWith('https://'))) {
        urls.add(src);
      }
    });
    return urls;
  };

  // Clean content for ReactQuill - remove wrapper divs and delete buttons
  // This is needed because saved content includes our custom wrappers that ReactQuill doesn't understand
  // Returns normalized HTML for consistent comparison
  const cleanContentForEditor = useCallback((html) => {
    if (!html || typeof html !== 'string') return '';
    
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Find all wrapper divs with ql-image-wrapper class
      const wrappers = doc.querySelectorAll('.ql-image-wrapper');
      wrappers.forEach(wrapper => {
        // Find the img tag inside the wrapper
        const img = wrapper.querySelector('img');
        if (img) {
          // Clone the img with all its attributes
          const imgClone = img.cloneNode(true);
          // Replace the wrapper with just the img tag
          if (wrapper.parentNode) {
            wrapper.parentNode.replaceChild(imgClone, wrapper);
          }
        } else {
          // If no img found, just remove the wrapper
          wrapper.remove();
        }
      });
      
      // Remove any remaining delete buttons (in case they're not in wrappers)
      const deleteButtons = doc.querySelectorAll('.ql-image-delete');
      deleteButtons.forEach(btn => btn.remove());
      
      // Return normalized HTML (trim whitespace for consistent comparison)
      return doc.body.innerHTML.trim();
    } catch (error) {
      console.error('Error cleaning content for editor:', error);
      // If parsing fails, try simple regex replacement as fallback
      // Remove wrapper divs and delete buttons, keeping only img tags
      return html
        .replace(/<div[^>]*class="ql-image-wrapper"[^>]*>/gi, '')
        .replace(/<button[^>]*class="ql-image-delete"[^>]*>.*?<\/button>/gi, '')
        // Remove closing div tags that might be orphaned (be careful with this)
        .replace(/<\/div>(?=\s*<)/gi, '')
        .trim();
    }
  }, []);

  // Delete image from Azure
  const deleteImageFromAzure = async (imageUrl) => {
    try {
      // Get auth token
      const token = localStorage.getItem('token') || 
                   sessionStorage.getItem('token') ||
                   JSON.parse(localStorage.getItem('auth'))?.token;

      // Delete from Azure
      const apiUrl = `${import.meta.env.VITE_APP_API_URL || import.meta.env.VITE_API_BASE_URL}/api/v1/common/editor/delete-image`;
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      return true;
    } catch (error) {
      console.error('Image delete error:', error);
      return false;
    }
  };

  const handleEditorChange = useCallback((value) => {
    // Normalize value for comparison
    const normalizedValue = value ? value.trim() : '';
    const normalizedLastContent = lastCleanedContentRef.current.trim();
    
    // Prevent onChange if content hasn't actually changed (prevents render loops)
    if (normalizedValue === normalizedLastContent && !isInternalChangeRef.current) {
      return;
    }
    
    // Extract current image URLs
    const currentImageUrls = extractImageUrls(value);
    
    // Check if content is empty (form reset scenario)
    const isContentEmpty = !normalizedValue || normalizedValue === '<p><br></p>' || normalizedValue === '<p></p>';
    
    // Always call onChange to keep formik in sync, even if content is empty
    // This ensures form validation works correctly
    if (!isInternalChangeRef.current && onChangeRef.current) {
      onChangeRef.current(value);
    }
    
    // If content became empty, clear tracking but don't delete (form was reset)
    if (isContentEmpty) {
      previousImagesRef.current.clear();
      if (onImagesChangeRef.current) {
        onImagesChangeRef.current([]);
      }
      lastCleanedContentRef.current = normalizedValue;
      return;
    }
    
    // Find images that were removed (in previous but not in current)
    const removedImages = Array.from(previousImagesRef.current).filter(
      url => !currentImageUrls.has(url)
    );

    // Delete removed images from Azure (only Azure blob images)
    // Only delete if content is not empty and there were images before
    if (removedImages.length > 0 && previousImagesRef.current.size > 0) {
      removedImages.forEach(async (imageUrl) => {
        // Only delete Azure blob images
        if (imageUrl.includes('blob.core.windows.net') || imageUrl.includes('edulms.blob.core.windows.net')) {
          await deleteImageFromAzure(imageUrl);
          uploadedImagesRef.current.delete(imageUrl);
        }
      });
    }

    // Update previous images reference
    previousImagesRef.current = new Set(currentImageUrls);
    lastCleanedContentRef.current = normalizedValue;
    
    // Extract image URLs from HTML content
    if (onImagesChangeRef.current) {
      onImagesChangeRef.current(Array.from(currentImageUrls));
    }
  }, []);

  // Image uploader configuration using quill-image-uploader
  const imageUploaderConfig = useMemo(() => ({
    upload: (file) => {
      return new Promise((resolve, reject) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          reject(new Error('Please select an image file'));
          return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          reject(new Error('Image size should be less than 10MB'));
          return;
        }

        // Get auth token
        const token = localStorage.getItem('token') || 
                     sessionStorage.getItem('token') ||
                     JSON.parse(localStorage.getItem('auth'))?.token;

        // Prepare FormData
        const formData = new FormData();
        formData.append('image', file);

        // Upload to backend
        const apiUrl = `${import.meta.env.VITE_APP_API_URL || import.meta.env.VITE_API_BASE_URL}/api/v1/common/editor/upload-image`;
        fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error('Failed to upload image');
            }
            return response.json();
          })
          .then((result) => {
            const imageUrl = result?.data?.url || result?.url;
            if (!imageUrl) {
              throw new Error('No image URL returned');
            }
            
            // Track uploaded image
            uploadedImagesRef.current.add(imageUrl);
            previousImagesRef.current.add(imageUrl);
            
            resolve(imageUrl);
          })
          .catch((error) => {
            console.error('Image upload error:', error);
            reject(error.message || 'Upload failed');
          });
      });
    },
  }), []);

  useEffect(() => {
    const editorContainer = editorRef.current?.getEditor().root;
    if (editorContainer) {
      editorContainer.classList.remove('light', 'dark');
      editorContainer.classList.add(settings.themeMode);
    }
  }, [settings.themeMode]);

  // Extract images from initial content and handle content prop changes
  useEffect(() => {
    if (content) {
      const imageUrls = extractImageUrls(content);
      imageUrls.forEach(url => {
        uploadedImagesRef.current.add(url);
        previousImagesRef.current.add(url);
      });
    } else {
      // If content is cleared externally (e.g., form reset), clear tracking
      // but don't delete images (they might be in the saved data)
      previousImagesRef.current.clear();
    }
  }, [content]);

  // Clean content before passing to ReactQuill (remove wrapper divs and delete buttons)
  // Use ref to track last content prop to detect external changes and prevent unnecessary cleaning
  const lastContentPropRef = useRef(content);
  const cleanedContentCacheRef = useRef('');
  
  const cleanedContent = useMemo(() => {
    // Only clean if content prop has actually changed (by reference or value)
    if (content !== lastContentPropRef.current) {
      lastContentPropRef.current = content;
      const cleaned = content ? cleanContentForEditor(content) : '';
      const normalized = cleaned.trim();
      cleanedContentCacheRef.current = normalized;
      lastCleanedContentRef.current = normalized;
      return normalized;
    }
    // Return cached cleaned content if prop hasn't changed
    return cleanedContentCacheRef.current;
  }, [content, cleanContentForEditor]);

  return (
    <div className={cn("border rounded-md bg-light", className)}>
      <QuillWrapper
        ref={editorRef}
        theme="snow"
        value={cleanedContent || ''}
        onChange={handleEditorChange}
        placeholder="Start typing or paste content..."
        modules={{
          toolbar: {
            container: [
              [{ header: [1, 2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ list: 'ordered' }, { list: 'bullet' }],
              ['link', 'image'],
              [{ align: [] }],
              ['clean'],
            ],
          },
          imageUploader: imageUploaderConfig,
        }}
        formats={[
          'header', 'bold', 'italic', 'underline', 'strike',
          'list', 'bullet', 'link', 'image', 'align',
        ]}
        className={`quill-editor ${settings.themeMode}`}
      />
    </div>
  );
};

export default RichEditor;
