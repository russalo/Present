import { useCallback } from 'react';
import { API_BASE } from '../api/client';
import { useChatStore } from '../stores/chatStore';
import { useWorldStore } from '../stores/worldStore';

export function useDMStream() {
  const { appendToBuffer, commitStreamMessage, setIsStreaming, addMessage } = useChatStore();
  const applyUpdate = useWorldStore((s) => s.applyUpdate);

  const sendAction = useCallback(
    async (action, sessionId) => {
      setIsStreaming(true);
      let buffer = '';

      try {
        const response = await fetch(`${API_BASE}/stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, sessionId }),
        });

        if (!response.ok) {
          throw new Error(`Stream request failed: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop(); // keep incomplete last line

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const raw = line.slice(6).trim();
            if (raw === '[DONE]') {
              commitStreamMessage();
              return;
            }
            let event;
            try {
              event = JSON.parse(raw);
            } catch {
              continue;
            }
            if (event.type === 'token') appendToBuffer(event.content);
            if (event.type === 'world_update') applyUpdate(event.data);
            if (event.type === 'system') addMessage({ type: 'system', content: event.content, timestamp: new Date() });
            if (event.type === 'error') addMessage({ type: 'system', content: `[Error: ${event.content}]`, timestamp: new Date() });
          }
        }
        // Stream ended without [DONE] — commit what we have
        commitStreamMessage();
      } catch (err) {
        addMessage({ type: 'system', content: `[Connection error: ${err.message}]`, timestamp: new Date() });
        setIsStreaming(false);
      }
    },
    [appendToBuffer, commitStreamMessage, setIsStreaming, addMessage, applyUpdate],
  );

  return { sendAction };
}
