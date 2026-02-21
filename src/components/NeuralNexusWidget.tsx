import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  User,
  Sparkles,
  X,
  Mic,
  MicOff,
  History,
  Zap,
  Wind,
  Car,
  Brain,
  Search,
  Volume2,
  Activity,
  Cpu,
  Loader2,
  ChevronsDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { generateChatResponse } from '@/lib/aiEngine';
import { chatHistoryStore, userQueryStore, ChatMessage } from '@/lib/dataStore';
import { useQuery } from '@tanstack/react-query';
import { fetchWeatherData, fetchAirQualityData, fetchTrafficData } from '@/lib/sensorApi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type SpeechRecognitionResultEventLike = {
  results: Array<Array<{ transcript: string }>>;
};

type SpeechRecognitionErrorEventLike = {
  error: string;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

export const NeuralNexusWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const { data: weather } = useQuery({ queryKey: ['weather'], queryFn: fetchWeatherData });
  const { data: airQuality } = useQuery({ queryKey: ['airQuality'], queryFn: fetchAirQualityData });
  const { data: traffic } = useQuery({ queryKey: ['traffic'], queryFn: fetchTrafficData });

  useEffect(() => {
    const history = chatHistoryStore.readRecent(120).reverse();
    if (history.length > 0) {
      setMessages(history);
      return;
    }
    const welcomeMsg: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content:
        "Welcome to **Neural Nexus** for Almaty.\n\nI can help with:\n- emergency numbers and services\n- transport routes and current traffic\n- air quality and weather\n- city places and infrastructure\n\nAsk anything in one chat and I'll keep context.",
      timestamp: new Date().toISOString(),
      source: 'domain_template',
    };
    setMessages([welcomeMsg]);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (isNearBottom) {
      el.scrollTop = el.scrollHeight;
      setShowScrollToBottom(false);
    } else {
      setShowScrollToBottom(true);
    }
  }, [messages, typingText, isThinking]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = '0px';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [input]);

  useEffect(() => {
    const list = scrollRef.current;
    if (!list) return;
    const onScroll = () => {
      const distance = list.scrollHeight - list.scrollTop - list.clientHeight;
      setShowScrollToBottom(distance > 80);
    };
    list.addEventListener('scroll', onScroll);
    return () => list.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const speechWindow = window as Window & {
        SpeechRecognition?: SpeechRecognitionCtor;
        webkitSpeechRecognition?: SpeechRecognitionCtor;
      };
      const SpeechRecognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        return;
      }
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: SpeechRecognitionResultEventLike) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEventLike) => {
        setIsListening(false);
        toast.error('Voice recognition error', { description: event.error });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition is not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const typeMessage = useCallback(async (fullText: string): Promise<void> => {
    setTypingText('');
    const words = fullText.split(' ');
    for (let i = 0; i <= words.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 10 + Math.random() * 15));
      setTypingText(words.slice(0, i).join(' '));
    }
  }, []);

  const handleSend = async (overrideInput?: string) => {
    const textToSend = (overrideInput ?? input).trim();
    if (!textToSend || !weather || !airQuality || !traffic || isThinking || isTyping) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    const requestHistory = [...messages, userMessage]
      .slice(-24)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMessage]);
    chatHistoryStore.create({ role: 'user', content: textToSend });
    setInput('');
    setIsThinking(true);

    await new Promise((resolve) => setTimeout(resolve, 600));

    const response = await generateChatResponse(
      textToSend,
      { weather, air: airQuality, traffic },
      requestHistory,
    );

    setIsThinking(false);
    setIsTyping(true);
    await typeMessage(response.response);

    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: response.response,
      timestamp: new Date().toISOString(),
      intent: response.intent,
      confidence: response.confidence,
      source: response.source,
      processingTime: response.processingTime,
    };

    setMessages((prev) => [...prev, assistantMessage]);
    chatHistoryStore.create({
      role: 'assistant',
      content: response.response,
      intent: response.intent,
      confidence: response.confidence,
      source: response.source,
      processingTime: response.processingTime,
    });
    setTypingText('');
    setIsTyping(false);

    userQueryStore.create({
      query: textToSend,
      response: response.response,
      category: 'neural-nexus',
    });

    if (overrideInput) {
      setShowSuggestions(false);
    }
  };

  const handleVoice = async (text: string) => {
    try {
      const resp = await fetch('http://localhost:8000/api/ai/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang: 'en' }),
      });
      if (resp.ok) {
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play();
      }
    } catch {
      toast.error('Voice synthesis failed');
    }
  };

  const handleReset = async () => {
    try {
      await fetch('http://localhost:8000/api/ai/clear', { method: 'POST' });
      chatHistoryStore.clear();
      setMessages([
        {
          id: `welcome-${Date.now()}`,
          role: 'assistant',
          content: 'Conversation memory was cleared. We can start fresh.',
          timestamp: new Date().toISOString(),
          source: 'domain_template',
        },
      ]);
      setShowSuggestions(true);
    } catch {
      toast.error('Failed to clear history');
    }
  };

  const handleComposerKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const quickActions = [
    { icon: Search, label: 'City services', query: 'What city services are available in Almaty?' },
    { icon: Car, label: 'Traffic now', query: 'Show current traffic status in Almaty' },
    { icon: Wind, label: 'Air quality', query: 'What is current air quality in Almaty?' },
    { icon: Zap, label: 'Emergency', query: 'Give emergency phone numbers in Almaty' },
  ];

  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
  const conversationTurns = messages.filter((m) => m.role === 'user').length;

  return (
    <div className="fixed bottom-4 right-4 z-[100] sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0, y: 12 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <Button
              onClick={() => setIsOpen(true)}
              data-testid="neural-widget-open"
              className="relative h-16 w-16 rounded-2xl border border-primary/40 bg-slate-950 p-0 shadow-2xl"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/35 via-transparent to-emerald-400/20" />
              <div className="relative z-10 flex items-center justify-center">
                <Brain className="h-8 w-8 text-primary" />
                <span className="absolute -right-1.5 -top-1.5 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
              </div>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.18 }}
          >
            <Card className="flex h-[min(86vh,760px)] w-[min(96vw,520px)] flex-col overflow-hidden border border-primary/30 bg-slate-950/95 shadow-2xl backdrop-blur-xl sm:w-[460px]">
              <CardHeader className="space-y-3 border-b border-white/10 bg-gradient-to-r from-primary/15 via-slate-900 to-emerald-500/10 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base font-bold text-primary">
                      <Brain className="h-4 w-4" />
                      Neural Nexus
                    </CardTitle>
                    <p className="text-[11px] text-muted-foreground">Smart Almaty chat assistant with local memory</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleReset}
                      className="h-8 w-8 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                      title="Clear conversation memory"
                    >
                      <History className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                      className="h-8 w-8 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                      title="Close"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-[10px] text-emerald-300">
                    Context turns: {conversationTurns}
                  </Badge>
                  <Badge variant="outline" className="border-primary/40 bg-primary/10 text-[10px] text-primary">
                    Source: {lastAssistant?.source || 'local'}
                  </Badge>
                  {lastAssistant?.intent && (
                    <Badge variant="outline" className="border-white/15 bg-white/5 text-[10px] text-slate-200">
                      Intent: {String(lastAssistant.intent).toLowerCase()}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="relative flex min-h-0 flex-1 flex-col p-0">
                <div className="border-b border-white/5 bg-slate-900/40 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] text-muted-foreground">Quick asks</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-[10px] text-muted-foreground"
                      onClick={() => setShowSuggestions((v) => !v)}
                    >
                      {showSuggestions ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                  {showSuggestions && (
                    <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                      {quickActions.map((action) => (
                        <Button
                          key={action.label}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 shrink-0 gap-1.5 rounded-full border-primary/25 bg-primary/5 px-3 text-[11px] text-primary hover:bg-primary/15"
                          onClick={() => handleSend(action.query)}
                          disabled={isTyping || isThinking}
                        >
                          <action.icon className="h-3 w-3" />
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-3 py-3">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      data-testid={`neural-message-${message.role}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        'flex w-full gap-2',
                        message.role === 'user' ? 'justify-end' : 'justify-start',
                      )}
                    >
                      {message.role === 'assistant' && (
                        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/15">
                          <Zap className="h-4 w-4 text-primary" />
                        </div>
                      )}

                      <div
                        className={cn(
                          'max-w-[84%] rounded-2xl px-3.5 py-2.5',
                          message.role === 'user'
                            ? 'rounded-br-sm bg-primary text-primary-foreground'
                            : 'rounded-bl-sm border border-white/10 bg-slate-900/70 text-slate-100',
                        )}
                      >
                        <div className="prose prose-invert max-w-none text-sm leading-relaxed">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2 border-t border-white/10 pt-1.5 text-[10px] text-slate-400">
                          <div className="flex items-center gap-2">
                            {message.role === 'assistant' && message.source && (
                              <span className="inline-flex items-center gap-1">
                                <Cpu className="h-3 w-3" />
                                {message.source}
                              </span>
                            )}
                            {message.processingTime && (
                              <span className="inline-flex items-center gap-1 text-emerald-400">
                                <Activity className="h-3 w-3" />
                                {message.processingTime}ms
                              </span>
                            )}
                          </div>
                          <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      {message.role === 'user' && (
                        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-slate-800">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {isThinking && (
                    <div className="flex items-start gap-2">
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/15">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      </div>
                      <div className="rounded-2xl rounded-bl-sm border border-primary/20 bg-slate-900/70 px-3.5 py-2 text-sm text-slate-300">
                        Processing your request...
                      </div>
                    </div>
                  )}

                  {isTyping && !isThinking && (
                    <div className="flex items-start gap-2">
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/15">
                        <Sparkles className="h-4 w-4 animate-pulse text-primary" />
                      </div>
                      <div className="max-w-[84%] rounded-2xl rounded-bl-sm border border-white/10 bg-slate-900/70 px-3.5 py-2.5">
                        <div className="prose prose-invert max-w-none text-sm leading-relaxed">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{typingText}</ReactMarkdown>
                          <span className="ml-1 inline-block h-4 w-[2px] animate-pulse bg-primary align-middle" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {showScrollToBottom && (
                  <div className="pointer-events-none absolute bottom-[92px] right-4">
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="pointer-events-auto h-8 w-8 rounded-full border border-white/10 bg-slate-900/90 text-slate-200"
                      onClick={() => {
                        if (scrollRef.current) {
                          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                        }
                      }}
                    >
                      <ChevronsDown className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <div className="border-t border-white/10 bg-slate-950/95 px-3 py-3">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void handleSend();
                    }}
                    className="space-y-2"
                  >
                    <div className="relative">
                      <Textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleComposerKeyDown}
                        data-testid="neural-widget-input"
                        placeholder={isListening ? 'Listening...' : 'Ask about Almaty, traffic, weather, services...'}
                        className="max-h-[140px] min-h-[46px] resize-none border-white/15 bg-slate-900/70 pr-12 text-sm focus-visible:ring-primary"
                        disabled={isTyping || isThinking}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={toggleListening}
                        className={cn(
                          'absolute right-1.5 top-1.5 h-8 w-8 rounded-lg',
                          isListening
                            ? 'bg-red-500/15 text-red-400'
                            : 'text-muted-foreground hover:bg-primary/10 hover:text-primary',
                        )}
                        disabled={isTyping || isThinking}
                      >
                        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>Enter to send</span>
                        <span>Shift+Enter for new line</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                          onClick={() => {
                            const candidate = [...messages].reverse().find((m) => m.role === 'assistant');
                            if (candidate) {
                              void handleVoice(candidate.content);
                            }
                          }}
                          disabled={messages.length === 0 || isTyping || isThinking}
                          title="Read last answer"
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                        <Button
                          type="submit"
                          size="icon"
                          data-testid="neural-widget-send"
                          className="h-8 w-8 rounded-lg bg-primary text-primary-foreground hover:bg-primary/85"
                          disabled={!input.trim() || isTyping || isThinking}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
