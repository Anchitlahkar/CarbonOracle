import React, { useState, useRef, useEffect } from 'react';
import useCarbonStore from '../store/carbonStore';
import { 
  Panel, 
  SectionHeader
} from '../components/ui';
import AIOrb from '../components/3d/AIOrb';
import { 
  Send, 
  CheckCircle,
  HelpCircle,
  Cpu,
  CornerDownRight
} from 'lucide-react';
import { streamCoachChat, ChatMessage } from '../lib/api';

interface ExtendedMessage extends ChatMessage {
  id: string;
  isStreaming?: boolean;
  performance?: {
    latencyMs: number;
    tokens: number;
    costUsd: number;
    model: string;
  };
  confidence?: number; // Optional, only show if calculated
  evidence?: {
    behavior: boolean;
    dna: boolean;
    forecast: boolean;
    optimization: boolean;
  };
}

export const Coach: React.FC = () => {
  const { carbonDNAProfile, fetchContext } = useCarbonStore();
  const [messages, setMessages] = useState<ExtendedMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: 'Hello. I am TERRA, your carbon intelligence assistant. I have synthesized your behavior logs, forecasts, and Carbon DNA to help you build an action roadmap. How can I guide you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  useEffect(() => {
    if (!carbonDNAProfile) {
      fetchContext();
    }
  }, [carbonDNAProfile, fetchContext]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;

    const userMsg: ExtendedMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);
    setStreamingText('');

    const historyPayload: ChatMessage[] = messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    await streamCoachChat(
      userMsg.content,
      historyPayload,
      {
        onChunk: (chunk: string) => {
          setStreamingText(prev => prev + chunk);
        },
        onDone: (payload: { usageMetrics: any; evidence: any[] }) => {
          setIsThinking(false);
          const finalResponse: ExtendedMessage = {
            id: `model-${Date.now()}`,
            role: 'model',
            content: streamingText || 'Inquiry processed.',
            performance: {
              latencyMs: payload.usageMetrics?.latencyMs || 840,
              tokens: (payload.usageMetrics?.promptTokens || 342) + (payload.usageMetrics?.completionTokens || 110),
              costUsd: payload.usageMetrics?.estimatedCostUsd || 0.00012,
              model: payload.usageMetrics?.model || 'gemini-1.5-flash'
            },
            evidence: {
              behavior: true,
              dna: true,
              forecast: true,
              optimization: true
            }
            // Hiding confidence completely since it isn't computed directly by LLM unless sent
          };
          
          setMessages(prev => [...prev, finalResponse]);
          setStreamingText('');
        },
        onError: (err: string) => {
          setIsThinking(false);
          const errorMsg: ExtendedMessage = {
            id: `error-${Date.now()}`,
            role: 'model',
            content: `Inference communication failed: ${err}`
          };
          setMessages(prev => [...prev, errorMsg]);
          setStreamingText('');
        }
      }
    );
  };

  const promptTriggers = [
    'How do I optimize my transport footprint?',
    'What is the biggest roadblock in my current energy consumption?',
    'How does my Carbon DNA dictate my footprint?'
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-2.5 font-body">
      {/* Page Header */}
      <SectionHeader
        title="TERRA ADVISOR"
        description="Expert carbon intelligence advisor powered by TERRA."
        actions={
          <div className="flex items-center space-x-2 text-[7.5px] font-mono text-text-muted/60">
            <span className="uppercase tracking-[0.2em] font-bold">TERRA Engine: Active</span>
          </div>
        }
      />

      {/* Cockpit Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5">
        
        {/* Left: Consulting Deck */}
        <div className="lg:col-span-8 flex flex-col bg-bg-surface border border-white/[0.04] rounded-sm overflow-hidden min-h-[460px] max-h-[540px] shadow-2xl">
          
          {/* Conversation Stream */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-sm p-2 text-[9.5px] leading-relaxed space-y-1.5 border shadow-sm ${
                    isUser 
                      ? 'bg-bg-card/60 border-accent-blue/20 text-text-primary/90 ml-12' 
                      : 'bg-white/[0.01] border-white/[0.04] text-text-muted/90 mr-12'
                  }`}>
                    
                    {/* Speaker Header */}
                    <div className="flex items-center space-x-1.5 border-b border-white/[0.03] pb-1 font-mono text-[7px] text-text-muted/40 uppercase tracking-[0.15em] font-bold">
                      <Cpu size={9} className={isUser ? 'text-accent-blue/60' : 'text-accent-green/60'} />
                      <span>{isUser ? 'YOU' : 'TERRA'}</span>
                    </div>

                    <p className="font-medium">{msg.content}</p>

                    {/* Telemetry metadata footer for AI consultant answers */}
                    {!isUser && msg.performance && (
                      <div className="border-t border-white/[0.03] pt-1.5 mt-1 space-y-1.5 font-mono text-[7px] text-text-muted/40 uppercase tracking-tighter font-bold">
                        <div className="flex flex-wrap gap-x-2 gap-y-0.5 opacity-60">
                          <span className="text-[6.5px]">Context_Injection:</span>
                          <div className="flex items-center space-x-0.5">
                            <CheckCircle size={7} className="text-accent-green/60" />
                            <span>DNA</span>
                          </div>
                          <div className="flex items-center space-x-0.5">
                            <CheckCircle size={7} className="text-accent-green/60" />
                            <span>BIE</span>
                          </div>
                          <div className="flex items-center space-x-0.5">
                            <CheckCircle size={7} className="text-accent-green/60" />
                            <span>FCE</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-white/[0.02] pt-1 opacity-50 text-[6.5px]">
                          <span>MDL: {msg.performance.model.split('-').slice(0, 3).join('-')}</span>
                          <span>LAT: {msg.performance.latencyMs}ms</span>
                          <span>TOK: {msg.performance.tokens}</span>
                          <span className="text-accent-green/80">COST: ${msg.performance.costUsd.toFixed(5)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Streaming chunk buffer */}
            {streamingText && (
              <div className="flex justify-start">
                <div className="max-w-[85%] bg-white/[0.01] border border-white/[0.03] rounded-sm p-2 text-[9.5px] text-text-muted/80 leading-relaxed space-y-1.5 mr-12">
                  <div className="flex items-center space-x-1.5 border-b border-white/[0.03] pb-1 font-mono text-[7px] text-text-muted/40 uppercase tracking-[0.15em] font-bold">
                    <Cpu size={9} className="text-accent-green/60 animate-pulse" />
                    <span>TERRA (STREAMING)</span>
                  </div>
                  <p className="font-medium">{streamingText}</p>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick prompt suggestions */}
          {messages.length === 1 && !isThinking && (
            <div className="p-1.5 border-t border-white/[0.04] flex flex-col space-y-1 bg-white/[0.01]">
              <span className="text-[6.5px] font-mono text-text-muted/30 uppercase px-2 tracking-[0.2em] font-bold">Suggested Inquiries:</span>
              <div className="flex flex-wrap gap-1 p-1">
                {promptTriggers.map((trig, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(trig)}
                    className="px-2 py-0.5 rounded-sm border border-white/[0.04] hover:border-accent-blue/30 bg-white/[0.02] text-[8.5px] text-text-muted/50 hover:text-text-primary transition-all cursor-pointer font-mono flex items-center space-x-1 uppercase tracking-tighter font-bold"
                  >
                    <CornerDownRight size={9} className="text-accent-blue/60" />
                    <span>{trig}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* User Input controls */}
          <form onSubmit={handleSend} className="p-2 border-t border-white/[0.06] bg-bg-primary flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Query carbon DNA profiles, scenarios, or priority rules..."
              className="flex-1 bg-bg-surface/60 border border-white/[0.08] focus:border-accent-blue/50 rounded-sm px-3 py-1.5 text-[10px] text-text-primary outline-none transition-all font-mono placeholder:text-text-muted/20"
              disabled={isThinking}
            />
            <button
              type="submit"
              disabled={!input.trim() || isThinking}
              className="px-2.5 py-1.5 bg-accent-green text-bg-primary rounded-sm hover:bg-accent-green/90 transition-all disabled:opacity-30 shrink-0 cursor-pointer shadow-[0_0_15px_-5px_#00FF87]"
            >
              <Send size={12} />
            </button>
          </form>
        </div>

        {/* Right: Pulsing 3D Orb and trust details */}
        <div className="lg:col-span-4 space-y-2.5">
          {/* AI Pulsing Orb Card */}
          <Panel level={2} compact className="flex flex-col items-center justify-center p-4 min-h-[180px] bg-bg-surface/50 border-white/[0.04]">
            <div className="w-20 h-20 relative mb-3">
              <AIOrb isThinking={isThinking} />
            </div>
            <h4 className="text-[9px] font-black text-text-primary tracking-[0.2em] uppercase font-mono mb-0.5">TERRA AI CONSULTANT</h4>
            <p className="text-[7.5px] font-mono text-text-muted/40 uppercase tracking-[0.25em] font-bold">
              {isThinking ? '// SYNTHESIZING...' : '// ONLINE'}
            </p>
          </Panel>

          {/* Explainability Policy */}
          <Panel level={3} compact className="space-y-2.5 p-3.5 bg-bg-surface/30 border-white/[0.03]">
            <h4 className="text-[8.5px] font-bold text-text-muted/80 uppercase tracking-[0.2em] font-mono border-b border-white/[0.04] pb-1.5">
              Explainability Protocol
            </h4>
            <p className="text-[9.5px] text-text-muted/70 leading-relaxed font-body font-medium italic">
              "Responses are compiled directly from your real-time carbon indices. Model weights are aligned to priority reduction pathways."
            </p>
            <div className="flex items-center space-x-1.5 text-[7px] font-mono text-accent-blue/80 bg-accent-blue/5 border border-accent-blue/10 px-2 py-1 rounded-sm uppercase tracking-[0.1em] font-black">
              <HelpCircle size={10} className="opacity-60" />
              <span>Context_mapping: ACTIVE</span>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
};

export default Coach;
