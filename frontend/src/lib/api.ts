import useCarbonStore from '../store/carbonStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function getHeaders(isMultipart = false): HeadersInit {
  const headers: HeadersInit = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  
  // Attach auth JWT if present in store
  const state = useCarbonStore.getState();
  const token = state.session?.access_token;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

export async function fetchContextApi(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/api/coach/context`, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const errorMsg = errData.error || `HTTP error! status: ${res.status}`;
      const error = new Error(errorMsg) as any;
      error.status = res.status;
      throw error;
    }
    
    const payload = await res.json();
    return payload.data;
  } catch (err: any) {
    if (err.name === 'TypeError' && err.message.toLowerCase().includes('fetch')) {
      err.status = -1;
    }
    throw err;
  }
}

export async function analyzeReceiptApi(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('image', file);
  
  const res = await fetch(`${API_BASE}/api/scanner/analyze`, {
    method: 'POST',
    headers: getHeaders(true),
    body: formData,
  });
  
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP error! status: ${res.status}`);
  }
  
  const payload = await res.json();
  return payload.data;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface StreamCallbacks {
  onChunk: (text: string) => void;
  onDone: (payload: { usageMetrics: any; evidence: any[] }) => void;
  onError: (error: string) => void;
}

export async function streamCoachChat(
  message: string,
  history: ChatMessage[],
  callbacks: StreamCallbacks
): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/api/coach/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        message,
        conversationHistory: history,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      callbacks.onError(errData.error || `HTTP error! status: ${res.status}`);
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) {
      callbacks.onError('Unable to process response stream');
      return;
    }

    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep partial line in buffer

      for (const line of lines) {
        const cleaned = line.trim();
        if (!cleaned || !cleaned.startsWith('data:')) continue;

        try {
          const jsonStr = cleaned.slice(5).trim();
          const parsed = JSON.parse(jsonStr);

          if (parsed.error) {
            callbacks.onError(parsed.error);
            return;
          }

          if (parsed.text) {
            callbacks.onChunk(parsed.text);
          }

          if (parsed.done) {
            callbacks.onDone({
              usageMetrics: parsed.usageMetrics,
              evidence: parsed.evidence || [],
            });
          }
        } catch (err) {
          console.warn('Failed to parse SSE line:', line, err);
        }
      }
    }
  } catch (error: any) {
    callbacks.onError(error.message || 'Network communication error');
  }
}
