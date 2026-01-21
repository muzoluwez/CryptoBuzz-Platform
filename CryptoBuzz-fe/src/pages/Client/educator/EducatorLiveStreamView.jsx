import React, { useEffect, useRef, useState, useMemo } from "react";
import { StreamTheme, StreamVideoClient } from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { Loader2, Lock } from "lucide-react";
import { useParams, useNavigate } from "react-router";
import { useAuthContext } from "../../../context/AuthContext";
import { toAbsoluteUrl } from "../../../lib/helpers";
import { useGetActiveLiveStreamByEducatorQuery, useGetTokenMutation } from "../../../store/client/clientScheduleApiSlice";
import { EventProvider } from "../client-live-session/chat-room/context/EventContext";
import ClientLiveSessionWrapper from "../client-live-session/ClientLiveSessionWrapper";
import StreamWrapper from "../client-live-session/StreamWrapper";
import { useSelector } from "react-redux";
import { selectCurrentUser, selectIsAuthenticated } from "@/store/authSlice";
import { useGetPurchasedPlanIdsQuery } from "@/store/client/clientPaymentApiSlice";
import { checkAccess } from "@/utils/accessControl";
import { PlanSelectionModal } from "@/components/payment/PlanSelectionModal";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { UidRequired } from "@/components/common/access-states/UidRequired";
import { toast } from "sonner";


const apiKey = import.meta.env.VITE_APP_STREAM_API_KEY;

const EducatorLiveStreamView = () => {
  const { id: educatorId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthContext();
  const userId = user?._id ?? null;

  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [token, setToken] = useState(null);
  const isInitializing = useRef(false);

  // Access control hooks
  const isAuthenticatedRedux = useSelector(selectIsAuthenticated);
  const userRedux = useSelector(selectCurrentUser);
  const { data: purchasedPlansData } = useGetPurchasedPlanIdsQuery(
    undefined,
    {
      skip: !isAuthenticatedRedux,
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
    }
  );

  const purchasedPlanIds = useMemo(() => {
    if (!purchasedPlansData?.data?.planIds) return new Set();
    return new Set(purchasedPlansData.data.planIds);
  }, [purchasedPlansData]);

  const userUid = useMemo(() => {
    if (!userRedux) return null;
    return userRedux.uid || userRedux.credential?.uid || null;
  }, [userRedux]);

  // Plan selection modal state
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedContentForPurchase, setSelectedContentForPurchase] = useState(null);
  const [showUidModal, setShowUidModal] = useState(false);

  // Fetch active live stream for educator
  const {
    data: liveStreamData,
    isLoading: isLoadingLiveStream,
    isError: isErrorLiveStream,
    refetch: refetchLiveStream,
  } = useGetActiveLiveStreamByEducatorQuery(educatorId, {
    skip: !educatorId,
    pollingInterval: 20000, // Poll every 30 seconds to check if educator goes live
  });


  const [getToken] = useGetTokenMutation();

  const liveStreamResponse = liveStreamData?.data;
  const isLive = liveStreamResponse?.isLive ?? false;
  const activeLiveStream = isLive ? liveStreamResponse : null;
  const callId = activeLiveStream?.callId;
  
  // Get educator data - either from active stream or from offline response
  const educator = liveStreamResponse?.educator || activeLiveStream?.educator;
  const bannerImage = educator?.bannerImage || activeLiveStream?.schedule?.image;
  const educatorData = educator?.description || activeLiveStream?.schedule?.description;

  // Access control for live stream
  // Check both LiveStream model and Schedule model for tier/plans
  // Schedule tier takes precedence since that's where the paid plans are typically stored
  const schedule = activeLiveStream?.schedule;
  const tier = schedule?.tier || schedule?.accessType || activeLiveStream?.accessType || activeLiveStream?.tier || 'PUBLIC';
  const contentPlans = useMemo(() => {
    // Check both LiveStream plans and Schedule plans
    const liveStreamPlans = (activeLiveStream?.plans || []).map(p => (p?._id || p)?.toString()).filter(Boolean);
    const schedulePlans = (schedule?.plans || []).map(p => (p?._id || p)?.toString()).filter(Boolean);
    // Combine and deduplicate
    return [...new Set([...liveStreamPlans, ...schedulePlans])];
  }, [activeLiveStream?.plans, schedule?.plans]);
  
  // Check if user has purchased any plan associated with this content
  const hasPurchase = useMemo(() => {
    if (tier === "PRO" && contentPlans.length > 0 && purchasedPlanIds.size > 0) {
      return contentPlans.some(planId => purchasedPlanIds.has(planId));
    }
    return false;
  }, [tier, contentPlans, purchasedPlanIds]);

  const accessResult = useMemo(() => {
    if (!isLive || !activeLiveStream) {
      // If stream is not live, no access check needed
      return { hasAccess: true, showLock: false, lockReason: null, lockMessage: '' };
    }
    
    const result = checkAccess({
      tier,
      isAuthenticated: isAuthenticatedRedux,
      userUid,
      hasPurchase,
      isPremium: tier === "PRO",
    });
    
    // Debug logs
    console.log('Live Stream Access Control:', {
      tier,
      scheduleTier: schedule?.tier,
      liveStreamTier: activeLiveStream?.tier,
      isAuthenticated: isAuthenticatedRedux,
      hasPurchase,
      contentPlansLength: contentPlans.length,
      purchasedPlanIdsSize: purchasedPlanIds.size,
      accessResult: result,
    });
    
    return result;
  }, [isLive, activeLiveStream, tier, isAuthenticatedRedux, userUid, hasPurchase, schedule, contentPlans.length, purchasedPlanIds.size]);

  // Purchase handler for live stream
  const handleLiveStreamPurchase = () => {
    if (!isAuthenticatedRedux) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    // Combine plans from both LiveStream and Schedule
    const liveStreamPlans = activeLiveStream?.plans || [];
    const schedulePlans = schedule?.plans || [];
    const rawPlans = [...liveStreamPlans, ...schedulePlans];
    
    const plans = rawPlans
      .filter(p => p && (p._id || p))
      .map(p => {
        if (typeof p === 'string') return null;
        return {
          _id: p._id || p,
          name: p.name || 'Plan',
          description: p.description || '',
          price: p.price || 0,
          hotmartCheckoutUrl: p.hotmartCheckoutUrl || '',
        };
      })
      .filter(Boolean);

    if (plans.length === 0) {
      toast.error('No plans available for this live stream. Please assign plans in the admin panel.');
      return;
    }

    // ALWAYS show modal - even for single plan (user requirement)
    console.log('✅ Plans detected - opening modal', {
      plansCount: plans.length,
      plans: plans
    });
    setSelectedContentForPurchase({
      id: activeLiveStream?._id || schedule?._id,
      title: schedule?.title || 'Live Stream',
      plans: plans,
      contentType: 'liveStream',
    });
    setShowPlanModal(true);
  };

  // Cleanup when stream stops (isLive becomes false)
  useEffect(() => {
    if (!isLive && (client || call || token)) {
      const cleanup = async () => {
        try {
          if (call) {
            // Don't need to leave call since we never joined as participant
            setCall(null);
          }
          if (client) {
            try {
              await client?.disconnectUser();
            } catch (disconnectError) {
              console.warn("Error disconnecting client during cleanup:", disconnectError);
            }
            setClient(null);
          }
          setToken(null);
          isInitializing.current = false;
        } catch (error) {
          console.warn("Cleanup error when stream stopped:", error);
        }
      };
      cleanup();
    }
  }, [isLive, client, call, token]);

  // Fetch token when we have an active live stream (only if authenticated AND has access)
  useEffect(() => {
    const fetchToken = async () => {
      if (!isAuthenticated || !userId || !callId || token || !isLive) return;
      // Don't fetch token if user doesn't have access
      if (isLive && activeLiveStream && accessResult.showLock && !accessResult.hasAccess) return;

      try {
        const response = await getToken({ userId }).unwrap();
        setToken(response?.data?.token || response?.token);
      } catch (err) {
        console.error("Token fetch failed:", err);
      }
    };

    if (isAuthenticated && isLive && activeLiveStream && callId && accessResult.hasAccess) {
      fetchToken();
    }
  }, [isAuthenticated, userId, callId, activeLiveStream, getToken, token, isLive, accessResult]);

  // Initialize Stream client when token and callId are available (only if authenticated AND has access)
  useEffect(() => {
    const initClient = async () => {
      if (!isAuthenticated || !token || !callId || client || isInitializing.current || !isLive) return;
      // Don't initialize client if user doesn't have access
      if (isLive && activeLiveStream && accessResult.showLock && !accessResult.hasAccess) return;
      isInitializing.current = true;

      let newClient;
      try {
        if (!apiKey || !userId || !token || !callId) {
          throw new Error("Missing required parameters for Stream initialization");
        }
        newClient = new StreamVideoClient({ apiKey });
        await newClient?.connectUser({ id: userId }, token);
        const newCall = newClient?.call("livestream", callId);
        
        // For viewers, just get the call (don't create or join as backstage)
        // Viewers can watch without joining as participants
        try {
          if (!newCall) {
            throw new Error("Failed to create call instance");
          }
          await newCall?.get();
        } catch (getError) {
          // If call doesn't exist, log error but don't try to create it
          // Only the educator/host should create calls
          console.warn("Call not found:", getError);
          throw new Error("Live stream call not found");
        }
        
        // Don't call join() for viewers - they can watch without joining
        // The StreamCall component will handle viewing automatically
        if (newClient && newCall) {
          setClient(newClient);
          setCall(newCall);
        }
      } catch (err) {
        console.error("Stream init failed:", err);
        if (newClient) {
          try {
            await newClient?.disconnectUser();
          } catch (disconnectError) {
            console.warn("Error disconnecting client:", disconnectError);
          }
        }
      } finally {
        isInitializing.current = false;
      }
    };

    if (isAuthenticated && isLive && activeLiveStream && callId && token && userId && accessResult.hasAccess) {
      initClient();
    }
  }, [isAuthenticated, token, callId, userId, activeLiveStream, client, isLive, accessResult]);

  // Cleanup on unmount or when dependencies change
  useEffect(() => {
    return () => {
      const cleanup = async () => {
        try {
          // For viewers, we don't need to leave the call since we never joined
          // The StreamCall component handles its own cleanup
          // Just disconnect the client
          if (client) {
            try {
              await client?.disconnectUser();
            } catch (disconnectError) {
              console.warn("Error disconnecting client:", disconnectError);
            }
          }
        } catch (error) {
          // Silently handle cleanup errors
          console.warn("Cleanup error:", error);
        }
      };
      
      cleanup();
    };
  }, [client]);

  // Loading state
  if (isLoadingLiveStream) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-yellow-600" />
          <p className="text-gray-600 dark:text-gray-300">Checking live stream status...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isErrorLiveStream) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl">
        <div className="text-center">
          <p className="text-red-600 mb-2">Failed to load live stream status</p>
          <button
            onClick={() => refetchLiveStream()}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // If user is not authenticated, only show banner image and About section (no live stream)
  if (!isAuthenticated) {
    return (
      <StreamWrapper
        call={null}
        bannerImage={bannerImage}
        educatorData={educatorData}
      />
    );
  }

  // Check if live stream is locked (PRO tier without purchase) - CHECK THIS EARLY
  // If locked, show lock overlay instead of stream content - NO STREAM VIEWER SHOULD RENDER
  if (isLive && activeLiveStream && accessResult.showLock && !accessResult.hasAccess) {
    const lockReason = accessResult.lockReason;

    const handleLockClick = (e) => {
      e.stopPropagation();
      if (lockReason === 'LOGIN_REQUIRED' || (tier === 'PRO' && !isAuthenticatedRedux)) {
        navigate('/login', { state: { from: window.location.pathname } });
      } else if (lockReason === 'UID_REQUIRED') {
        setShowUidModal(true);
      } else if (lockReason === 'PURCHASE_REQUIRED' || tier === 'PRO') {
        handleLiveStreamPurchase();
      }
    };

    return (
      <div className="relative w-full h-[600px] bg-gray-900 rounded-xl overflow-hidden">
        {/* Show banner image with blur */}
        {bannerImage && (
          <div className="absolute inset-0 blur-[2px] opacity-85">
            <img
              src={bannerImage}
              alt="Live Stream"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Lock Icon - Top Right Corner */}
        <div 
          className="absolute top-3 right-3 z-30 cursor-pointer"
          onClick={handleLockClick}
        >
          <div className="bg-black/60 backdrop-blur-sm p-2.5 rounded-full hover:bg-black/80 transition-all">
            <Lock className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Full Card Lock Overlay - Semi-transparent overlay over entire card */}
        <div 
          className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-10 rounded-xl cursor-pointer" 
          onClick={handleLockClick}
        />

        {/* Plan Selection Modal */}
        {selectedContentForPurchase && (
          <PlanSelectionModal
            open={showPlanModal}
            onOpenChange={(open) => {
              setShowPlanModal(open);
              if (!open) {
                setSelectedContentForPurchase(null);
              }
            }}
            plans={selectedContentForPurchase.plans}
            courseId={selectedContentForPurchase.id}
            courseTitle={selectedContentForPurchase.title}
            useDirectPlanCheckout={true}
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
                if (!isAuthenticatedRedux) {
                  navigate('/login', { state: { from: window.location.pathname } });
                }
              }}
              onClose={() => setShowUidModal(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // No active live stream - show banner image and About section
  // This should be shown when:
  // 1. isLive is false (educator hasn't clicked Go Live or has stopped the stream)
  // 2. callId is missing
  // 3. Stream is not fully initialized yet
  if (!isLive || !callId || !activeLiveStream) {
    return (
      <StreamWrapper
        call={null}
        bannerImage={bannerImage}
        educatorData={educatorData}
      />
    );
  }

  // Active live stream - show live stream component with chat (no About section)
  // Only show when stream is live AND all required components are ready AND user is authenticated AND has access
  // console.log("Rendering live stream view", { isLive, activeLiveStream, callId, token, client, call });
  if (isLive && activeLiveStream && callId && token && client && call && isAuthenticated && accessResult.hasAccess) {
    return (
      <EventProvider>
        <StreamWrapper
          call={call}
          callId={callId}
          bannerImage={bannerImage}
          educatorData={null}
        >
          <StreamTheme style={{ fontFamily: "sans-serif", color: "white" }}>
            <ClientLiveSessionWrapper
              bannerImage={bannerImage}
              client={client}
              callId={callId}
              token={token}
              educatorData={null}
              isLive={isLive}
            />
          </StreamTheme>
        </StreamWrapper>
      </EventProvider>
    );
  }

  // Still initializing stream
  return (
    <div className="w-full h-[600px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-600" />
        <p className="text-gray-600 dark:text-gray-300">Connecting to live stream...</p>
      </div>
    </div>
  );
};

export default EducatorLiveStreamView;