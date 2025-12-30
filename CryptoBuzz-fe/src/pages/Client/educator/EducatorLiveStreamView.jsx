import React, { useEffect, useRef, useState } from "react";
import { StreamTheme, StreamVideoClient } from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { Loader2 } from "lucide-react";
import { useParams } from "react-router";
import { useAuthContext } from "../../../context/AuthContext";
import { toAbsoluteUrl } from "../../../lib/helpers";
import { useGetActiveLiveStreamByEducatorQuery, useGetTokenMutation } from "../../../store/client/clientScheduleApiSlice";
import { EventProvider } from "../client-live-session/chat-room/context/EventContext";
import ClientLiveSessionWrapper from "../client-live-session/ClientLiveSessionWrapper";
import StreamWrapper from "../client-live-session/StreamWrapper";


const apiKey = import.meta.env.VITE_APP_STREAM_API_KEY;

const EducatorLiveStreamView = () => {
  const { id: educatorId } = useParams();
  const { user } = useAuthContext();
  const userId = user?._id ?? null;

  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [token, setToken] = useState(null);
  const isInitializing = useRef(false);

  // Fetch active live stream for educator
  const {
    data: liveStreamData,
    isLoading: isLoadingLiveStream,
    isError: isErrorLiveStream,
    refetch: refetchLiveStream,
  } = useGetActiveLiveStreamByEducatorQuery(educatorId, {
    skip: !educatorId,
    pollingInterval: 30000, // Poll every 30 seconds to check if educator goes live
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

  // Fetch token when we have an active live stream
  useEffect(() => {
    const fetchToken = async () => {
      if (!userId || !callId || token) return;

      try {
        const response = await getToken({ userId }).unwrap();
        setToken(response.data?.token || response.token);
      } catch (err) {
        console.error("Token fetch failed:", err);
      }
    };

    if (activeLiveStream && callId) {
      fetchToken();
    }
  }, [userId, callId, activeLiveStream, getToken, token]);

  // Initialize Stream client when token and callId are available
  useEffect(() => {
    const initClient = async () => {
      if (!token || !callId || client || isInitializing.current) return;
      isInitializing.current = true;

      let newClient;
      try {
        newClient = new StreamVideoClient({ apiKey });
        await newClient.connectUser({ id: userId }, token);
        const newCall = newClient.call("livestream", callId);
        
        // For viewers, just get the call (don't create or join as backstage)
        // Viewers can watch without joining as participants
        try {
          await newCall.get();
        } catch (getError) {
          // If call doesn't exist, log error but don't try to create it
          // Only the educator/host should create calls
          console.warn("Call not found:", getError);
          throw new Error("Live stream call not found");
        }
        
        // Don't call join() for viewers - they can watch without joining
        // The StreamCall component will handle viewing automatically
        setClient(newClient);
        setCall(newCall);
      } catch (err) {
        console.error("Stream init failed:", err);
        if (newClient) await newClient.disconnectUser();
      } finally {
        isInitializing.current = false;
      }
    };

    if (activeLiveStream && callId && token && userId) {
      initClient();
    }
  }, [token, callId, userId, activeLiveStream, client]);

  // Cleanup on unmount or when dependencies change
  useEffect(() => {
    return () => {
      const cleanup = async () => {
        try {
          // For viewers, we don't need to leave the call since we never joined
          // The StreamCall component handles its own cleanup
          // Just disconnect the client
          if (client) {
            await client.disconnectUser();
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

  // No active live stream - show banner image and About section
  if (!isLive || !callId) {
    return (
      <StreamWrapper
        call={null}
        bannerImage={bannerImage}
        educatorData={educatorData}
      />
    );
  }

  // Active live stream - show live stream component (no About section)
  if (isLive && activeLiveStream && callId && token && client && call) {
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