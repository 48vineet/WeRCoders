import { useEffect, useState } from "react";
import { toast } from "sonner";
import { StreamChat } from "stream-chat";
import { sessionApi } from "../api/sessions";
import { disconnectStreamClient, initializeStreamClient } from "../lib/stream";

function useBattleStreamClient(battle, loadingBattle, isParticipant) {
  const [streamClient, setStreamClient] = useState(null);
  const [call, setCall] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [isInitializingCall, setIsInitializingCall] = useState(true);

  useEffect(() => {
    let videoCall = null;
    let chatClientInstance = null;
    let mounted = true;

    const initCall = async () => {
      if (!battle?.callId) return;
      if (!isParticipant) return;
      if (battle.status === "finished") return;

      try {
        const { token, userId, userName, userImage } =
          await sessionApi.getStreamToken();

        if (!mounted) return;

        const client = await initializeStreamClient(
          {
            id: userId,
            name: userName,
            image: userImage,
          },
          token,
        );

        if (!mounted) return;
        setStreamClient(client);

        // Skip video call initialization entirely - only use chat for events
        console.log(
          "[Battle] Skipping video initialization - using chat only for real-time events",
        );

        const apiKey = import.meta.env.VITE_STREAM_API_KEY;
        chatClientInstance = StreamChat.getInstance(apiKey);

        // Check if already connected to prevent token errors
        if (!chatClientInstance.user || chatClientInstance.user.id !== userId) {
          await chatClientInstance.connectUser(
            {
              id: userId,
              name: userName,
              image: userImage,
            },
            token,
          );
        }

        if (!mounted) return;
        setChatClient(chatClientInstance);

        const chatChannel = chatClientInstance.channel(
          "messaging",
          battle.callId,
        );
        await chatChannel.watch();

        if (!mounted) return;
        setChannel(chatChannel);
      } catch (error) {
        if (!mounted) return;
        // Suppress camera/device errors - they are expected when no camera
        if (
          !error.message?.includes("device") &&
          !error.message?.includes("camera")
        ) {
          toast.error("Failed to join battle call");
        }
        console.error("Error init battle call", error);
      } finally {
        if (mounted) {
          setIsInitializingCall(false);
        }
      }
    };

    if (battle && !loadingBattle && !call && !chatClient) {
      initCall();
    }

    return () => {
      mounted = false;
      (async () => {
        try {
          // videoCall no longer initialized
          if (chatClientInstance) await chatClientInstance.disconnectUser();
          await disconnectStreamClient();
        } catch (error) {
          console.error("Cleanup error:", error);
        }
      })();
    };
  }, [battle?.callId, loadingBattle, isParticipant]);

  return {
    streamClient,
    call,
    chatClient,
    channel,
    isInitializingCall,
  };
}

export default useBattleStreamClient;
