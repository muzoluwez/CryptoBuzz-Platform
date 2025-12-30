import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router";
import { Channel as StreamChannel } from "stream-chat";
import { Channel, Chat } from "stream-chat-react";
import { useAuthContext } from "../../../../../context/AuthContext";
import { useEventContext } from "../context/EventContext";
import { useInitChat } from "../hooks/useInitChat";
import { ChannelInner } from "./ChannelInner";
import { ChatHeader } from './ChatHeader';
import { ChatSidebar } from "./ChatSidebar";
import { GiphyPreview } from "./GiphyPreview";
import { MessageInputUI } from "./MessageInput";
import { MessageUI } from "./MessageUI";


const   ChatContainer = ({ sessionToken, callId }) => {
  const {
    actionsModalOpen,
    isFullScreen,
    searching,
    setSearching,
    showChannelList,
    userActionType,
    setIsFullScreen,
  } = useEventContext();

  const [dmChannel, setDmChannel] = useState(null);
  const [messageActionUser, setMessageActionUser] = useState(null);
  const [participantProfile, setParticipantProfile] = useState(null);
  const [snackbar, setSnackbar] = useState(false);

  const location = useLocation();
  const sessionData = location.state;
  // const { callId } = useParams(); // Get callId from URL
  // const { address: rtmp_url, token: rtmp_stream_key } = sessionData;
  // const token = rtmp_stream_key;
  const [call, setCall] = useState(null);
  const { user } = useAuthContext();
  const userId = user?._id;
  const userName = user?.name
    ? user?.name
    : user?.first_name + " " + user?.last_name;

  const {
    chatClient,
    currentChannel,
    dmUnread,
    eventUnread,
    globalUnread,
    qaUnread,
  } = useInitChat({
    userId,
    userToken: sessionToken,
    callId,
    userName,
  });

  if (!chatClient) return null;

  return (
    <div className={`chat str-chat h-full`}>
      {isFullScreen && (
        <ChatSidebar
          isFullScreen={isFullScreen}
          dmUnread={dmUnread}
          eventUnread={eventUnread}
          globalUnread={globalUnread}
          qaUnread={qaUnread}
          setIsFullScreen={setIsFullScreen}
        />
      )}
      {!isFullScreen && (
        <div className={`chat-components ${isFullScreen ? "full-screen" : ""}`}>
          <Chat client={chatClient}>
            <ChatHeader
              dmUnread={dmUnread}
              eventUnread={eventUnread}
              globalUnread={globalUnread}
              qaUnread={qaUnread}
            />
            <Channel
              channel={currentChannel}
              // EmptyStateIndicator={<div>Empty</div>}
              GiphyPreviewMessage={GiphyPreview}
              Input={MessageInputUI}
              VirtualMessage={(props) => (
                <MessageUI
                  {...props}
                  setMessageActionUser={setMessageActionUser}
                />
              )}
            >
              <ChannelInner />
            </Channel>
          </Chat>
        </div>
      )}
    </div>
  );
};

export default ChatContainer;