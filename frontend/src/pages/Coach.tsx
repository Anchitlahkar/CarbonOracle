import React, { useState, useRef, useEffect } from 'react';
import useCarbonStore from '../store/carbonStore';
import { 
  Panel, 
  SectionHeader
} from '../components/ui';
import AIOrb from '../components/3d/AIOrb';
import { 
  Send, 
  HelpCircle,
  Cpu,
  CornerDownRight
} from 'lucide-react';
import { streamCoachChat, ChatMessage } from '../lib/api';

function parseInlineMarkdown(text: string): React.ReactNode {
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return <strong key={i} className="text-text-primary font-bold">{part}</strong>;
    }
    return part;
  });
}

function renderMarkdownContent(text: string): React.ReactNode {
  if (!text) return null;
  
  const lines = text.split('\n');
  return (
    <div className="space-y-4 font-body">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-2" />;

        // Header detection
        if (trimmed.startsWith('###')) {
          const content = trimmed.replace(/^###\s*/, '');
          return (
            <h3 key={idx} className="text-[18px] font-bold text-text-primary mt-6 mb-3 tracking-wide font-display uppercase border-b border-white/[0.04] pb-1">
              {parseInlineMarkdown(content)}
            </h3>
          );
        }
        if (trimmed.startsWith('##')) {
          const content = trimmed.replace(/^##\s*/, '');
          return (
            <h2 key={idx} className="text-[20px] font-bold text-text-primary mt-8 mb-4 tracking-wide font-display uppercase border-b border-white/[0.06] pb-1.5">
              {parseInlineMarkdown(content)}
            </h2>
          );
        }
        if (trimmed.startsWith('#')) {
          const content = trimmed.replace(/^#\s*/, '');
          return (
            <h1 key={idx} className="text-[24px] font-black text-text-primary mt-10 mb-5 tracking-wide font-display uppercase border-b border-white/[0.08] pb-2">
              {parseInlineMarkdown(content)}
            </h1>
          );
        }

        // List item detection
        if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
          const content = trimmed.replace(/^[-*]\s*/, '');
          return (
            <ul key={idx} className="list-disc pl-6 space-y-2 my-2">
              <li className="text-[16px] leading-[1.75] text-text-muted/90 font-normal">
                {parseInlineMarkdown(content)}
              </li>
            </ul>
          );
        }

        // Normal paragraph
        return (
          <p key={idx} className="text-[16px] leading-[1.75] text-text-muted/90 font-normal">
            {parseInlineMarkdown(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

interface ExtendedMessage extends ChatMessage {
  id: string;
  isStreaming?: boolean;
  performance?: {
    latencyMs: number;
    tokens: number;
    costUsd: number;
    model: string;
  };
  confidence?: number;
  evidence?: {
    behavior: boolean;
    dna: boolean;
    forecast: boolean;
    optimization: boolean;
  };
}

export const Coach: React.FC = () => {
  const { carbonDNAProfile, fetchContext, chatHistory, addChatMessage } = useCarbonStore();
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const accumulatedTextRef = useRef('');

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, streamingText]);

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

    addChatMessage(userMsg);
    setInput('');
    setIsThinking(true);
    setStreamingText('');
    accumulatedTextRef.current = '';

    const historyPayload: ChatMessage[] = chatHistory.map(m => ({
      role: m.role,
      content: m.content
    }));

    await streamCoachChat(
      userMsg.content,
      historyPayload,
      {
        onChunk: (chunk: string) => {
          accumulatedTextRef.current += chunk;
          setStreamingText(accumulatedTextRef.current);
        },
        onDone: (payload: { usageMetrics: any; evidence: any[] }) => {
          setIsThinking(false);
          const finalResponse: ExtendedMessage = {
            id: `model-${Date.now()}`,
            role: 'model',
            content: accumulatedTextRef.current || 'Inquiry processed.',
            performance: {
              latencyMs: payload.usageMetrics?.latencyMs || 840,
              tokens: (payload.usageMetrics?.promptTokens || 342) + (payload.usageMetrics?.completionTokens || 110),
              costUsd: payload.usageMetrics?.estimatedCostUsd || 0.00012,
              model: payload.usageMetrics?.model || 'gemini-3.1-flash-lite'
            },
            evidence: {
              behavior: true,
              dna: true,
              forecast: true,
              optimization: true
            }
          };
          
          addChatMessage(finalResponse);
          setStreamingText('');
          accumulatedTextRef.current = '';
        },
        onError: (_err: string) => {
          setIsThinking(false);
          const errorMsg: ExtendedMessage = {
            id: `error-${Date.now()}`,
            role: 'model',
            content: 'TERRA is temporarily unavailable.'
          };
          addChatMessage(errorMsg);
          setStreamingText('');
          accumulatedTextRef.current = '';
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
          <div className="flex items-center space-x-2 text-[12px] font-mono text-text-muted/60">
            <span className="uppercase tracking-[0.2em] font-bold">TERRA Engine: Active</span>
          </div>
        }
      />

      {/* Cockpit Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5">
        
        {/* Left: Consulting Deck */}
        <div className="lg:col-span-8 flex flex-col bg-bg-surface border border-white/[0.04] rounded-sm overflow-hidden min-h-[520px] max-h-[640px] shadow-2xl">
          
          {/* Conversation Stream */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 scrollbar-thin">
            {chatHistory.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div key={msg.id} className="w-full max-w-3xl mx-auto">
                  <div className={`rounded-sm border shadow-sm p-6 md:p-8 ${
                    isUser 
                      ? 'bg-bg-card/60 border-accent-blue/20 text-text-primary/90' 
                      : 'bg-white/[0.01] border-white/[0.04] text-text-muted/90'
                  }`}>
                    
                    {/* Speaker Header */}
                    <div className="flex items-center space-x-1.5 border-b border-white/[0.03] pb-1.5 mb-4 font-mono text-[12px] text-text-muted/40 uppercase tracking-[0.15em] font-bold">
                      <Cpu size={12} className={isUser ? 'text-accent-blue/60' : 'text-accent-green/60'} />
                      <span>{isUser ? 'YOU' : 'TERRA'}</span>
                    </div>

                    {isUser ? (
                      <p className="font-medium text-[16px] leading-[1.7] whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      renderMarkdownContent(msg.content)
                    )}
                  </div>
                </div>
              );
            })}

            {/* Streaming chunk buffer */}
            {streamingText && (
              <div className="w-full max-w-3xl mx-auto">
                <div className="bg-white/[0.01] border border-white/[0.04] rounded-sm p-6 md:p-8 text-[16px] leading-[1.7] text-text-muted/90 shadow-sm">
                  <div className="flex items-center space-x-1.5 border-b border-white/[0.03] pb-1.5 mb-4 font-mono text-[12px] text-text-muted/40 uppercase tracking-[0.15em] font-bold">
                    <Cpu size={12} className="text-accent-green/60 animate-pulse" />
                    <span>TERRA (STREAMING)</span>
                  </div>
                  {renderMarkdownContent(streamingText)}
                </div>
              </div>
            )}

            {/* Thinking / Analyzing indicator */}
            {!streamingText && isThinking && (
              <div className="w-full max-w-3xl mx-auto">
                <div className="bg-white/[0.01] border border-white/[0.04] rounded-sm p-6 md:p-8 text-[16px] leading-[1.7] text-text-muted/90 shadow-sm">
                  <div className="flex items-center space-x-1.5 border-b border-white/[0.03] pb-1.5 mb-4 font-mono text-[12px] text-text-muted/40 uppercase tracking-[0.15em] font-bold">
                    <Cpu size={12} className="text-accent-green/60 animate-pulse" />
                    <span>TERRA</span>
                  </div>
                  <p className="font-normal italic text-[16px] leading-[1.7] animate-pulse">TERRA is analyzing carbon profiles...</p>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick prompt suggestions */}
          {chatHistory.length === 1 && !isThinking && (
            <div className="p-2 border-t border-white/[0.04] flex flex-col space-y-1.5 bg-white/[0.01]">
              <span className="text-[12px] font-mono text-text-muted/30 uppercase px-2 tracking-[0.2em] font-bold">Suggested Inquiries:</span>
              <div className="flex flex-wrap gap-2 p-1">
                {promptTriggers.map((trig, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(trig)}
                    className="px-3 py-1.5 rounded-sm border border-white/[0.04] hover:border-accent-blue/30 bg-white/[0.02] text-[14px] text-text-muted/50 hover:text-text-primary transition-all cursor-pointer font-mono flex items-center space-x-1.5 uppercase tracking-tighter font-bold"
                  >
                    <CornerDownRight size={12} className="text-accent-blue/60" />
                    <span>{trig}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* User Input controls */}
          <form onSubmit={handleSend} className="p-3.5 border-t border-white/[0.06] bg-bg-primary flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Query carbon DNA profiles, scenarios, or priority rules..."
              className="flex-1 bg-bg-surface/60 border border-white/[0.08] focus:border-accent-blue/50 rounded-sm px-5 py-4 text-[16px] h-14 leading-normal text-text-primary outline-none transition-all font-mono placeholder:text-text-muted/40 placeholder:text-[14px]"
              disabled={isThinking}
            />
            <button
              type="submit"
              disabled={!input.trim() || isThinking}
              className="h-14 w-14 flex items-center justify-center bg-accent-green text-bg-primary rounded-sm hover:bg-accent-green/90 transition-all disabled:opacity-30 shrink-0 cursor-pointer shadow-[0_0_15px_-5px_#00FF87]"
            >
              <Send size={18} />
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
            <h4 className="text-[14px] font-black text-text-primary tracking-[0.2em] uppercase font-mono mb-0.5">TERRA AI CONSULTANT</h4>
            <p className="text-[12px] font-mono text-text-muted/40 uppercase tracking-[0.25em] font-bold">
              {isThinking ? '// SYNTHESIZING...' : '// ONLINE'}
            </p>
          </Panel>

          {/* Explainability Policy */}
          <Panel level={3} compact className="space-y-2.5 p-3.5 bg-bg-surface/30 border-white/[0.03]">
            <h4 className="text-[18px] font-bold text-text-muted/80 uppercase tracking-[0.2em] font-mono border-b border-white/[0.04] pb-1.5">
              Explainability Protocol
            </h4>
            <p className="text-[16px] text-text-muted/70 leading-relaxed font-body font-medium italic">
              "Responses are compiled directly from your real-time carbon indices. Model weights are aligned to priority reduction pathways."
            </p>
            <div className="flex items-center space-x-1.5 text-[12px] font-mono text-accent-blue/80 bg-accent-blue/5 border border-accent-blue/10 px-2 py-1 rounded-sm uppercase tracking-[0.1em] font-black">
              <HelpCircle size={14} className="opacity-60" />
              <span>Context_mapping: ACTIVE</span>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
};

export default Coach;
