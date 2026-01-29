import { useMemo, useState } from 'react';
import { useGetSocialsQuery } from '@/store/client/clientSocialApiSlice';
import { Button } from 'react-aria-components';
import { Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { checkAccess } from '@/utils/accessControl';
import { PlanSelectionModal } from '@/components/payment/PlanSelectionModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import ShowMoreLess from '@/components/common/ShowMoreLess';
import { Toolbar, ToolbarHeading } from '@/components/layouts/layout-7/components/toolbar';
import { Card, CardContent, CardFooter, CardHeader, CardHeading, CardTitle, CardToolbar } from '../../../components/ui/card';
import useDocumentTitle from '../../../hooks/use-document-title';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated } from '@/store/authSlice';
import { useGetPurchasedPlanIdsQuery } from '@/store/client/clientPaymentApiSlice';
import { UidRequired } from '@/components/common/access-states/UidRequired';


export default function SocialPage() {
  useDocumentTitle('Social');
  const navigate = useNavigate();
  const [sortValue, setSortValue] = useState('latest');
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]); // kept for compatibility if needed elsewhere
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedContentForPurchase, setSelectedContentForPurchase] = useState(null);
  const [showUidModal, setShowUidModal] = useState(false);
  const [filters, setFilters] = useState({
    images: false,
    videos: false,
    textPosts: false,
  });

  // Access control hooks - called at component level
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const { data: purchasedPlansData } = useGetPurchasedPlanIdsQuery(undefined, {
    skip: !isAuthenticated,
  });

  const purchasedPlanIds = useMemo(() => {
    if (!purchasedPlansData?.data?.planIds) return new Set();
    return new Set(purchasedPlansData.data.planIds);
  }, [purchasedPlansData]);

  const userUid = useMemo(() => {
    if (!user) return null;
    return user.uid || user.credential?.uid || null;
  }, [user]);

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


    return data?.data?.map((post) => {
      // Get author information
      const author = post?.author || {};
      const authorName =
        author?.first_name && author?.last_name
          ? `${author?.first_name || ''} ${author?.last_name || ''}`.trim()
          : author?.first_name || author?.last_name || 'Unknown Author';

      // Format date
      const createdAt = post?.createdAt ? new Date(post.createdAt) : new Date();
      const timeAgo = formatTimeAgo(createdAt);

      // Get images array - extract URLs from image objects
      const imageUrls = post?.images && Array.isArray(post.images) && post.images.length > 0
        ? post.images.map(img => img?.url || img).filter(Boolean)
        : [];

      // Get first image for backward compatibility
      const image = imageUrls?.length > 0 ? imageUrls[0] : null;

      // Get videos array - extract URLs from video objects
      const videoUrls = post?.videos && Array.isArray(post.videos) && post.videos.length > 0
        ? post.videos.map(video => video?.url || video).filter(Boolean)
        : [];

      // Get avatar
      const avatar = author?.image || '/media/avatars/1.png';
      const fallback =
        authorName
          ?.split(' ')
          ?.map((n) => n?.[0])
          ?.join('')
          ?.toUpperCase()
          ?.slice(0, 2) || 'U';

      // Calculate views from likes, comments, and shares
      const totalViews =
        (post?.likes?.length || 0) +
        (post?.comments?.length || 0) +
        (post?.shares?.length || 0);
      const views = totalViews > 0 ? formatViews(totalViews) : '0';

      // Get access type from post (can be PUBLIC, LOGGED_IN, UID_ONLY, PRO)
      const accessType = post?.tier || post?.accessType || 'PUBLIC';

      // Get category for host name
      const category = post?.category || 'Event';

      return {
        id: post?._id,
        _id: post?._id,
        author: {
          name: authorName,
          role: 'Educator', // Default role
          avatar: avatar,
          fallback: fallback,
        },
        time: timeAgo,
        content: post?.content || 'No content available.',
        image: image,
        images: imageUrls, // Array of image URLs (extracted from objects)
        videos: videoUrls, // Array of video URLs (extracted from objects)
        host: {
          name: category,
          desc: 'Social Post',
        },
        views: views,
        accessType: accessType,
        tier: post?.tier || post?.accessType || 'PUBLIC', // Use tier for unified access control
        plans: post?.plans || post?.allowedPlans || [], // Support both new (plans) and old (allowedPlans) format
        allowedPlans: post?.allowedPlans || [], // Keep for backward compatibility
        category: category,
        hashtags: post?.hashtags || [],
        mentions: post?.mentions || [],
        likes: post?.likes || [],
        comments: post?.comments || [],
        shares: post?.shares || [],
        createdAt: post?.createdAt,
        updatedAt: post?.updatedAt,
        // Spread other properties but exclude images and videos to avoid duplicates
        ...(({ images, videos, ...rest }) => rest)(post || {}),
      };
    });
  }, [data]);

  // Loading state
  if (isLoading) {
    return (
      <>
        <div className="flex justify-between items-center mb-6">
          <header className="">
            <h1 className="text-2xl font-semibold text-black dark:text-white">
              Social
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Latest community posts</p>
          </header>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500">Loading social posts...</p>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (isError) {
    return (
      <>
        <div className="flex justify-between items-center mb-6">
          <header className="">
            <h1 className="text-2xl font-semibold text-black dark:text-white">
              Social
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Latest community posts</p>
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
      </>
    );
  }

  // Empty state
  if (!posts || posts.length === 0) {
    return (
      <>
        <div className="flex justify-between items-center mb-6">
          <header className="">
            <h1 className="text-2xl font-semibold text-black dark:text-white">
              Social
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Latest community posts</p>
          </header>
          {/* <DropdownMenu>
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
          </DropdownMenu> */}
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-gray-500">No social posts available</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <header className="">
          <h1 className="text-2xl font-semibold text-black dark:text-white">
            Social
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Latest community posts</p>
        </header>
        {/* <DropdownMenu>
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
          </DropdownMenu> */}
      </div>
      <div>
        {posts?.map((post) => {
          // Compute access control using utility function (not hook) inside map
          const tier = post?.tier || post?.accessType || "PUBLIC";
          const contentPlans = (post?.plans || post?.allowedPlans || []).map(p => (p?._id || p)?.toString()).filter(Boolean);

          // Check if user has purchased any plan associated with this content
          const hasPurchase = tier === "PRO" && contentPlans.length > 0 && purchasedPlanIds.size > 0
            ? contentPlans.some(planId => purchasedPlanIds.has(planId))
            : false;

          // Use checkAccess utility function (not hook)
          const { hasAccess, showLock, lockReason, lockMessage } = checkAccess({
            tier,
            isAuthenticated,
            userUid,
            hasPurchase,
            isPremium: tier === "PRO",
          });

          const isLocked = showLock && !hasAccess;

          // Handle lock icon click - Determine which action to take based on access type
          const handleLockClick = (e) => {
            // Stop propagation to prevent card interactions
            e.stopPropagation();

            // 1. Login Required - Navigate to login page
            if (lockReason === 'LOGIN_REQUIRED' || (tier === 'PRO' && !isAuthenticated)) {
              navigate('/login', { state: { from: window.location.pathname } });
              return;
            }

            // 2. UID Required - Show UID modal
            if (lockReason === 'UID_REQUIRED') {
              setShowUidModal(true);
              return;
            }

            // 3. Purchase Required (Paid content) - ALWAYS show plan modal
            if (lockReason === 'PURCHASE_REQUIRED' || tier === 'PRO') {
              // Debug: Log the post object to see what we're working with
              console.log('Post object for purchase:', post);
              console.log('Plans from post:', post?.plans);

              // Get plans from the content item
              // Plans can come as an array of objects (populated) or array of IDs (not populated)
              const rawPlans = post?.plans || [];
              console.log('Raw plans array:', rawPlans);

              // Filter out null/undefined and map to proper format
              const contentPlans = rawPlans
                .filter(p => p && (p?._id || p))
                .map(p => {
                  // If p is just an ID string, return null (we'd need to fetch it, but for now skip)
                  if (typeof p === 'string') {
                    console.warn('Plan is a string ID, not populated:', p);
                    return null;
                  }
                  // If p is an object with _id, it's populated
                  return {
                    _id: p?._id || p,
                    name: p?.name || 'Plan',
                    description: p?.description || '',
                    price: p?.price || 0,
                    hotmartCheckoutUrl: p?.hotmartCheckoutUrl || '',
                  };
                })
                .filter(Boolean); // Remove null entries

              console.log('Processed content plans:', contentPlans);

              if (contentPlans.length === 0) {
                toast.error('No plans available for this content');
                console.error('No valid plans found. Raw plans:', rawPlans);
                return;
              }

              // ALWAYS show modal - even for single plan (user requirement)
              console.log('✅ Plans detected - opening modal', {
                plansCount: contentPlans.length,
                plans: contentPlans
              });
              setSelectedContentForPurchase({
                id: post?._id || post?.id,
                title: post?.content?.substring(0, 50) || 'Social Post',
                plans: contentPlans,
                contentType: 'post',
              });
              setShowPlanModal(true);
            }
          };

          return (
            <div
              className="relative h-full"
              key={post?.id || post?._id}
            >
              <Card className="container overflow-hidden rounded-xl shadow-md mb-5 h-full relative max-w-full md:max-w-2xl mx-auto pb-8">

                {/* Lock Icon - Top Right Corner of entire card (only when locked) */}
                {isLocked && (
                  <div
                    className="absolute top-3 right-3 z-30 cursor-pointer"
                    onClick={handleLockClick}
                  >
                    <div className="bg-yellow-500 backdrop-blur-sm p-2.5 rounded-full hover:bg-yellow-600/80 transition-all">
                      <Lock className="w-5 h-5 text-white" />
                    </div>
                  </div>
                )}

                <CardHeader className="p-4 justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={post?.author?.image}
                        alt={post?.author?.name || 'Author'}
                      />
                      <AvatarFallback>
                        {post?.author?.fallback || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold truncate">
                            {`${post?.author?.first_name || ''} ${post?.author?.last_name || ''}`.trim() ||
                              'Unknown Author'}{' '}
                            <span className="text-xs font-normal text-gray-400">
                              • {post?.author?.role || 'Educator'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 truncate">
                            {/* {post?.time || ''} */}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className={`p-4 pt-2 ${isLocked ? 'opacity-85' : ''}`}>
                  <div className="">
                    <div className="text-sm text-gray-600 dark:text-gray-100 mt-2">
                      {post?.content ? (
                        isLocked ? (
                          <p className="line-clamp-3">{`${(post?.content || "").substring(0, 8)}******`}</p>
                        ) : (
                          <ShowMoreLess text={post.content} limit={100} />
                        )
                      ) : (
                        <p className="line-clamp-3">No content available.</p>
                      )}
                    </div>
                  </div>
                  {/* Images (grid view, click to open modal) */}
                  {post?.images &&
                    Array.isArray(post.images) &&
                    post.images.length > 0 && (() => {
                      const images = post.images.filter(Boolean);
                      if (images.length === 0) return null;

                      const openImage = (idx) => {
                        if (!hasAccess) return;
                        const safeIdx = Math.max(0, Math.min(idx, images.length - 1));
                        setSelectedImage(images[safeIdx]);
                      };

                      // Single image: show as uploaded (contain, max width like PostCard)
                      if (images.length === 1) {
                        return (
                          <div className="mt-5 flex justify-center">
                            <button
                              type="button"
                              className="w-full max-w-[650px] rounded-xl overflow-hidden bg-black/5 dark:bg-white/5"
                              onClick={() => openImage(0)}
                              disabled={!hasAccess}
                            >
                              <img
                                src={images[0]}
                                alt={post?.content || 'Social post'}
                                className="w-full h-auto max-h-[600px] object-contain"
                                onError={(e) => {
                                  if (e?.target) e.target.style.display = 'none';
                                }}
                              />
                            </button>
                          </div>
                        );
                      }

                      // Multi image: grid preview (like reference)
                      const showImages = images.slice(0, 4);
                      const remaining = images.length - showImages.length;

                      return (
                        <div className="mt-5 flex justify-center">
                          <div className="w-full max-w-[650px] grid grid-cols-2 gap-2">
                            {showImages.map((src, idx) => (
                              <div
                                key={`${src}-${idx}`}
                                className="w-full max-w-[650px] rounded-xl overflow-hidden bg-black/5 dark:bg-white/5"
                                onClick={() => openImage(idx)}
                                disabled={!hasAccess}
                              >
                                <img
                                  src={src}
                                  alt={post?.content || 'Social post'}
                                  className="w-full aspect-square object-contain transition-all duration-300 ease-in-out group-hover:scale-105"
                                  onError={(e) => {
                                    if (e?.target) e.target.style.display = 'none';
                                  }}
                                />

                                {idx === 3 && remaining > 0 && (
                                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <span className="text-white text-xl font-semibold">
                                      +{remaining}
                                    </span>
                                  </div>
                                )}
                                {selectedImage && (
                                  <div
                                    className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
                                    onClick={() => setSelectedImage(null)}
                                  >
                                    <div
                                      className="relative"
                                      onClick={(e) => e?.stopPropagation()}
                                    >
                                      <img
                                        src={selectedImage}
                                        alt="Social post image"
                                        className="rounded-2xl max-w-full max-h-[90vh] border border-gray-200 dark:border-[#2C2F36]"
                                        onError={(e) => {
                                          if (e?.target) {
                                            e.target.style.display = 'none';
                                          }
                                        }}
                                      />
                                      <button
                                        type="button"
                                        className="absolute top-3 right-3 bg-white dark:bg-[#1F1F23] text-black dark:text-[#EDEDED] hover:bg-gray-200 dark:hover:bg-[#3B3B42] px-3 py-1 rounded-lg shadow-md transition cursor-pointer"
                                        onClick={() => setSelectedImage(null)}
                                        aria-label="Close image"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  {/* Videos */}
                  {post?.videos &&
                    Array.isArray(post.videos) &&
                    post.videos.length > 0 && (
                      <div className={`rounded-xl overflow-hidden space-y-4 mb-4 ${isLocked ? 'blur-md' : ''}`}>
                        {post.videos.map((video, idx) => (
                          <div
                            key={idx}
                            className="relative w-full h-72 rounded-xl overflow-hidden bg-black"
                          >
                            <video
                              src={video}
                              controls
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                if (e?.target) {
                                  e.target.style.display = 'none';
                                }
                              }}
                            >
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        ))}
                      </div>
                    )}
                </CardContent>

                {/* Full Card Lock Overlay - Semi-transparent overlay over entire card */}
                {isLocked && (
                  <div
                    className="absolute inset-0 z-10 rounded-xl cursor-pointer"
                    onClick={handleLockClick}
                  />
                )}
              </Card>
            </div>
          );
        })}
      </div>

      {/* Plan Selection Modal */}
      {selectedContentForPurchase && (
        <PlanSelectionModal
          open={showPlanModal}
          onOpenChange={setShowPlanModal}
          courseId={selectedContentForPurchase.id} // Reusing courseId prop name for compatibility
          courseTitle={selectedContentForPurchase.title}
          plans={selectedContentForPurchase.plans}
          useDirectPlanCheckout={true} // Use plan's checkout URL directly (non-course content)
          onPurchaseSuccess={() => {
            setShowPlanModal(false);
            setSelectedContentForPurchase(null);
          }}
          onPurchaseError={() => {
            setShowPlanModal(false);
          }}
        />
      )}

      {/* UID Required Modal */}
      <Dialog open={showUidModal} onOpenChange={setShowUidModal}>
        <DialogContent className="sm:max-w-md">
          <UidRequired
            onConnectUid={(e) => {
              e?.preventDefault();
              e?.stopPropagation();
              setShowUidModal(false);
              // Only navigate to login if user is not authenticated
              if (!isAuthenticated) {
                navigate('/login', { state: { from: window.location.pathname } });
              }
            }}
            onClose={() => setShowUidModal(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Simple Image Modal (single image only) */}

    </>
  );
}