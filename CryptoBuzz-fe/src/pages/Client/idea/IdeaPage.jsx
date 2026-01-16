import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGetIdeasQuery } from '@/store/client/clientIdeaApiSlice';
import { CopyIcon, Eye, LockKeyhole } from "lucide-react";
import { toast } from 'sonner';
import { checkAccess } from '@/utils/accessControl';
import { CourseLockOverlay } from '@/components/payment/CourseLockOverlay';
import { PlanSelectionModal } from '@/components/payment/PlanSelectionModal';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated } from '@/store/authSlice';
import { useGetPurchasedPlanIdsQuery } from '@/store/client/clientPaymentApiSlice';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import ImageCarousel from '@/components/common/ImageCarousel';
import ImageViewer from '@/components/common/ImageViewer';
import { Toolbar, ToolbarHeading } from '@/components/layouts/layout-7/components/toolbar';
import ViewIdeaModel from '@/components/models/ViewIdeaModel';
import useDocumentTitle from '@/hooks/use-document-title';


export default function IdeaPage() {
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
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

  // Set the browser tab title for this page
  useDocumentTitle('Trade Ideas');


  // Copy to clipboard function
  const copyToClipboard = async (text, label) => {
    if (!text || text === '****') {
      toast.error('No value to copy');
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label || 'Value'} copied to clipboard!`);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy. Please try again.');
    }
  };

  // Fetch ideas from API
  const { data, isLoading, error } = useGetIdeasQuery({
    page: 1,
    limit: 10,
  });

  // Transform API data to match component format
  const cards = data?.data?.map((idea) => {
    const educator = idea?.educator || {};
    const educatorName = educator?.first_name && educator?.last_name
      ? `${educator?.first_name || ''} ${educator?.last_name || ''}`.trim()
      : educator?.first_name || educator?.last_name || "Unknown Trader";

    const categoryName = idea?.category?.name || "Unknown Market";

    const year = idea?.createdAt ? new Date(idea.createdAt).getFullYear().toString() : "2025";

    // Determine tag type based on idea type
    const typeTag = idea?.type
      ? { label: idea.type.toUpperCase(), type: idea.type.toLowerCase() }
      : null;

    const statusTag = idea?.status
      ? { label: idea.status, type: "status" }
      : { label: "Pending", type: "status" };

    const categoryTag = idea?.category?.name
      ? { label: idea.category.name.toUpperCase(), type: "pair" }
      : null;

    const name = idea?.name
      ? { label: idea.name, type: "name" }
      : null;

    const tags = [typeTag, name, statusTag].filter(Boolean);

    // Handle images - can be array or single string
    const images = idea?.image
      ? (Array.isArray(idea.image) ? idea.image : [idea.image])
      : idea?.image_Url
        ? [idea.image_Url]
        : ["https://via.placeholder.com/400x300"];

    return {
      _id: idea?._id,
      image: images, // Keep as array for ImageCarousel
      image_Url: idea?.image_Url, // Keep for backward compatibility
      avatar: educator?.image || "https://i.pravatar.cc/300",
      trader: educatorName,
      market: categoryName,
      year: year,
      entry: idea?.entry?.toString() || "0",
      invalidation: idea?.invalidation?.toString() || "0",
      exits: Array.isArray(idea?.exits)
        ? idea.exits.map(exit => exit?.toString() || "0")
        : ["0"],
      tags: tags,
      accessType: idea?.accessType || "PUBLIC",
      tier: idea?.accessType || "PUBLIC", // Use tier for unified access control
      plans: idea?.plans || idea?.allowedPlans || [], // Support both new (plans) and old (allowedPlans) format
      allowedPlans: idea?.allowedPlans || [], // Keep for backward compatibility
      uid: idea?._id,
      ...idea, // Include all other idea properties
    };
  }) || [];

  return (
    <>
      <div className="my-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-black dark:text-white">
            Trading Signals
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Analyze, and execute profitable trading opportunities with
            smart insights, market trends, and data-driven strategies
          </p>
        </header>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4 text-gray-500">Loading ideas...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-500 text-lg font-semibold">
                Error loading ideas
              </p>
              <p className="text-gray-500 mt-2">
                {error?.data?.message ||
                  error?.error ||
                  'Something went wrong. Please try again later.'}
              </p>
            </div>
          </div>
        )}

        {/* Responsive 3-Card Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cards.length === 0 && !isLoading && !error && (
              <div className="col-span-full flex items-center justify-center py-12">
                <p className="text-gray-500">
                  No ideas available at the moment.
                </p>
              </div>
            )}

            {cards.map((c, i) => {
              // Compute access control using utility function (not hook) inside map
              const tier = c.tier || c.accessType || "PUBLIC";
              const contentPlans = (c.plans || c.allowedPlans || []).map(p => (p?._id || p)?.toString()).filter(Boolean);

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
                  // Debug: Log the idea object to see what we're working with
                  console.log('Idea object for purchase:', c);
                  console.log('Plans from idea:', c.plans);
                  console.log('Allowed plans from idea:', c.allowedPlans);

                  // Get plans from the content item
                  // Plans can come as an array of objects (populated) or array of IDs (not populated)
                  const rawPlans = c.plans || c.allowedPlans || [];
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
                      id: c._id,
                      title: c.name,
                      plans: contentPlans,
                      contentType: 'idea',
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
                  key={c._id || i}
                >
                  <Card
                    className="rounded-2xl shadow-lg border border-gray-medium overflow-hidden animate-slideInUp h-full"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >

                    <CardHeader className="p-4">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-10">
                            <AvatarImage src={c.avatar} />
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{c.trader}</p>
                            <p className="text-sm ">{c.market}</p>
                          </div>
                        </div>
                        {/* <p className=" font-medium">{c.year}</p> */}
                      </div>
                    </CardHeader>

                    {/* TOP CHART IMAGE CAROUSEL */}
                    <div className="relative">
                      <div className={isLocked ? 'blur-[2px]' : ''}>
                        <ImageCarousel
                          images={
                            Array.isArray(c.image)
                              ? c.image
                              : [c.image || c.image_Url]
                          }
                          alt={c.name || 'Trading idea'}
                          height="h-52"
                          showViewButton={hasAccess}
                        />
                      </div>

                      {/* TAGS */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                        {c.tags.map((tag, idx) => {
                          console.log('Rendering tag:', tag);
                          const base =
                            'px-3 py-1 text-sm font-semibold rounded-lg';

                          // Buy/Sell tags
                          if (tag.type === 'buy' || tag.type === 'sell') {
                            const buySellClass =
                              tag.type === 'buy'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-red-100 text-red-700';
                            return (
                              <Badge
                                key={idx}
                                className={`${base} ${buySellClass}`}
                              >
                                {tag.label?.toString().toUpperCase()}
                              </Badge>
                            );
                          }

                          // Market / Pair tag
                          if (tag.type === 'pair') {
                            return (
                              <Badge
                                key={idx}
                                className={`${base} bg-gray-200 text-gray-600`}
                              >
                                {tag.label}
                              </Badge>
                            );
                          }

                          // Status tag - map to branded colors
                          if (tag.type === 'status') {
                            const statusClassMap = {
                              active: 'bg-cyan-700 text-white',
                              pending: 'bg-purple-700 text-white',
                              win: 'bg-emerald-500 text-white',
                              loss: 'bg-red-500 text-white',
                              partialWin: 'bg-purple-500 text-white',
                              breakEven: 'bg-blue-500 text-white',
                            };
                            const statusKey = (tag.label || '').toString();
                            const statusClass =
                              statusClassMap[statusKey] ||
                              'bg-gray-200 text-gray-700';

                            // Pretty label for statuses
                            const pretty =
                              statusKey === 'win'
                                ? `WIN ${c?.pips ? `+${c.pips}` : ''}`
                                : statusKey === 'loss'
                                  ? `LOSS ${c?.pips ? `-${c.pips}` : ''}`
                                  : statusKey === 'partialWin'
                                    ? `PARTIAL ${c?.pips ?? ''}`
                                    : statusKey === 'breakEven'
                                      ? 'BREAK EVEN'
                                      : statusKey?.toUpperCase();

                            return (
                              <Badge
                                key={idx}
                                className={`${base} ${statusClass}`}
                              >
                                {pretty}
                              </Badge>
                            );
                          }

                          // Fallback
                          return (
                            <Badge
                              key={idx}
                              className={`${base} bg-gray-200 text-gray-600`}
                            >
                              {tag.label}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>

                    {/* CONTENT */}
                    <CardContent className={`p-5 ${isLocked ? 'blur-[2px] opacity-85' : ''}`}>
                      {/* PRICE ROWS */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p>Entry</p>
                          <div className="flex items-center gap-2 justify-between min-w-20">
                            <CopyIcon
                              className={`w-4 ${!isLocked && c?.entry ? 'cursor-pointer hover:text-primary transition-colors' : 'cursor-not-allowed opacity-50'}`}
                              onClick={() =>
                                !isLocked &&
                                copyToClipboard(c?.entry, 'Entry price')
                              }
                            />
                            <p
                              className={
                                !isLocked ? 'text-green-500' : 'text-gray-400'
                              }
                            >
                              {isLocked ? '****' : c?.entry || '0'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between ">
                          <p>Invalidation</p>
                          <div className="flex items-center gap-2 justify-between min-w-20">
                            <CopyIcon
                              className={`w-4 ${!isLocked && c?.invalidation ? 'cursor-pointer hover:text-primary transition-colors' : 'cursor-not-allowed opacity-50'}`}
                              onClick={() =>
                                !isLocked &&
                                copyToClipboard(
                                  c?.invalidation,
                                  'Invalidation level',
                                )
                              }
                            />
                            <p
                              className={
                                !isLocked ? 'text-red-500' : 'text-gray-400'
                              }
                            >
                              {isLocked ? '****' : c?.invalidation || '0'}
                            </p>
                          </div>
                        </div>
                        {c?.exits?.map((exitVal, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between"
                          >
                            <p>{`Exit ${idx + 1}`}</p>
                            <div className="flex items-center gap-2 justify-between min-w-20">
                              <CopyIcon
                                className={`w-4 ${!isLocked && exitVal ? 'cursor-pointer hover:text-primary transition-colors' : 'cursor-not-allowed opacity-50'}`}
                                onClick={() =>
                                  !isLocked &&
                                  copyToClipboard(
                                    exitVal,
                                    `Exit target ${idx + 1}`,
                                  )
                                }
                              />
                              <p
                                className={
                                  !isLocked ? 'text-red-500' : 'text-gray-400'
                                }
                              >
                                {isLocked ? '****' : exitVal || '0'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>

                    {/* FOOTER - Only show when not locked */}
                    {!isLocked && (
                      <CardFooter className="p-5 pt-0">
                        <button
                          onClick={() => setSelectedCard(c)}
                          className="btn bg-primary text-black w-full flex! items-center justify-center gap-2 mt-4 hover:scale-up transition-all duration-300"
                        >
                          <Eye size={18} /> View Details
                        </button>
                      </CardFooter>
                    )}
                  </Card>

                  {/* Full Card Lock Overlay */}
                  {isLocked && (
                    <div className="absolute inset-0 z-40 rounded-2xl overflow-hidden">
                      <CourseLockOverlay
                        tier={tier}
                        lockReason={lockReason}
                        lockMessage={lockMessage}
                        onPurchase={handlePurchase}
                        contentType="Idea"
                      />
                    </div>
                  )}

                  {/* Hover Overlay with Message */}
                  {isLocked && hoveredCardId === c._id && (
                    <div
                      className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 rounded-2xl cursor-pointer transition-opacity animate-in fade-in duration-200"
                      onClick={() => navigate('/login')}
                    >
                      <div className="text-center text-white p-6">
                        <LockKeyhole className="w-12 h-12 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">
                          Login Required
                        </h3>
                        <p className="text-sm opacity-90">
                          Please login to view details
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

      {/* Image Viewer Modal */}
      <ImageViewer
        image={selectedImage}
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        alt="Trading signal chart"
      />

      {/* Details Modal using UI Library */}
      <ViewIdeaModel
        idea={selectedCard}
        isOpen={!!selectedCard}
        onClose={() => setSelectedCard(null)}
      />
    </>
  );
}