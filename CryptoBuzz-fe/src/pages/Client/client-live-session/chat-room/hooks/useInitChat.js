import { useEffect, useState, useRef } from "react";
import { StreamChat } from "stream-chat";
import { useCheckList } from "./useCheckList";
import { getRandomTitle } from "../chat/utils";
import { useEventContext } from "../context/EventContext";

const urlParams = new URLSearchParams(window.location.search);
const apiKey = import.meta.env.VITE_APP_STREAM_API_KEY;
const targetOrigin = urlParams.get("targetOrigin");

export const useInitChat = ({ userId, userToken, callId, userName }) => {
  const [chatClient, setChatClient] = useState(null);
  const [currentChannel, setCurrentChannel] = useState(null);
  const [dmUnread, setDmUnread] = useState(false);
  const [eventUnread, setEventUnread] = useState(false);
  const [globalUnread, setGlobalUnread] = useState(false);
  const [qaUnread, setQaUnread] = useState(false);
  const isInitializing = useRef(false);

  const { chatType, eventName } = useEventContext();
  useCheckList({ chatClient, targetOrigin });

  useEffect(() => {
    if (globalUnread && chatType === "global-ve2") setGlobalUnread(false);
  }, [chatType, globalUnread]);

  useEffect(() => {
    if (qaUnread && chatType === "qa") setQaUnread(false);
  }, [chatType, qaUnread]);

  useEffect(() => {
    if (dmUnread && chatType === "direct") setDmUnread(false);
  }, [chatType, dmUnread]);

  useEffect(() => {
    if (eventUnread && (chatType === "main-event" || chatType === "room"))
      setEventUnread(false);
  }, [chatType, eventUnread]);

  const setUnreadStatus = (id, value) => {
    switch (id) {
      case "global-ve2":
        setGlobalUnread(value);
        break;
      case "qa":
        setQaUnread(value);
        break;
      default:
        setEventUnread(value);
    }
  };

  const switchChannel = async (type, event) => {
    if (!chatClient || type === "direct") {
      setCurrentChannel(null);
      return;
    }

    const channelIsEvent = type === "main-event" || type === "room";
    const channelId = event && channelIsEvent ? `${type}-${event}` : type;
    const newChannel = chatClient.channel("livestream", channelId);

    await newChannel.watch({ watchers: { limit: 100 } });

    setUnreadStatus(channelId, false);
    // setCurrentChannel(newChannel);
  };

  useEffect(() => {
    const handleMessage = (event) => {
      if (!currentChannel?.id || !event.channel_id) return;
      if (currentChannel.id !== event.channel_id)
        setUnreadStatus(event.channel_id, true);
    };

    if (chatClient && currentChannel) {
      chatClient.on("message.new", handleMessage);
    }

    return () => chatClient?.off("message.new", handleMessage);
  }, [chatClient, currentChannel]);

  const handleDmMessages = (event) => {
    if (event.channel_type !== "messaging") return;
    setDmUnread(true);
  };

  useEffect(() => {
    const initChat = async () => {
      if (isInitializing.current) {
        console.log("Already initializing, skipping...");
        return; // Prevent concurrent initializations
      }
      isInitializing.current = true;

      try {
        console.log("Initializing chat with:", { apiKey: !!apiKey, userId: !!userId, userToken: !!userToken, callId: !!callId });
        
        if (!apiKey || !userId || !userToken || !callId) {
          console.error("Missing API key, User ID, Token, or Call ID.", {
            apiKey: !!apiKey,
            userId: !!userId,
            userToken: !!userToken,
            callId: !!callId,
          });
          isInitializing.current = false;
          return;
        }

        let client = StreamChat.getInstance(apiKey);

        if (!client) {
          console.error("Failed to get StreamChat instance.");
          isInitializing.current = false;
          return;
        }

        // Check if user is already connected with the same user ID
        const isAlreadyConnected = 
          client?.userID === userId && 
          client?.wsConnection && 
          client?.wsConnection?.isHealthy;

        console.log("Is already connected:", isAlreadyConnected);

        if (!isAlreadyConnected) {
          // Connect user only if not already connected
          console.log("Connecting user...");
          await client.connectUser(
            {
              id: userId,
              name: userName || "User",
              image: `https://getstream.io/random_svg/?name=${userName || "User"}`,
            },
            userToken
          );
          console.log("User connected successfully");
        } else {
          console.log("User already connected, reusing connection");
        }

        // Set chat client first
        setChatClient(client);

        // Create a unique chat per call
        const globalChannel = client.channel("livestream", callId, {
          name: "Global",
        });

        console.log("Setting up channel for callId:", callId);

        try {
          // Try to watch first (channel might already exist)
          await globalChannel.watch({ watchers: { limit: 100 } });
          console.log("Channel watched successfully");
        } catch (watchErr) {
          console.log("Watch failed, creating channel:", watchErr);
          // If watch fails, create the channel
          try {
            await globalChannel.create();
            await globalChannel.watch({ watchers: { limit: 100 } });
            console.log("Channel created and watched successfully");
          } catch (createErr) {
            console.error("Error creating/watching channel:", createErr);
            throw createErr;
          }
        }

        // Set up event listeners only if not already set
        if (!isAlreadyConnected) {
          client.on("message.new", handleDmMessages);
          client.on("notification.message_new", handleDmMessages);
        }

        setCurrentChannel(globalChannel);
        console.log("Chat initialized successfully");
      } catch (error) {
        console.error("Error initializing chat:", error);
        // Reset state on error so it can retry
        setChatClient(null);
        setCurrentChannel(null);
      } finally {
        isInitializing.current = false;
      }
    };

    // Only initialize if we have all required parameters and chatClient is not set
    if (apiKey && userId && userToken && callId && !chatClient && !isInitializing.current) {
      console.log("Triggering chat initialization...");
      initChat();
    }
    // If chatClient exists but currentChannel is null, set up the channel
    else if (chatClient && callId && !currentChannel && !isInitializing.current) {
      console.log("Setting up channel for existing client...");
      const globalChannel = chatClient.channel("livestream", callId, {
        name: "Global",
      });
      
      globalChannel.watch({ watchers: { limit: 100 } })
        .then(() => {
          console.log("Channel watched successfully");
          setCurrentChannel(globalChannel);
        })
        .catch((err) => {
          console.error("Error watching channel, trying to create:", err);
          globalChannel.create()
            .then(() => globalChannel.watch({ watchers: { limit: 100 } }))
            .then(() => {
              console.log("Channel created and watched successfully");
              setCurrentChannel(globalChannel);
            })
            .catch((createErr) => {
              console.error("Error creating/watching channel:", createErr);
            });
        });
    }
    // If channel exists but callId changed, switch channel
    else if (chatClient && callId && currentChannel) {
      const currentChannelId = currentChannel?.id;
      const expectedChannelId = `livestream:${callId}`;
      
      if (currentChannelId !== expectedChannelId && !isInitializing.current) {
        console.log("CallId changed, switching channel...");
        setCurrentChannel(null);
        // Will trigger the else if above to set up new channel
      }
    }
  }, [apiKey, userId, userToken, callId, userName]);

  useEffect(() => {
    return () => {
      if (chatClient) {
        chatClient.disconnectUser();
      }
      setChatClient(null);
      setCurrentChannel(null);
    };
  }, []);

  return {
    chatClient,
    currentChannel,
    dmUnread,
    globalUnread,
    eventUnread,
    qaUnread,
  };
};
