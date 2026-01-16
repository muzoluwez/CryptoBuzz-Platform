import {
  Toolbar,
  ToolbarHeading,
} from '@/components/layouts/layout-7/components/toolbar';
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { useState, useMemo } from "react";
import { checkAccess } from "@/utils/accessControl";
import { CourseLockOverlay } from "@/components/payment/CourseLockOverlay";
import { PlanSelectionModal } from "@/components/payment/PlanSelectionModal";
import { useGetCryptosQuery } from "@/store/client/clientCryptoApiSlice";
import { convertRtkEditorToFormattedPlainText, convertRtkEditorToDisplayFormat } from "@/lib/rtkEditorUtils";
import ImageViewer from "@/components/common/ImageViewer";
import ImageCarousel from "@/components/common/ImageCarousel";
import ViewCryptoModel from "@/components/models/ViewCryptoModel";
import useDocumentTitle from '../../../hooks/use-document-title';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated } from '@/store/authSlice';
import { useGetPurchasedPlanIdsQuery } from '@/store/client/clientPaymentApiSlice';

export default function CryptoPage() {
  useDocumentTitle('Crypto Analysis');
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

  // ------------------- STATE -------------------
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState("All");

  // ------------------- API CALL -------------------
  const { data, isLoading, error } = useGetCryptosQuery({
    page: 1,
    limit: 50, // Get more items for filtering
  });

  // ------------------- TRANSFORM API DATA -------------------
  const cryptos = useMemo(() => {
    if (!data?.data) return [];

    // Debug: Log the raw API response to see if plans are present
    if (data?.data?.length > 0) {
      console.log('Raw API response for cryptos:', data.data);
      console.log('First crypto plans from API:', data.data[0]?.plans);
    }

    return data.data.map((crypto) => {
      const createdBy = crypto.createdBy || {};
      const authorName = createdBy.first_name && createdBy.last_name
        ? `${createdBy.first_name} ${createdBy.last_name}`
        : createdBy.first_name || createdBy.last_name || "Unknown Author";

      const categoryName = crypto.category?.name || "Uncategorized";

      // Format date
      const date = crypto.createdAt
        ? new Date(crypto.createdAt).toLocaleString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
        : new Date().toLocaleString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });

      // Get formatted plain text - converts HTML and \r\n to proper plain text
      const plainTextDescription = crypto.description
        ? convertRtkEditorToFormattedPlainText(crypto.description, true)
        : "";

      // Get display format with clickable links for full view
      const fullDisplayHtml = crypto.description
        ? convertRtkEditorToDisplayFormat(crypto.description, true, true)
        : "";

      // For preview: get single line version (no line breaks) and limit to 2 lines worth
      const singleLineText = crypto.description
        ? convertRtkEditorToFormattedPlainText(crypto.description, false)
        : "";

      // Calculate approximate characters for 2 lines (assuming ~50 chars per line)
      const maxChars = 100;
      const preview = singleLineText
        ? (singleLineText.length > maxChars
          ? singleLineText.substring(0, maxChars) + "..."
          : singleLineText)
        : "No description available.";

      // Get image from photos array or use placeholder
      const image = crypto?.photos && crypto.photos?.length > 0
        ? crypto.photos[0]
        : 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1400&auto=format&fit=crop';

      // Get avatar from createdBy
      const avatar = createdBy?.image || '/media/avatars/1.png';

      // Ensure plans are preserved correctly BEFORE spread (to avoid overwriting)
      const plansFromApi = crypto?.plans || crypto?.allowedPlans || [];
      
      // Debug: Log plans for each crypto item
      if (crypto?.accessType === 'PRO' || crypto?.tier === 'PRO') {
        console.log(`Crypto ${crypto?._id} (PRO tier) - Plans from API:`, plansFromApi);
        console.log(`Crypto ${crypto?._id} - Plans type:`, Array.isArray(plansFromApi) ? 'array' : typeof plansFromApi);
        console.log(`Crypto ${crypto?._id} - Plans length:`, Array.isArray(plansFromApi) ? plansFromApi.length : 'not array');
      }

      // Extract category object to avoid spreading it
      const { category: categoryObj, plans: plansFromSpread, ...restOfCrypto } = crypto || {};

      const transformedCrypto = {
        id: crypto?._id,
        _id: crypto?._id,
        title: crypto?.title || "Untitled Crypto Analysis",
        author: authorName,
        date: date,
        preview: preview,
        full: plainTextDescription || "No content available.",
        fullDisplayHtml: fullDisplayHtml || "", // HTML with clickable links and line breaks
        fullHtml: crypto?.description || "", // Keep original HTML for reference if needed
        image: image,
        avatar: avatar,
        accessType: crypto?.accessType || "PUBLIC",
        tier: crypto?.accessType || "PUBLIC", // Use tier for unified access control
        url: crypto?.url,
        data: crypto?.data,
        photos: crypto?.photos || [],
        ...restOfCrypto, // Include all other properties (excluding category and plans)
        // Override specific properties after spread to ensure correct format
        category: categoryName, // Always use string category name, not object
        plans: plansFromApi, // Use plans from BEFORE spread (preserve original API response)
        allowedPlans: crypto?.allowedPlans || [], // Keep for backward compatibility
      };

      return transformedCrypto;
    });
  }, [data]);

  // ------------------- FILTER LOGIC -------------------
  const filteredCryptos = useMemo(() => {
    if (activeTab === "All") {
      return cryptos;
    }
    return cryptos.filter((item) => {
      // Ensure category is compared as string (in case it's still an object somehow)
      const categoryValue = typeof item.category === 'object' && item.category?.name
        ? item.category.name
        : item.category;
      return categoryValue === activeTab;
    });
  }, [cryptos, activeTab]);

  // ------------------- GET UNIQUE CATEGORIES -------------------
  const categories = useMemo(() => {
    // Extract category names (handle both string and object formats)
    const uniqueCategories = new Set(
      cryptos
        .map(crypto => {
          // If category is an object, get the name; otherwise use the string
          const categoryValue = typeof crypto.category === 'object' && crypto.category?.name
            ? crypto.category.name
            : crypto.category;
          return categoryValue;
        })
        .filter(Boolean)
    );
    return ["All", ...Array.from(uniqueCategories).filter(Boolean)];
  }, [cryptos]);

  return (
    <>
      <div className="container py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Crypto Analysis</h1>
          <p className="text-sm text-muted-foreground mt-1">Latest cryptocurrency insights and analysis</p>
        </header>

        {/* ------------------- LOADING STATE ------------------- */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
              <p className="mt-4 text-muted-foreground">Loading crypto analysis...</p>
            </div>
          </div>
        )}

        {/* ------------------- ERROR STATE ------------------- */}
        {error && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-500 text-lg font-semibold">Error loading crypto analysis</p>
              <p className="text-muted-foreground mt-2">
                {error?.data?.message || error?.error || "Something went wrong. Please try again later."}
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
                    ? "bg-yellow-500 text-white shadow"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
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
            {filteredCryptos.length === 0 && !isLoading && !error && (
              <div className="col-span-full flex items-center justify-center py-12">
                <p className="text-muted-foreground">No crypto analysis available at the moment.</p>
              </div>
            )}

            {filteredCryptos.map((crypto) => {
              // Compute access control using utility function (not hook) inside map
              const tier = crypto.tier || crypto.accessType || "PUBLIC";
              const contentPlans = (crypto.plans || crypto.allowedPlans || []).map(p => (p?._id || p)?.toString()).filter(Boolean);

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
                  // Debug: Log the crypto object to see what we're working with
                  console.log('Crypto object for purchase:', crypto);
                  console.log('Plans from crypto:', crypto.plans);

                  // Get plans from the content item
                  // Plans can come as an array of objects (populated) or array of IDs (not populated)
                  const rawPlans = crypto.plans || [];
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
                    toast.error('This PRO content has no plans assigned. Please contact support or check admin settings.');
                    console.error('No valid plans found. Raw plans:', rawPlans);
                    console.error('Crypto item details:', {
                      id: crypto._id,
                      title: crypto.title,
                      tier: tier,
                      accessType: crypto.accessType,
                    });
                    return;
                  }

                  // If multiple plans, show selection modal
                  if (contentPlans.length > 1) {
                    setSelectedContentForPurchase({
                      id: crypto._id,
                      title: crypto.title,
                      plans: contentPlans,
                      contentType: 'crypto',
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
                <Card key={crypto?._id || crypto?.id} className={`bg-card border border-border overflow-hidden ${isLocked ? 'relative' : ''}`}>

                  {/* image */}
                  <div className="w-full h-44 overflow-hidden relative">
                    <div className={isLocked ? 'blur-[2px]' : ''}>
                      <ImageCarousel
                        images={
                          crypto?.photos && Array.isArray(crypto.photos) && crypto.photos.length > 0
                            ? crypto.photos
                            : crypto?.image
                              ? [crypto.image]
                              : []
                        }
                        alt={crypto?.title || "Crypto analysis"}
                        height="h-44"
                        showViewButton={hasAccess}
                      />
                    </div>
                    {isLocked && (
                      <CourseLockOverlay
                        tier={tier}
                        lockReason={lockReason}
                        lockMessage={lockMessage}
                        onPurchase={handlePurchase}
                        contentType="Crypto"
                      />
                    )}
                  </div>

                  <CardContent className="p-4">

                    {/* Author */}
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={crypto?.avatar} alt={crypto?.author || "Author"} />
                        <AvatarFallback>{crypto?.author?.[0] || "A"}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium truncate">{crypto?.author || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground">{crypto?.date || ""}</p>
                          </div>
                          <Badge>{crypto?.category || ""}</Badge>
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="mt-4 text-lg font-bold text-primary">{crypto?.title || "Untitled"}</h3>

                    {/* Preview - 2 lines max */}
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {hasAccess ? crypto?.preview || "" : "This content is locked. Upgrade your plan or log in to view full analysis."}
                    </p>

                    {/* Button */}
                    <div className="mt-4">
                      <Button
                        onClick={() => setSelectedCrypto(crypto)}
                        className="w-full bg-yellow-600 text-white hover:bg-yellow-700"
                      >
                        {hasAccess ? "View Details" : "Unlock Analysis"}
                      </Button>
                    </div>

                  </CardContent>

                  <CardFooter className="p-4">
                    <div className="text-sm text-muted-foreground">
                      Published • {crypto?.date?.split(',')?.[0] || ""}
                    </div>
                  </CardFooter>

                </Card>
              )
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
      <ViewCryptoModel
        crypto={selectedCrypto}
        isOpen={!!selectedCrypto}
        onClose={() => setSelectedCrypto(null)}
      />

      {/* Image Viewer Modal */}
      <ImageViewer
        image={selectedImage}
        images={
          selectedCrypto?.photos && Array.isArray(selectedCrypto.photos) && selectedCrypto.photos.length > 0
            ? selectedCrypto.photos
            : selectedCrypto?.image
              ? [selectedCrypto.image]
              : selectedImage
                ? [selectedImage]
                : []
        }
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        alt="Crypto analysis chart"
      />
    </>
  );
}

