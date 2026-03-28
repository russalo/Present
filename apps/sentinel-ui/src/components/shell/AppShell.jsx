import { useEffect } from 'react';
import { useUIStore } from '../../stores/uiStore';
import { useChatStore } from '../../stores/chatStore';
import { TopBar } from './TopBar';
import { CommandBar } from './CommandBar';
import { WorldStateDashboard } from '../world-state/WorldStateDashboard';
import { NarrativeScroll } from '../narrative/NarrativeScroll';
import { PanelRouter } from '../panels/PanelRouter';

export function AppShell() {
  const { focusMode, toggleFocusMode, leftPanelCollapsed, rightPanelCollapsed } = useUIStore();
  const { messages, addMessage } = useChatStore();

  // Focus mode keyboard shortcut (F key)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'f' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        toggleFocusMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFocusMode]);

  // Add welcome message on mount
  useEffect(() => {
    if (messages.length === 0) {
      addMessage({
        type: 'dm',
        content: 'Welcome, traveler. The world awaits your next move.',
        author: 'Oracle',
        timestamp: new Date(),
      });
    }
  }, [addMessage, messages.length]);

  return (
    <div className="flex flex-col h-screen bg-void">
      <TopBar />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        {!focusMode && (
          <div className={`${leftPanelCollapsed ? 'w-12' : 'w-80'} bg-codex border-r border-border overflow-y-auto transition-all duration-200`}>
            {!leftPanelCollapsed && <WorldStateDashboard />}
          </div>
        )}

        {/* Center Panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <NarrativeScroll />
        </div>

        {/* Right Panel */}
        {!focusMode && (
          <div className={`${rightPanelCollapsed ? 'w-12' : 'w-80'} bg-codex border-l border-border overflow-y-auto transition-all duration-200`}>
            {!rightPanelCollapsed && <PanelRouter />}
          </div>
        )}
      </div>

      <CommandBar />
    </div>
  );
}
