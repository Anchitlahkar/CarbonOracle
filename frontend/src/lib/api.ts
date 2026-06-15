import useCarbonStore from '../store/carbonStore';

const API_BASE = (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim() !== '')
  ? import.meta.env.VITE_API_URL 
  : (import.meta.env.DEV ? 'http://localhost:5000' : '');

function getHeaders(isMultipart = false): HeadersInit {
  const sanitize = (val: string) => val.replace(/[^\x20-\x7E]/g, '').replace(/['",]/g, '').trim();
  const headers: HeadersInit = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  
  // Attach auth JWT if present in store
  const state = useCarbonStore.getState();
  const rawToken = state.session?.access_token;
  if (rawToken) {
    const token = sanitize(rawToken);
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const authVal = (headers as Record<string, string>)['Authorization'] || 'None';
  console.log(`[API_AUTH_HEADER] Authorization header: ${authVal}`);
  return headers;
}

export async function fetchContextApi(): Promise<{ behaviorProfile: import("@carbonsense/shared-types").BehaviorProfile, forecastProfile: import("@carbonsense/shared-types").ForecastProfile, optimizationPlan: import("@carbonsense/shared-types").OptimizationPlan, carbonDNAProfile: import("@carbonsense/shared-types").CarbonDNAProfile, planetTwinProfile: import("@carbonsense/shared-types").PlanetTwinProfile }> {
  try {
    const res = await fetch(`${API_BASE}/api/coach/context`, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const errorMsg = errData.error || `HTTP error! status: ${res.status}`;
      const error = new Error(errorMsg) as Error & { status?: number };
      error.status = res.status;
      throw error;
    }
    
    const payload = await res.json();
    return payload.data;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'TypeError' && err.message.toLowerCase().includes('fetch')) {
      (err as Error & { status?: number }).status = -1;
    }
    throw err;
  }
}

export async function analyzeReceiptApi(file: File): Promise<unknown> {
  const state = useCarbonStore.getState();
  if (state.isDemoMode) {
    console.log('[DEMO_MODE] Intercepted analyzeReceiptApi. Simulating receipt scan...');
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return {
      items: [
        {
          name: 'Organic Oat Milk 1L',
          quantity: 2,
          unit: 'l',
          category: 'food',
          subCategory: 'Plant Milk',
          estimatedCarbonKg: 1.8,
          confidence: 0.96
        },
        {
          name: 'Fresh Avocados 4-pack',
          quantity: 1,
          unit: 'pack',
          category: 'food',
          subCategory: 'Fruits',
          estimatedCarbonKg: 2.2,
          confidence: 0.92
        },
        {
          name: 'Organic Local Salad Greens',
          quantity: 2,
          unit: 'pack',
          category: 'food',
          subCategory: 'Vegetables',
          estimatedCarbonKg: 0.6,
          confidence: 0.98
        }
      ],
      totalCarbonKg: 4.6,
      confidence: 0.95,
      validation: {
        confidence: 0.95,
        missingFields: [],
        suspiciousFields: [],
        requiresReview: false
      },
      audit: {
        extractedItems: 3,
        validatedItems: 3,
        flaggedItems: 0,
        modelUsed: 'Gemini 1.5 Flash (Simulated)',
        processingTimeMs: 1500
      },
      usageMetrics: {
        provider: 'google',
        model: 'gemini-1.5-flash',
        promptTokens: 412,
        completionTokens: 256,
        estimatedCostUsd: 0.0003,
        latencyMs: 1500
      }
    };
  }

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
  onDone: (payload: { usageMetrics: Record<string, unknown>; evidence: Record<string, unknown>[] }) => void;
  onError: (error: string) => void;
}

export async function streamCoachChat(
  message: string,
  history: ChatMessage[],
  callbacks: StreamCallbacks
): Promise<void> {
  const state = useCarbonStore.getState();
  if (state.isDemoMode) {
    console.log('[DEMO_MODE] Intercepted streamCoachChat. Simulating AI response...');
    try {
      const promptLower = message.toLowerCase();
      let responseText = '';
      
      if (promptLower.includes('commute') || promptLower.includes('transit') || promptLower.includes('car') || promptLower.includes('transport')) {
        responseText = 'Commuting choices represent your highest footprint optimization lever. According to your Carbon DNA profile, switching your current 80km daily sedan commute to the electric metro reduces your weekly transportation footprint from 24.5 kg down to 2.1 kg (a 91% reduction). Over a year, this dynamic switch saves over 1,100 kg CO2e, effectively cooling your Planet Twin world projection to 1.6 earths.';
      } else if (promptLower.includes('diet') || promptLower.includes('food') || promptLower.includes('meat') || promptLower.includes('beef') || promptLower.includes('eat')) {
        responseText = 'Based on your recent red meat meal entry (14.5 kg CO2e), reducing beef consumption to once per week offers immediate savings. Substituting beef with plant-based alternatives (like regional organic lentils or grains) lowers meal footprint by 92%. In your Planet Twin simulation, adopting weekday vegetarian habits saves 130 kg CO2e annually, improving your overall sustainability index.';
      } else if (promptLower.includes('electricity') || promptLower.includes('energy') || promptLower.includes('ac') || promptLower.includes('power')) {
        responseText = 'Your home AC energy logging (42.0 kg CO2e) represents your second highest emission source. Setting your AC temperature 2°C warmer and scheduling energy usage during non-peak grid hours can decrease home electricity emissions by 30%. I have placed a Smart Thermostat schedule recommendation at rank 2 in your Optimization Center to assist.';
      } else {
        responseText = `I have analyzed your request: "${message}". In Demo Mode, I recommend focusing on your three primary footprint categories: Transport (58%), Energy (20%), and Food (16%). Swapping your petrol car commutes for public transit and optimizing home temperature setpoints are your highest impact reduction candidates. Check the Optimization tab to review ranked MCDA savings options!`;
      }

      const chunks = responseText.match(/.{1,8}/g) || [responseText];
      for (const chunk of chunks) {
        callbacks.onChunk(chunk);
        await new Promise((resolve) => setTimeout(resolve, 30));
      }

      callbacks.onDone({
        usageMetrics: {
          provider: 'google',
          model: 'gemini-1.5-flash',
          promptTokens: 840,
          completionTokens: responseText.length / 4,
          estimatedCostUsd: 0.0004,
          latencyMs: 800
        },
        evidence: [
          {
            source: 'Localized Emission DB v2',
            metric: 'Petrol Car commuting coefficient',
            value: '0.306 kg/km',
            confidence: 0.95
          }
        ]
      });
      return;
    } catch (e: unknown) {
      callbacks.onError((e as Error).message || 'Error occurred during simulation');
      return;
    }
  }

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
  } catch (error: unknown) {
    callbacks.onError((error as Error).message || 'Network communication error');
  }
}
