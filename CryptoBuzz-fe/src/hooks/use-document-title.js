import { useEffect } from 'react';

/**
 * useDocumentTitle
 * A small hook to set document.title with an optional suffix and cleanup
 *
 * @param {string} title - Main title to show in the browser tab
 * @param {object} options
 * @param {string} options.suffix - Optional suffix (default: 'Cripto Buzz')
 * @param {boolean} options.keepOnUnmount - If true, do not restore previous title on unmount
 */
export default function useDocumentTitle(title, { suffix = 'Cripto Buzz', keepOnUnmount = false } = {}) {
  useEffect(() => {
    if (!title) return;
    const previous = document.title;
    const composed = suffix ? `${title} - ${suffix}` : title;
    document.title = composed;

    return () => {
      if (!keepOnUnmount) document.title = previous;
    };
  }, [title, suffix, keepOnUnmount]);
}
