import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Sparkles, X, MessageCircle, History, Zap, TrendingUp, Wind, Car, ThermometerSun, Volume2, Info, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { generateChatResponse } from '@/lib/aiEngine';
import { chatHistoryStore, userQueryStore, ChatMessage } from '@/lib/dataStore';
import { WeatherData, AirQualityData, TrafficData } from '@/lib/sensorApi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface SmartCityChatbotProps {
  weather: WeatherData | null;
  airQuality: AirQualityData | null;
  traffic: TrafficData | null;
}

const SmartCityChatbot: React.FC<SmartCityChatbotProps> = ({ weather, airQuality, traffic }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [typingText, setTypingText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const history = chatHistoryStore.readRecent(50).reverse();
    if (history.length > 0) {
      setMessages(history);
    } else {
      const welcomeMsg: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: '👋 Hello! I am the Smart City Almaty AI Assistant.\n\nI can help you with: \n• Emergency services (101, 102, 103) \n• Traffic and routes\n• Air quality and weather\n• City information\n\nAsk me anything!',
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMsg]);
    }

  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typingText]);

  const typeMessage = useCallback(async (fullText: string): Promise<void> => {
    setTypingText('');
    const words = fullText.split(' ');

    for (let i = 0; i <= words.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 30));
      setTypingText(words.slice(0, i).join(' '));
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || !weather || !airQuality || !traffic) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    chatHistoryStore.create({ role: 'user', content: input.trim() });
    const queryText = input.trim();
    const currentHistory = messages.map(m => ({ role: m.role, content: m.content }));

    setInput('');
    setIsThinking(true);

    // Artificial "Thinking" delay for premium feel
    await new Promise(resolve => setTimeout(resolve, 1500));

    const response = await generateChatResponse(queryText, { weather, air: airQuality, traffic }, currentHistory);

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
      processingTime: response.processingTime
    };

    setMessages(prev => [...prev, assistantMessage]);
    chatHistoryStore.create({
      role: 'assistant',
      content: response.response,
      intent: response.intent,
      confidence: response.confidence,
      source: response.source,
      processingTime: response.processingTime
    } as any);
    setTypingText('');

    userQueryStore.create({
      query: queryText,
      response: response.response,
      category: detectCategory(queryText)
    });

    setIsTyping(false);
  };

  const handleVoice = async (text: string) => {
    try {
      const resp = await fetch('http://localhost:8000/api/ai/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang: 'en' })
      });
      if (resp.ok) {
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play();
      }
    } catch (e) {
      console.error("Voice synthesis failed", e);
    }
  };

  const handleReset = async () => {
    try {
      await fetch('http://localhost:8000/api/ai/clear', { method: 'POST' });
      chatHistoryStore.clear();
      const welcomeMsg: ChatMessage = {
        id: 'welcome-' + Date.now(),
        role: 'assistant',
        content: 'History cleared. What else would you like to know? 👋',
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMsg]);
    } catch (e) {
      console.error("Failed to clear history", e);
    }
  };

  const detectCategory = (query: string): string => {
    const lower = query.toLowerCase();
    if (lower.includes('traffic')) return 'traffic';
    if (lower.includes('air') || lower.includes('quality')) return 'air';
    if (lower.includes('weather')) return 'weather';
    if (lower.includes('predict') || lower.includes('trend')) return 'prediction';
    if (lower.includes('history') || lower.includes('record')) return 'history';
    return 'general';
  };

  const quickActions = [
    { icon: Car, label: 'Traffic', query: "What's the current traffic situation?" },
    { icon: Wind, label: 'Air', query: "What's the current air quality?" },
    { icon: ThermometerSun, label: 'Weather', query: "What's the weather like now?" },
    { icon: TrendingUp, label: 'Forecast', query: "Any predictions for today?" },
    { icon: History, label: 'Memory', query: "What did I ask before?" },
    { icon: Zap, label: 'Emergency', query: "Emergency service numbers" },
  ];


  const handleQuickAction = (query: string) => {
    setInput(query);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90 group"
        size="icon"
      >
        <div className="relative">
          <MessageCircle className="h-7 w-7 transition-transform group-hover:scale-110" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse" />
        </div>
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[420px] h-[600px] shadow-2xl z-50 flex flex-col border-2 border-primary/20 overflow-hidden">
      {/* Header */}
      <CardHeader className="pb-3 border-b bg-gradient-to-r from-primary/10 to-primary/5 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center relative">
              <Bot className="h-6 w-6 text-primary" />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                Smart City AI
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                  <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                  Online
                </Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground">Connected to City Neural Network</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={handleReset} className="h-8 w-8 text-muted-foreground hover:text-primary" title="Clear history">
              <History className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in-0 slide-in-from-bottom-2 duration-300`}
              >
                {message.role === 'assistant' && (
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-muted rounded-bl-md'
                    }`}
                >
                  <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  <p className={`text-[10px] mt-1.5 ${message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'} flex items-center justify-between`}>
                    <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {message.role === 'assistant' && message.id !== 'welcome' && (
                      <span className="flex items-center gap-1 opacity-70">
                        {message.source === 'llm_rag' ? <Zap className="h-2 w-2 text-amber-500" /> : <Bot className="h-2 w-2" />}
                        {message.confidence ? `${Math.round(message.confidence)}%` : ''}
                      </span>
                    )}
                  </p>

                  {message.role === 'assistant' && message.id !== 'welcome' && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-primary/10">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10"
                        onClick={() => handleVoice(message.content)}
                        title="Read aloud"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                      </Button>
                      <div className="flex gap-1">
                        {message.intent && (
                          <Badge variant="outline" className="text-[8px] font-mono py-0 h-4 bg-background/50 border-primary/20">
                            {message.intent}
                          </Badge>
                        )}
                        {message.processingTime && (
                          <Badge variant="outline" className="text-[8px] font-mono py-0 h-4 bg-background/50 border-primary/20">
                            {message.processingTime}ms
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Thinking / Neural Link Animation */}
            {isThinking && (
              <div className="flex gap-2 justify-start animate-in fade-in zoom-in duration-300">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="h-4 w-4 text-primary animate-spin-slow" />
                </div>
                <div className="bg-muted/50 border border-primary/20 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-3 shadow-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
                  <div className="flex gap-1 relative z-10">
                    <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" />
                  </div>
                  <span className="text-[10px] font-bold text-primary/80 animate-pulse tracking-wider uppercase relative z-10">Searching Knowledge Archive...</span>
                </div>
              </div>
            )}

            {/* Typing indicator with text */}
            {isTyping && !isThinking && (
              <div className="flex gap-2 justify-start animate-in fade-in-0 slide-in-from-bottom-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%]">
                  {typingText ? (
                    <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {typingText}
                      </ReactMarkdown>
                      <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1 align-middle" />
                    </div>
                  ) : (
                    <div className="flex gap-1.5 py-1">
                      <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Quick Actions */}
        <div className="px-3 py-2 border-t bg-muted/30 flex-shrink-0">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                size="sm"
                className="text-xs whitespace-nowrap flex-shrink-0 h-7 px-2 gap-1 hover:bg-primary/10 hover:border-primary/50"
                onClick={() => handleQuickAction(action.query)}
                disabled={isTyping}
              >
                <action.icon className="h-3 w-3" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-3 border-t flex-shrink-0 bg-background">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={weather ? "Ask about traffic, air quality, weather..." : "Loading city data..."}
              className="flex-1 h-10"
              disabled={!weather || !airQuality || !traffic || isTyping}
            />
            <Button
              type="submit"
              size="icon"
              className="h-10 w-10"
              disabled={!input.trim() || isTyping}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            AI powered by Smart City Almaty OS Backend
          </p>
        </div>
      </CardContent>
    </Card >
  );
};

export default SmartCityChatbot;