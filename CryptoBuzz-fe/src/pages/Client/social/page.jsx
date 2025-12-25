import { useMemo, useState } from 'react';
import { useGetSocialsQuery } from '@/store/client/clientSocialApiSlice';
import {
  FilterIcon,
  Forward,
  MessageCircle,
  Settings,
  ThumbsUpIcon,
} from 'lucide-react';
import { Button } from 'react-aria-components';
import { Link } from 'react-router';
import { useAccessControl } from '@/hooks/use-access-control';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AccessGate } from '@/components/common/AccessGate';
import {
  Toolbar,
  ToolbarHeading,
} from '@/components/layouts/layout-7/components/toolbar';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardHeading,
  CardTitle,
  CardToolbar,
} from '../../../components/ui/card';

export function SocialPage() {
  const [sortValue, setSortValue] = useState('latest');
  const [filters, setFilters] = useState({
    images: false,
    videos: false,
    textPosts: false,
  });

  const { checkAccess } = useAccessControl();

  // Fetch social posts from API
  const { data, isLoading, isError, error } = useGetSocialsQuery({
    page: 1,
    limit: 50,
    category: filters.category || undefined,
  });

  // Helper function to format time ago
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  // Helper function to format views
  const formatViews = (views) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  // Transform API data to match component structure
  const posts = useMemo(() => {
    if (!data?.data) return [];

    return data.data.map((post) => {
      // Get author information
      const author = post.author || {};
      const authorName =
        author.first_name && author.last_name
          ? `${author.first_name} ${author.last_name}`
          : author.first_name || author.last_name || 'Unknown Author';

      // Format date
      const createdAt = post.createdAt ? new Date(post.createdAt) : new Date();
      const timeAgo = formatTimeAgo(createdAt);

      // Get image from images array (first image) - use as is from backend
      const image =
        post.images && post.images.length > 0 && post.images[0]?.url
          ? post.images[0].url
          : null; // Don't use placeholder, show nothing if no image

      // Get avatar
      const avatar = author.image || '/media/avatars/1.png';
      const fallback =
        authorName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2) || 'U';

      // Calculate views from likes, comments, and shares
      const totalViews =
        (post.likes?.length || 0) +
        (post.comments?.length || 0) +
        (post.shares?.length || 0);
      const views = totalViews > 0 ? formatViews(totalViews) : '0';

      // Make all posts PUBLIC (free access)
      const accessType = 'PUBLIC';

      // Get category for host name
      const category = post.category || 'Event';

      return {
        id: post._id,
        _id: post._id,
        author: {
          name: authorName,
          role: 'Educator', // Default role
          avatar: avatar,
          fallback: fallback,
        },
        time: timeAgo,
        content: post.content || 'No content available.',
        image: image,
        images: post.images || [], // Keep all images
        videos: post.videos || [], // Keep videos
        host: {
          name: category,
          desc: 'Social Post',
        },
        views: views,
        accessType: accessType,
        allowedPlans: post.allowedPlans || [],
        category: category,
        hashtags: post.hashtags || [],
        mentions: post.mentions || [],
        likes: post.likes || [],
        comments: post.comments || [],
        shares: post.shares || [],
        ...post, // Include all other properties
      };
    });
  }, [data]);

  // Loading state
  if (isLoading) {
    return (
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <header className="">
            <h1 className="text-2xl font-semibold text-black dark:text-white">
              Social
            </h1>
            <p className="text-xs text-gray-500 mt-1">Home / Social</p>
          </header>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500">Loading social posts...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <header className="">
            <h1 className="text-2xl font-semibold text-black dark:text-white">
              Social
            </h1>
            <p className="text-xs text-gray-500 mt-1">Home / Social</p>
          </header>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-500 mb-2">Error loading social posts</p>
            <p className="text-sm text-gray-500">
              {error?.data?.message || error?.message || 'Something went wrong'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!posts || posts.length === 0) {
    return (
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <header className="">
            <h1 className="text-2xl font-semibold text-black dark:text-white">
              Social
            </h1>
            <p className="text-xs text-gray-500 mt-1">Home / Social</p>
          </header>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="btn !flex gap-2 bg-primary !text-dark cursor-pointer ">
                Filter <FilterIcon className="w-5" />{' '}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuLabel>Filter</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup>
                <DropdownMenuRadioItem>
                  Email Notifications
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem>SMS Notifications</DropdownMenuRadioItem>
                <DropdownMenuRadioItem>
                  Push Notifications
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-gray-500">No social posts available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <header className="">
            <h1 className="text-2xl font-semibold text-black dark:text-white">
              Social
            </h1>
            <p className="text-xs text-gray-500 mt-1">Home / Social</p>
          </header>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="btn !flex gap-2 bg-primary !text-dark cursor-pointer ">
                Filter <FilterIcon className="w-5" />{' '}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuLabel>Filter</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup>
                <DropdownMenuRadioItem>
                  Email Notifications
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem>SMS Notifications</DropdownMenuRadioItem>
                <DropdownMenuRadioItem>
                  Push Notifications
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div>
          {posts.map((post) => (
            <AccessGate
              key={post.id}
              accessType={post.accessType}
              allowedPlans={post.allowedPlans}
              fallback={
                <Card className="max-w-full overflow-hidden rounded-xl shadow-md mb-5 opacity-75">
                  <CardHeader className="p-4 justify-between blur-[2px]">
                    {/* Masked Header */}
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>?</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="h-3 w-24 bg-gray-100 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 flex flex-col items-center justify-center min-h-[200px] gap-3">
                    <span className="text-lg font-semibold text-gray-500">
                      {post.accessType === 'LOGIN_REQUIRED'
                        ? 'Login to view this post'
                        : 'Upgrade to view this post'}
                    </span>
                    <Button className="bg-primary text-white" disabled>
                      Locked Content
                    </Button>
                  </CardContent>
                </Card>
              }
            >
              <Card className="max-w-full overflow-hidden rounded-xl shadow-md mb-5">
                <CardHeader className="p-4 justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={post.author.avatar}
                        alt={post.author.name}
                      />
                      <AvatarFallback>{post.author.fallback}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold truncate">
                            {post.author.name}{' '}
                            <span className="text-xs font-normal text-gray-400">
                              • {post.author.role}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 truncate">
                            {post.time}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardToolbar>
                    <Button
                      mode="icon"
                      variant="outline"
                      size="sm"
                      className="opacity-80"
                    >
                      <Settings />
                    </Button>
                  </CardToolbar>
                </CardHeader>

                <CardContent className="p-4 pt-2">
                  <div className="mb-5">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-3">
                      {post.content}{' '}
                      <span className="text-blue-400">...more</span>
                    </p>
                  </div>
                  {post.image && (
                    <Link to="/client/viewprofile">
                      <div className="rounded-xl overflow-hidden h-72 relative">
                        <img
                          src={post.image}
                          alt={post.content || 'Social post'}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                        <div className="absolute left-4 bottom-4 text-white">
                          <div className="text-xs uppercase opacity-80 tracking-wider">
                            Hosted by
                          </div>
                          <div className="text-lg font-bold text-primary">
                            {post.host.name}
                          </div>
                          <div className="text-sm opacity-90">
                            {post.host.desc}
                          </div>
                        </div>
                      </div>
                    </Link>
                  )}
                </CardContent>

                <CardFooter className="p-4 pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      mode="icon"
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 cursor-pointer hover:text-primary"
                    >
                      <ThumbsUpIcon />
                    </Button>
                    <Button
                      mode="icon"
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 cursor-pointer hover:text-primary"
                    >
                      <MessageCircle />
                    </Button>
                    <Button
                      mode="icon"
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 cursor-pointer hover:text-primary"
                    >
                      <Forward />
                    </Button>
                  </div>
                  <div className="text-xs text-gray-700">
                    {post.views} views
                  </div>
                </CardFooter>
              </Card>
            </AccessGate>
          ))}
        </div>
      </div>
    </>
  );
}
