const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiClient = {
  async get(endpoint) {
    const res = await fetch(`${API_BASE}${endpoint}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async post(endpoint, body) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },
};

export function openDMStream(sessionId, onChunk, onEnd) {
  const eventSource = new EventSource(
    `${API_BASE}/stream/narrative?session_id=${sessionId}`
  );

  eventSource.addEventListener('narrative.chunk', (event) => {
    const data = JSON.parse(event.data);
    onChunk(data.text);
  });

  eventSource.addEventListener('narrative.end', (event) => {
    const data = JSON.parse(event.data);
    onEnd(data);
    eventSource.close();
  });

  eventSource.addEventListener('error', () => {
    eventSource.close();
  });

  return eventSource;
}
