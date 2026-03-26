import { useEffect, useState } from 'react';

export function StatusIndicator() {
  const [connected, setConnected] = useState(true);

  return (
    <div className="flex items-center gap-2 text-xs text-dust">
      <div className={`w-2 h-2 rounded-full ${connected ? 'bg-leyline animate-pulse-slow' : 'bg-blood'}`} />
      <span>{connected ? 'Connected' : 'Reconnecting...'}</span>
    </div>
  );
}
