import { useEffect, useRef } from 'react';
import { useChatStore } from '../../stores/chatStore';

export function NarrativeScroll() {
  const { messages, streamBuffer } = useChatStore();
  const scrollRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamBuffer]);

  return (
    <div ref={scrollRef} className="flex flex-col p-6 gap-4 overflow-y-auto">
      {messages.length === 0 && (
        <div className="flex items-center justify-center h-full text-center text-dust">
          <div>
            <p className="text-2xl font-crimson mb-2">The world awaits.</p>
            <p className="text-sm">Start your adventure by typing an action.</p>
          </div>
        </div>
      )}

      {messages.map((msg) => (
        <div key={msg.id} className="mb-4 animate-fade-in">
          {msg.type === 'dm' && (
            <div className="text-ink font-crimson leading-relaxed prose-narrative">{msg.content}</div>
          )}
          {msg.type === 'player' && (
            <div className="text-amber/80 text-sm italic">&gt; {msg.content}</div>
          )}
          {msg.type === 'system' && (
            <div className="text-ether text-xs font-mono">[{msg.content}]</div>
          )}
        </div>
      ))}

      {streamBuffer && (
        <div className="text-ink font-crimson leading-relaxed prose-narrative animate-fade-in">
          {streamBuffer}
          <span className="cursor"></span>
        </div>
      )}
    </div>
  );
}
