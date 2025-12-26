import { useEffect, useRef, useCallback, useState } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * InfiniteScroll Component
 * 
 * A reusable infinite scroll component that automatically loads more data
 * when the user scrolls near the bottom of the container.
 * 
 * @param {Object} props
 * @param {Array} props.items - Array of items to display
 * @param {Function} props.renderItem - Function to render each item: (item, index) => ReactNode
 * @param {Function} props.onLoadMore - Callback function when more data should be loaded
 * @param {boolean} props.hasMore - Whether there are more items to load
 * @param {boolean} props.isLoading - Whether data is currently being loaded
 * @param {React.ReactNode} props.loadingComponent - Custom loading component
 * @param {React.ReactNode} props.endMessage - Message to show when no more items
 * @param {string} props.className - Additional CSS classes for the container
 * @param {string} props.itemClassName - Additional CSS classes for each item
 * @param {number} props.threshold - Distance from bottom (in pixels) to trigger load more
 * @param {string} props.containerId - ID for the scrollable container (optional)
 */
export function InfiniteScroll({
  items = [],
  renderItem,
  onLoadMore,
  hasMore = true,
  isLoading = false,
  loadingComponent,
  endMessage,
  className = '',
  itemClassName = '',
  threshold = 200,
  containerId,
}) {
  const observerTarget = useRef(null);
  const containerRef = useRef(null);

  // Default loading component
  const defaultLoadingComponent = (
    <div className="flex justify-center items-center py-8">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
      <span className="ml-2 text-gray-600 dark:text-gray-400">Loading more...</span>
    </div>
  );

  // Default end message
  const defaultEndMessage = (
    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
      <p>No more items to load</p>
    </div>
  );

  // Callback for intersection observer
  const handleObserver = useCallback(
    (entries) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !isLoading) {
        onLoadMore();
      }
    },
    [hasMore, isLoading, onLoadMore]
  );

  // Set up intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: containerId ? document.getElementById(containerId) : null,
      rootMargin: `${threshold}px`,
      threshold: 0.1,
    });

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [handleObserver, threshold, containerId]);

  // If no items and not loading, show empty state
  if (items.length === 0 && !isLoading) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-gray-500 dark:text-gray-400">No items found</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={className}>
      {/* Render items */}
      {items.map((item, index) => (
        <div key={item._id || item.id || index} className={itemClassName}>
          {renderItem(item, index)}
        </div>
      ))}

      {/* Observer target - triggers load more when visible */}
      {hasMore && (
        <div ref={observerTarget} className="h-4" />
      )}

      {/* Loading indicator */}
      {isLoading && (loadingComponent || defaultLoadingComponent)}

      {/* End message */}
      {!hasMore && items.length > 0 && (endMessage || defaultEndMessage)}
    </div>
  );
}

/**
 * Hook for managing infinite scroll pagination
 * 
 * @param {Object} queryHook - RTK Query hook (e.g., useGetIdeasQuery)
 * @param {Object} queryParams - Initial query parameters
 * @param {number} initialPage - Starting page number (default: 1)
 * @param {number} pageSize - Number of items per page (default: 10)
 * 
 * @returns {Object} - { items, isLoading, error, hasMore, loadMore, reset }
 */
export function useInfiniteScroll(queryHook, queryParams = {}, initialPage = 1, pageSize = 10) {
  const [page, setPage] = useState(initialPage);
  const [allItems, setAllItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  // Fetch data for current page
  const { data, isLoading, error, isFetching } = queryHook({
    ...queryParams,
    page,
    limit: pageSize,
  });

  // Reset when query params change (e.g., filter changes)
  useEffect(() => {
    setPage(initialPage);
    setAllItems([]);
    setHasMore(true);
  }, [JSON.stringify(queryParams), initialPage]);

  // Update items when new data arrives
  useEffect(() => {
    if (data?.data) {
      const newItems = data.data;
      
      if (page === initialPage) {
        // First page - replace items
        setAllItems(newItems);
      } else {
        // Subsequent pages - append items (avoid duplicates)
        setAllItems((prev) => {
          const existingIds = new Set(prev.map(item => item._id || item.id));
          const uniqueNewItems = newItems.filter(item => 
            !existingIds.has(item._id || item.id)
          );
          return [...prev, ...uniqueNewItems];
        });
      }

      // Check if there are more pages
      const pagination = data.pagination || {};
      const totalPages = pagination.totalPages || 0;
      
      // Determine hasMore based on pagination
      if (totalPages > 0) {
        setHasMore(page < totalPages);
      } else {
        // If no pagination info, check if we got a full page
        setHasMore(newItems.length === pageSize);
      }
    }
  }, [data, page, initialPage, pageSize]);

  // Load more function
  const loadMore = useCallback(() => {
    if (!isLoading && !isFetching && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [isLoading, isFetching, hasMore]);

  // Reset function
  const reset = useCallback(() => {
    setPage(initialPage);
    setAllItems([]);
    setHasMore(true);
  }, [initialPage]);

  return {
    items: allItems,
    isLoading: isLoading && page === initialPage, // Only show loading on first load
    isFetchingMore: isFetching && page > initialPage, // Show different loading for "load more"
    error,
    hasMore,
    loadMore,
    reset,
    currentPage: page,
    totalItems: allItems.length,
  };
}

