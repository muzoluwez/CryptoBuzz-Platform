/**
 * Example usage of InfiniteScroll component
 * 
 * This file demonstrates how to use the InfiniteScroll component
 * in Insight, Idea, and Social pages.
 */

import { InfiniteScroll, useInfiniteScroll } from './InfiniteScroll';
import { useGetIdeasQuery } from '@/store/client/clientIdeaApiSlice';
import { useGetTradeAnalysisQuery } from '@/store/client/clientTradeAnalysisApiSlice';
import { useGetSocialsQuery } from '@/store/client/clientSocialApiSlice';

// ============================================
// Example 1: Using with useInfiniteScroll Hook (Recommended)
// ============================================

export function IdeaPageWithInfiniteScroll() {
  // Use the hook to manage pagination
  const {
    items,
    isLoading,
    isFetchingMore,
    error,
    hasMore,
    loadMore,
  } = useInfiniteScroll(
    useGetIdeasQuery, // Your RTK Query hook
    {}, // Additional query params (category, search, etc.)
    1, // Initial page
    10 // Page size
  );

  // Render function for each item
  const renderItem = (idea, index) => {
    return (
      <div className="p-4 border rounded-lg">
        <h3>{idea.title || idea.market}</h3>
        <p>{idea.description}</p>
      </div>
    );
  };

  if (error) {
    return <div>Error loading ideas</div>;
  }

  return (
    <div>
      <h1>Ideas</h1>
      <InfiniteScroll
        items={items}
        renderItem={renderItem}
        onLoadMore={loadMore}
        hasMore={hasMore}
        isLoading={isFetchingMore}
        className="space-y-4"
      />
    </div>
  );
}

// ============================================
// Example 2: Using with Insight Page
// ============================================

export function InsightPageWithInfiniteScroll() {
  const {
    items,
    isLoading,
    isFetchingMore,
    error,
    hasMore,
    loadMore,
  } = useInfiniteScroll(
    useGetTradeAnalysisQuery,
    { categoryName: 'Crypto' }, // Query params
    1,
    10
  );

  const renderInsight = (insight, index) => {
    return (
      <Card className="mb-4">
        <CardContent>
          <h3>{insight.title}</h3>
          <p>{insight.description}</p>
        </CardContent>
      </Card>
    );
  };

  return (
    <div>
      <h1>Insights</h1>
      {isLoading && <div>Loading initial data...</div>}
      <InfiniteScroll
        items={items}
        renderItem={renderInsight}
        onLoadMore={loadMore}
        hasMore={hasMore}
        isLoading={isFetchingMore}
        className="space-y-4"
      />
    </div>
  );
}

// ============================================
// Example 3: Using with Social Page
// ============================================

export function SocialPageWithInfiniteScroll() {
  const {
    items,
    isLoading,
    isFetchingMore,
    error,
    hasMore,
    loadMore,
  } = useInfiniteScroll(
    useGetSocialsQuery,
    { category: undefined },
    1,
    10
  );

  const renderPost = (post, index) => {
    return (
      <div className="p-4 border rounded-lg mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Avatar>
            <AvatarImage src={post.author?.image} />
            <AvatarFallback>{post.author?.name?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{post.author?.name}</p>
            <p className="text-sm text-gray-500">{post.timeAgo}</p>
          </div>
        </div>
        <p>{post.content}</p>
        {post.image && (
          <img src={post.image} alt="Post" className="mt-2 rounded-lg" />
        )}
      </div>
    );
  };

  return (
    <div>
      <h1>Social Posts</h1>
      <InfiniteScroll
        items={items}
        renderItem={renderPost}
        onLoadMore={loadMore}
        hasMore={hasMore}
        isLoading={isFetchingMore}
        itemClassName="mb-4"
      />
    </div>
  );
}

// ============================================
// Example 4: Manual Implementation (Advanced)
// ============================================

export function ManualInfiniteScrollExample() {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const { data, isLoading } = useGetIdeasQuery({
    page,
    limit: 10,
  });

  useEffect(() => {
    if (data?.data) {
      if (page === 1) {
        setItems(data.data);
      } else {
        setItems((prev) => [...prev, ...data.data]);
      }
      setHasMore(page < (data.pagination?.totalPages || 0));
    }
  }, [data, page]);

  const loadMore = () => {
    if (!isLoading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <InfiniteScroll
      items={items}
      renderItem={(item) => <div>{item.title}</div>}
      onLoadMore={loadMore}
      hasMore={hasMore}
      isLoading={isLoading}
    />
  );
}

