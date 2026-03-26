import { useEffect, useRef } from 'react';
import { useChatStore } from '../stores/chatStore';
import { openDMStream } from '../api/client';

export function useDMStream(sessionId) {
  const eventSourceRef = useRef(null);
  const { appendToBuffer, commitStreamMessage, setIsStreaming } = useChatStore();

  const startStream = (message) => {
    if (!sessionId || eventSourceRef.current) return;

    setIsStreaming(true);
    eventSourceRef.current = openDMStream(
      sessionId,
      (chunk) => appendToBuffer(chunk),
      (data) => {
        commitStreamMessage(data.dmName || 'DM');
      }
    );
  };

  const stopStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsStreaming(false);
    }
  };

  useEffect(() => {
    return () => stopStream();
  }, []);

  return { startStream, stopStream };
}
