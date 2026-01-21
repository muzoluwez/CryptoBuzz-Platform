import { useMemo, useState } from 'react';
import ImageViewer from '@/components/common/ImageViewer';
import ImageCarousel from '@/components/common/ImageCarousel';
import { useGetTradeAnalysisQuery } from '@/store/client/clientTradeAnalysisApiSlice';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';
import {
  convertRtkEditorToDisplayFormat,
  convertRtkEditorToFormattedPlainText,
} from '@/lib/rtkEditorUtils';
import { useNavigate } from 'react-router-dom';
import { checkAccess } from '@/utils/accessControl';
import { CourseLockOverlay } from '@/components/payment/CourseLockOverlay';
import { PlanSelectionModal } from '@/components/payment/PlanSelectionModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import ViewInsightModel from '@/components/models/ViewInsightModel';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated } from '@/store/authSlice';
import { useGetPurchasedPlanIdsQuery } from '@/store/client/clientPaymentApiSlice';

import {
  Toolbar,
  ToolbarHeading,
} from '@/components/layouts/layout-7/components/toolbar';
import useDocumentTitle from '../../../hooks/use-document-title';

export default function InsightPage() {
  useDocumentTitle('Insights');
  const [hoveredInsightId, setHoveredInsightId] = useState(null);
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedContentForPurchase, setSelectedContentForPurchase] = useState(null);
  const navigate = useNavigate();

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


  // ------------------- API CALL -------------------
  const { data, isLoading, error } = useGetTradeAnalysisQuery({
    page: 1,
    limit: 50, // Get more items for filtering
  });

  // ------------------- TRANSFORM API DATA -------------------
  const insights = useMemo(() => {
    if (!data?.data) return [];

    return data?.data?.map((insight) => {
      const createdBy = insight?.createdBy || {};
      const authorName =
        createdBy?.first_name && createdBy?.last_name
          ? `${createdBy?.first_name || ''} ${createdBy?.last_name || ''}`.trim()
          : createdBy?.first_name || createdBy?.last_name || 'Unknown Author';

      const categoryName = insight?.category?.name || 'Uncategorized';

      // Format date
      const date = insight?.createdAt
        ? new Date(insight.createdAt).toLocaleString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
        : new Date().toLocaleString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });

      // Get formatted plain text - converts HTML and \r\n to proper plain text
      const plainTextDescription = insight?.description
        ? convertRtkEditorToFormattedPlainText(insight.description, true)
        : '';

      // Get display format with clickable links for full view
      const fullDisplayHtml = insight?.description
        ? convertRtkEditorToDisplayFormat(insight.description, true, true)
        : '';

      // For preview: get single line version (no line breaks) and limit to 2 lines worth
      const singleLineText = insight?.description
        ? convertRtkEditorToFormattedPlainText(insight.description, false)
        : '';

      // Calculate approximate characters for 2 lines (assuming ~50 chars per line)
      const maxChars = 100;
      const preview = singleLineText
        ? singleLineText.length > maxChars
          ? singleLineText.substring(0, maxChars) + '...'
          : singleLineText
        : 'No description available.';

      // Get image from photos array or use placeholder
      const image =
        insight?.photos && insight.photos?.length > 0
          ? insight.photos[0]
          : 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1400&auto=format&fit=crop';

      // Get avatar from createdBy
      const avatar = createdBy?.image || '/media/avatars/1.png';

      return {
        id: insight?._id,
        _id: insight?._id,
        title: insight?.title || 'Untitled Insight',
        author: authorName,
        date: date,
        preview: preview,
        full: plainTextDescription || 'No content available.',
        fullDisplayHtml: fullDisplayHtml || '', // HTML with clickable links and line breaks
        fullHtml: insight.description || '', // Keep original HTML for reference if needed
        image: image,
        avatar: avatar,
        accessType: insight.accessType || 'PUBLIC',
        tier: insight.accessType || 'PUBLIC', // Use tier for unified access control
        plans: insight.plans || insight.allowedPlans || [], // Support both new (plans) and old (allowedPlans) format
        allowedPlans: insight.allowedPlans || [], // Keep for backward compatibility
        url: insight.url,
        data: insight.data,
        photos: insight.photos || [],
        ...insight, // Include all other properties
        category: categoryName, // Override category with string name after spread
      };
    });
  }, [data]);

  // ------------------- FILTER LOGIC -------------------
  const filteredInsights = useMemo(() => {
    if (activeTab === 'All') {
      return insights;
    }
    return insights.filter((item) => item.category === activeTab);
  }, [insights, activeTab]);

  // ------------------- GET UNIQUE CATEGORIES -------------------
  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      insights.map((insight) => insight.category),
    );
    return ['All', ...Array.from(uniqueCategories).filter(Boolean)];
  }, [insights]);

  return (
    <>
      <div className="container py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">
            Insight Feed
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Latest market insights and analysis
          </p>
        </header>

        {/* ------------------- LOADING STATE ------------------- */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
              <p className="mt-4 text-muted-foreground">Loading insights...</p>
            </div>
          </div>
        )}

        {/* ------------------- ERROR STATE ------------------- */}
        {error && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-500 text-lg font-semibold">
                Error loading insights
              </p>
              <p className="text-muted-foreground mt-2">
                {error?.data?.message ||
                  error?.error ||
                  'Something went wrong. Please try again later.'}
              </p>
            </div>
          </div>
        )}

        {/* ------------------- TABS ------------------- */}
        {!isLoading && !error && (
          <div className="flex gap-3 mb-6 flex-wrap">
            {categories.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  px-4 py-2 text-sm font-medium rounded-lg
                  transition cursor-pointer
                  ${activeTab === tab
                    ? 'bg-yellow-500 text-white shadow'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }
                `}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* ------------------- GRID ------------------- */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInsights.length === 0 && !isLoading && !error && (
              <div className="col-span-full flex items-center justify-center py-12">
                <p className="text-muted-foreground">
                  No insights available at the moment.
                </p>
              </div>
            )}

            {filteredInsights.map((insight) => {
              // Compute access control using utility function (not hook) inside map
              const tier = insight?.tier || insight?.accessType || "PUBLIC";
              const contentPlans = (insight?.plans || insight?.allowedPlans || []).map(p => (p?._id || p)?.toString()).filter(Boolean);

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

              // Handle purchase action (only called when user is authenticated)
              const handlePurchase = () => {
                if (tier === 'PRO' && isAuthenticated) {
                  // Debug: Log the insight object to see what we're working with
                  console.log('Insight object for purchase:', insight);
                  console.log('Plans from insight:', insight.plans);

                  // Get plans from the content item
                  // Plans can come as an array of objects (populated) or array of IDs (not populated)
                  const rawPlans = insight?.plans || insight?.allowedPlans || [];
                  console.log('Raw plans array:', rawPlans);

                  // Filter out null/undefined and map to proper format
                  const contentPlans = rawPlans
                    .filter(p => p && (p._id || p))
                    .map(p => {
                      // If p is just an ID string, return null (we'd need to fetch it, but for now skip)
                      if (typeof p === 'string') {
                        console.warn('Plan is a string ID, not populated:', p);
                        return null;
                      }
                      // If p is an object with _id, it's populated
                      return {
                        _id: p._id || p,
                        name: p.name || 'Plan',
                        description: p.description || '',
                        price: p.price || 0,
                        hotmartCheckoutUrl: p.hotmartCheckoutUrl || '',
                      };
                    })
                    .filter(Boolean); // Remove null entries

                  console.log('Processed content plans:', contentPlans);

                  if (contentPlans.length === 0) {
                    toast.error('No plans available for this content');
                    console.error('No valid plans found. Raw plans:', rawPlans);
                    return;
                  }

                  // If multiple plans, show selection modal
                  if (contentPlans.length > 1) {
                    setSelectedContentForPurchase({
                      id: insight?._id,
                      title: insight?.title,
                      plans: contentPlans,
                      contentType: 'insight',
                    });
                    setShowPlanModal(true);
                  } else {
                    // Single plan - redirect directly to checkout
                    const plan = contentPlans[0];
                    if (plan.hotmartCheckoutUrl) {
                      window.location.href = plan.hotmartCheckoutUrl;
                    } else {
                      toast.error('Checkout URL not available for this plan');
                    }
                  }
                }
              };

              return (
                <div
                  className="relative h-full"
                  key={insight?._id || insight?.id}
                >
                  <Card
                    className="bg-card border border-border overflow-hidden h-full"
                  >

                    {/* image */}
                    <div className="w-full h-44 overflow-hidden relative">
                      <div className={isLocked ? 'blur-md' : ''}>
                        <ImageCarousel
                          images={
                            insight?.photos && Array.isArray(insight.photos) && insight.photos.length > 0
                              ? insight.photos
                              : insight?.image
                                ? [insight.image]
                                : []
                          }
                          alt={insight?.title || "Trade insight"}
                          height="h-44"
                          showViewButton={hasAccess}
                        />
                      </div>
                    </div>

                    <CardContent className="p-4">
                      {/* Author */}
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={insight?.avatar}
                            alt={insight?.author || "Author"}
                          />
                          <AvatarFallback>{insight?.author?.[0] || "A"}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium truncate">
                                {insight?.author || "Unknown"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {insight?.date || ""}
                              </p>
                            </div>
                            <Badge>{insight?.category || ""}</Badge>
                          </div>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="mt-4 text-lg font-bold text-primary">
                        {insight?.title || "Untitled"}
                      </h3>

                      {/* Preview - 2 lines max */}
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2 h-10">
                        {isLocked ? `${(insight?.preview || "").substring(0, 8)}******` : (insight?.preview || "")}
                      </p>

                      {/* Button - Only show when not locked */}
                      {!isLocked && (
                        <div className="mt-4">
                          <Button
                            onClick={() => setSelectedInsight(insight)}
                            className="w-full bg-yellow-600 text-white hover:bg-yellow-700"
                          >
                            View Details
                          </Button>
                        </div>
                      )}
                    </CardContent>

                    {!isLocked && (
                      <CardFooter className="p-4">
                        <div className="text-sm text-muted-foreground">
                          Published • {insight?.date?.split(',')?.[0] || ""}
                        </div>
                      </CardFooter>
                    )}
                  </Card>

                  {/* Full Card Lock Overlay */}
                  {isLocked && (
                    <div className="absolute inset-0 z-40 rounded-lg overflow-hidden">
                      <CourseLockOverlay
                        tier={tier}
                        lockReason={lockReason}
                        lockMessage={lockMessage}
                        onPurchase={handlePurchase}
                        contentType="Insight"
                      />
                    </div>
                  )}

                  {/* Hover Overlay with Message */}
                  {!hasAccess && hoveredInsightId === insight._id && (
                    <div
                      className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 rounded-xl cursor-pointer transition-opacity animate-in fade-in duration-200"
                      onClick={() => navigate('/login')}
                    >
                      <div className="text-center text-white p-6">
                        <Lock className="w-12 h-12 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">
                          Login Required
                        </h3>
                        <p className="text-sm opacity-90">
                          Please login to view insights
                        </p>
                      </div>
                    </div>
                  )}
                </div>

              );
            })}
          </div>
        )}
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

      {/* ------------------- MODAL ------------------- */}
      <ViewInsightModel
        insight={selectedInsight}
        isOpen={!!selectedInsight}
        onClose={() => setSelectedInsight(null)}
      />

      {/* Image Viewer Modal */}
      <ImageViewer
        image={selectedImage}
        images={
          selectedInsight?.photos && Array.isArray(selectedInsight.photos) && selectedInsight.photos.length > 0
            ? selectedInsight.photos
            : selectedInsight?.image
              ? [selectedInsight.image]
              : selectedImage
                ? [selectedImage]
                : []
        }
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        alt="Trade insight chart"
      />
    </>
  );
}
