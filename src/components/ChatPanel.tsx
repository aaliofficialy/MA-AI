import React, { useRef, useEffect, useState } from 'react';
import { 
  Send, 
  Plus, 
  Image as ImageIcon, 
  FileText, 
  Volume2, 
  Copy, 
  Check, 
  User, 
  Sparkles,
  Languages,
  Mic,
  Share2,
  Briefcase,
  Mail,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Message, Attachment } from '../types';
import Markdown from 'react-markdown';
import AdRenderer from './AdRenderer';

interface ChatPanelProps {
  history: Message[];
  isTyping: boolean;
  input: string;
  setInput: (val: string) => void;
  onSend: () => void;
  selectedFile: Attachment | null;
  setSelectedFile: (file: Attachment | null) => void;
}

export default function ChatPanel({ 
  history, 
  isTyping, 
  input, 
  setInput, 
  onSend,
  selectedFile,
  setSelectedFile
}: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isTyping]);

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const playTTS = async (id: string, text: string) => {
    if (isPlaying === id) return;
    setIsPlaying(id);
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.substring(0, 500) }) // Limit for speed
      });
      const data = await response.json();
      if (data.audio) {
        const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
        audio.onended = () => setIsPlaying(null);
        audio.play();
      } else {
        setIsPlaying(null);
      }
    } catch (err) {
      console.error(err);
      setIsPlaying(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden">
      <div className="flex-none h-16 glass z-20 flex items-center px-6 border-b border-zinc-800/50 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent-400" />
          <h2 className="font-bold text-sm tracking-tight text-white">Active Conversation</h2>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-zinc-950/50 px-3 py-1.5 rounded-full border border-zinc-800">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">System Latency: 24ms</span>
          </div>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar scroll-smooth"
      >
        <div className="max-w-4xl mx-auto w-full space-y-8">
          <AdRenderer placement="chat_top" className="mb-4" />
          {history.length >= 3 && <AdRenderer placement="chat_middle" className="my-8" />}
          {history.length === 0 && !isTyping && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center space-y-6"
            >
              <div className="w-20 h-20 rounded-3xl accent-gradient flex items-center justify-center shadow-2xl shadow-accent-500/20 mb-4 scale-110">
                <Sparkles className="w-10 h-10 text-zinc-950" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-white tracking-tight">How can I assist you today?</h3>
                <div className="space-y-4">
                  <p className="text-zinc-400 max-w-md mx-auto text-base font-medium leading-relaxed">
                    Need quick answers? Chat with our AI assistant anytime for instant help!
                  </p>
                  <p className="text-zinc-500 max-w-lg mx-auto text-sm leading-relaxed">
                    Talk to AI now — get fast replies, smart solutions, and 24/7 support available for you.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg mt-8">
                {[
                  { text: 'Analyze business strategy', icon: Briefcase },
                  { text: 'Help with translations', icon: Languages },
                  { text: 'Draft professional emails', icon: Mail },
                  { text: 'Explain complex topics', icon: Cpu }
                ].map((item, i) => (
                  <button 
                    key={i}
                    onClick={() => setInput(item.text)}
                    className="flex items-center gap-3 p-4 rounded-xl glass hover:bg-zinc-900 border-zinc-800/50 hover:border-accent-500/30 transition-all text-left text-xs font-bold text-zinc-400 hover:text-white group"
                  >
                    <item.icon className="w-4 h-4 text-accent-500" />
                    {item.text}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {history.map((msg) => (
            <div 
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-zinc-800' : 'accent-gradient'}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4 text-zinc-400" /> : <Sparkles className="w-4 h-4 text-zinc-950" />}
                </div>
                
                <div className="space-y-2">
                  <div className={`rounded-2xl p-4 md:p-5 ${msg.role === 'user' ? 'bg-zinc-800 text-zinc-100' : 'glass bg-zinc-900/30'}`}>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {msg.attachments.map((att, i) => (
                          <div key={i} className="rounded-lg overflow-hidden border border-zinc-700 bg-zinc-950">
                            {att.type === 'image' ? (
                              <img src={`data:${att.mimeType};base64,${att.data}`} alt={att.name} className="max-w-[200px] max-h-[200px] object-cover" />
                            ) : (
                              <div className="p-3 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-accent-400" />
                                <span className="text-xs truncate max-w-[150px]">{att.name}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="markdown-body prose prose-invert prose-zinc max-w-none">
                      <Markdown>{msg.content}</Markdown>
                    </div>
                  </div>
                  
                  {msg.role === 'model' && (
                    <div className="flex items-center gap-4 px-2">
                      <button 
                        onClick={() => copyToClipboard(msg.id, msg.content)}
                        className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-zinc-500 hover:text-accent-400 transition-colors"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedId === msg.id ? 'Copied' : 'Copy'}
                      </button>
                      <button 
                        onClick={() => playTTS(msg.id, msg.content)}
                        className={`flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-zinc-500 hover:text-accent-400 transition-colors ${isPlaying === msg.id ? 'text-accent-400 animate-pulse' : ''}`}
                      >
                        <Volume2 className="w-3 h-3" />
                        Listen
                      </button>
                      <button className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-zinc-500 hover:text-accent-400 transition-colors">
                        <Share2 className="w-3 h-3" />
                        Share
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center accent-gradient relative">
                  <Sparkles className="w-4 h-4 text-zinc-950" />
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-lg bg-accent-400"
                  />
                </div>
                <div className="space-y-1">
                  <div className="glass bg-zinc-900/30 rounded-2xl rounded-tl-none p-4 flex items-center gap-1.5 min-w-[60px] border border-accent-500/10">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ 
                          y: [0, -4, 0],
                          opacity: [0.4, 1, 0.4],
                          scale: [0.8, 1.1, 0.8]
                        }}
                        transition={{ 
                          duration: 1, 
                          repeat: Infinity, 
                          delay: i * 0.15,
                          ease: "easeInOut" 
                        }}
                        className="w-1.5 h-1.5 rounded-full bg-accent-400"
                      />
                    ))}
                  </div>
                  <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-600 pl-1">Assistant is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <AdRenderer placement="chat_bottom" className="mt-4" />
        </div>
      </div>

      <div className="p-4 md:p-8 pt-0 w-full max-w-4xl mx-auto flex-none">
        <ChatInput 
          input={input} 
          setInput={setInput} 
          onSend={onSend} 
          isTyping={isTyping}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
        />
      </div>
    </div>
  );
}

function ChatInput({ input, setInput, onSend, selectedFile, setSelectedFile, isTyping }: any) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        // Use functional state update to ensure we have latest text if user is typing
        setInput(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [setInput]);

  const toggleListening = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start recognition:', err);
      }
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 192)}px`;
    }
  }, [input]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target?.result as string;
      const base64 = data.split(',')[1];
      setSelectedFile({
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'file',
        data: base64,
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="glass rounded-2xl p-2 flex items-end gap-2 focus-within:border-accent-500/50 transition-colors shadow-2xl">
      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange}
      />
      <div className="flex items-center">
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="p-3 hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400 hover:text-accent-400"
          title="Upload file"
        >
          <Plus className="w-5 h-5" />
        </button>
        <button 
          onClick={toggleListening}
          className={`p-3 rounded-xl transition-all relative ${isListening ? 'text-red-500 bg-red-500/10' : 'text-zinc-400 hover:text-accent-400 hover:bg-zinc-800'}`}
          title={isListening ? 'Stop listening' : 'Start dictation'}
        >
          <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
          {isListening && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-ping" />
          )}
        </button>
      </div>
      
      <div className="flex-1 flex flex-col gap-2 p-1">
        {selectedFile && (
          <div className="flex items-center gap-2 bg-zinc-800 p-2 rounded-lg text-sm w-fit border border-accent-500/30">
            {selectedFile.type === 'image' ? <ImageIcon className="w-4 h-4 text-accent-400" /> : <FileText className="w-4 h-4 text-accent-400" />}
            <span className="truncate max-w-[200px]">{selectedFile.name}</span>
            <button onClick={() => setSelectedFile(null)} className="ml-2 hover:text-red-400">×</button>
          </div>
        )}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSend();
            } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder={isListening ? "Listening..." : "Ask MA Assistant anything..."}
          className="w-full bg-transparent border-none focus:ring-0 text-zinc-100 placeholder:text-zinc-500 py-3 px-2 resize-none max-h-48 scrollbar-hide"
          rows={1}
        />
      </div>

      <button 
        onClick={() => onSend()}
        disabled={(!input.trim() && !selectedFile) || isTyping}
        className="p-3 bg-accent-500 hover:bg-accent-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 rounded-xl transition-all active:scale-95 flex items-center justify-center"
      >
        <Send className="w-6 h-6" />
      </button>
    </div>
  );
}
