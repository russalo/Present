import { Send, Dices } from 'lucide-react';
import { useState } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { usePlayerStore } from '../../stores/playerStore';
import { useDMStream } from '../../hooks/useDMStream';

export function CommandBar() {
  const [input, setInput] = useState('');
  const { addMessage, isStreaming } = useChatStore();
  const { sessionId } = usePlayerStore();
  const { sendAction } = useDMStream();

  const handleSubmit = () => {
    if (!input.trim() || isStreaming) return;
    const action = input.trim();
    setInput('');
    addMessage({
      type: 'player',
      content: action,
      timestamp: new Date(),
    });
    sendAction(action, sessionId);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <footer className="bg-codex border-t border-border px-6 py-4 flex gap-3">
      <div className="flex-1 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={sessionId ? 'What do you do?' : 'Start a new world to begin...'}
          disabled={isStreaming || !sessionId}
          className="flex-1 bg-void border border-border rounded px-3 py-2 text-ink placeholder-dust focus:outline-none focus:border-amber transition-colors disabled:opacity-50"
        />
        <button
          onClick={handleSubmit}
          disabled={isStreaming || !sessionId}
          className="px-4 py-2 bg-amber text-void rounded hover:bg-amber/90 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <Send size={16} />
        </button>
      </div>
      <button className="px-4 py-2 bg-border text-ink rounded hover:bg-border/80 transition-colors flex items-center gap-2">
        <Dices size={16} />
        Roll
      </button>
    </footer>
  );
}
