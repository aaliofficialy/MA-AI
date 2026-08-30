/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send,
  Plus,
  Image as ImageIcon,
  FileText,
  Menu,
  X,
  PlusCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Message, AppState, Attachment, Suggestion } from './types';
import { useFirebase } from './components/FirebaseProvider';
import LandingPage from './components/LandingPage';
import { db, collection, addDoc, query, onSnapshot, orderBy, where, serverTimestamp, setDoc, doc, deleteDoc, limit as firestoreLimit } from './lib/firebase';

// Components
import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';
import SuggestionsPanel from './components/SuggestionsPanel';
import ContactPage from './components/ContactPage';
import AdminView from './components/AdminView';
import AdRenderer from './components/AdRenderer';
import { useTheme } from './components/ThemeContext';

const ADMIN_EMAIL = 'aaliofficialy@gmail.com';

const SUGGESTIONS: Suggestion[] = [
  { title: 'Smart Reply', description: 'Generate professional responses', prompt: 'Help me write a professional reply to:', icon: 'Zap' },
  { title: 'Translator', description: 'Translate text instantly', prompt: 'Translate this to [Target Language]:', icon: 'Languages' },
  { title: 'Doc Analysis', description: 'Summarize or explain files', prompt: 'Summarize the key points of this document:', icon: 'FileText' },
  { title: 'Email Assistant', description: 'Draft emails quickly', prompt: 'Draft a professional email about:', icon: 'Globe' },
  { title: 'Social Media', description: 'Generate engaging posts', prompt: 'Create a social media post for:', icon: 'Sparkles' },
];

export default function App() {
  const { accent } = useTheme();
  const { user, loading, userData } = useFirebase();
  const [history, setHistory] = useState<Message[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [currentView, setCurrentView] = useState<'ai' | 'contact' | 'admin' | 'admin-login'>('ai');
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState<Attachment | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('userId', '==', user.uid), orderBy('updatedAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChats(chatList);
      
      if (snapshot.empty) {
        createNewChat();
      } else if (!currentChatId) {
        setCurrentChatId(snapshot.docs[0].id);
      }
    }, (error) => {
      console.error("Chats listener error:", error);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!currentChatId) return;

    const messagesRef = collection(db, 'chats', currentChatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setHistory(msgs);
    }, (error) => {
      console.error("Messages listener error:", error);
    });

    return () => unsubscribe();
  }, [currentChatId]);

  const createNewChat = async () => {
    if (!user) return;
    const newChatId = Date.now().toString();
    await setDoc(doc(db, 'chats', newChatId), {
      id: newChatId,
      userId: user.uid,
      title: 'New Conversation',
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    });
    setCurrentChatId(newChatId);
    setCurrentView('ai');
  };

  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    if (currentView === 'admin' && !isAdmin) {
      setCurrentView('ai');
    }
  }, [isAdmin, currentView]);

  if (loading) {
    return (
      <div className="h-screen w-full bg-zinc-950 flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 rounded-2xl accent-gradient border border-accent-500/30 flex items-center justify-center shadow-2xl shadow-accent-500/20"
        >
          <Sparkles className="w-8 h-8 text-zinc-950" />
        </motion.div>
      </div>
    );
  }

  const handleSend = async (messageText: string = input, attachments: Attachment[] = []) => {
    if (!messageText.trim() && attachments.length === 0) return;
    if (!currentChatId) return;

    const userMsg: any = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: Date.now(),
    };

    if (attachments.length > 0) {
      userMsg.attachments = attachments;
    } else if (selectedFile) {
      userMsg.attachments = [selectedFile];
    }

    setInput('');
    setSelectedFile(null);
    setIsTyping(true);

    try {
      const messagesRef = collection(db, 'chats', currentChatId, 'messages');
      await addDoc(messagesRef, userMsg);

      // Better title generation: Take first sentence or up to 40 chars
      const generateTitle = (text: string) => {
        const clean = text.trim().replace(/\n/g, ' ');
        const firstSentence = clean.split(/[.!?]/)[0];
        const title = firstSentence.length > 40 ? firstSentence.substring(0, 40).trim() + '...' : firstSentence;
        return title || 'New Conversation';
      };

      const updateData: any = {
        lastMessage: messageText.substring(0, 100),
        updatedAt: serverTimestamp(),
      };

      // Only rename if it's the first message and still has default title
      const currentChat = chats.find(c => c.id === currentChatId);
      if (history.length === 0 || currentChat?.title === 'New Conversation') {
        updateData.title = generateTitle(messageText);
      }

      await setDoc(doc(db, 'chats', currentChatId), updateData, { merge: true });

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          history: history.slice(-10),
          image: attachments.find(a => a.type === 'image') || (selectedFile?.type === 'image' ? selectedFile : null),
          file: attachments.find(a => a.type === 'file') || (selectedFile?.type === 'file' ? selectedFile : null)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to connect to AI server');
      }

      const data = await response.json();
      
      await addDoc(messagesRef, {
        role: 'model',
        content: data.text || "I apologize, but I encountered an issue processing that. Please try again.",
        timestamp: Date.now()
      });
    } catch (error: any) {
      console.error('Chat error:', error);
      const messagesRef = collection(db, 'chats', currentChatId, 'messages');
      await addDoc(messagesRef, {
        role: 'model',
        content: `Error: ${error.message || 'Something went wrong while communicating with the AI. Please check your connection and try again.'}`,
        timestamp: Date.now()
      });
    } finally {
      setIsTyping(false);
    }
  };

  const clearHistory = async () => {
    if (window.confirm('Delete this conversation? All messages will be lost.') && currentChatId) {
      try {
        await deleteDoc(doc(db, 'chats', currentChatId));
        setCurrentChatId(null);
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (currentView === 'admin-login') {
    return <LandingPage onBack={() => setCurrentView('ai')} />;
  }

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <Sidebar 
          currentView={currentView}
          setView={setCurrentView}
          currentMode={userData?.currentMode || 'personal'} 
          setMode={async (mode) => {
            if (user) {
              await setDoc(doc(db, 'users', user.uid), { currentMode: mode }, { merge: true });
            }
          }}
          clearHistory={clearHistory}
          history={history}
          chats={chats}
          currentChatId={currentChatId}
          onSelectChat={setCurrentChatId}
          onNewChat={createNewChat}
          userEmail={user.email}
          isAdmin={isAdmin}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>
      
      <main className="flex-1 flex flex-col relative h-full w-full">
        {/* Global Ad Header */}
        <div className="hidden md:block">
           <AdRenderer placement="global_header" className="border-b border-zinc-800" />
        </div>
        
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 glass border-b border-zinc-800 z-30">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-zinc-400 hover:text-accent-400">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-400" />
            <span className="font-bold text-sm tracking-tight">MA Assistant</span>
          </div>
          <button onClick={createNewChat} className="p-2 text-zinc-400 hover:text-accent-400">
            <PlusCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {currentView === 'contact' ? (
            <ContactPage />
          ) : currentView === 'admin' ? (
            <AdminView isAdmin={isAdmin} />
          ) : (
            <>
              {history.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center overflow-y-auto">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                  >
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight px-4">
                      Welcome, <span className="text-accent">{user.displayName?.split(' ')[0] || 'User'}</span>
                    </h1>
                    <p className="text-zinc-400 max-w-lg mx-auto text-lg px-4">
                      Supercharge your communication with the premium {accent.charAt(0).toUpperCase() + accent.slice(1)} Edition AI.
                      Advanced analysis and instant automation at your command.
                    </p>
                  </motion.div>

                  <SuggestionsPanel 
                    suggestions={SUGGESTIONS} 
                    onSelect={(suggestion) => setInput(suggestion.prompt)}
                  />
                </div>
              ) : (
                <ChatPanel 
                  history={history} 
                  isTyping={isTyping}
                  input={input}
                  setInput={setInput}
                  onSend={handleSend}
                  selectedFile={selectedFile}
                  setSelectedFile={setSelectedFile}
                />
              )}
              
              {history.length === 0 && (
                <div className="w-full max-w-4xl mx-auto px-6 pb-8 mt-auto">
                  <ChatInput 
                    input={input} 
                    setInput={setInput} 
                    onSend={handleSend} 
                    selectedFile={selectedFile}
                    setSelectedFile={setSelectedFile}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function ChatInput({ input, setInput, onSend, selectedFile, setSelectedFile }: any) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      <button 
        onClick={() => fileInputRef.current?.click()}
        className="p-3 hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400 hover:text-accent-400"
      >
        <Plus className="w-6 h-6" />
      </button>
      
      <div className="flex-1 flex flex-col gap-2 p-1">
        {selectedFile && (
          <div className="flex items-center gap-2 bg-zinc-800 p-2 rounded-lg text-sm w-fit border border-accent-500/30">
            {selectedFile.type === 'image' ? <ImageIcon className="w-4 h-4 text-accent-400" /> : <FileText className="w-4 h-4 text-accent-400" />}
            <span className="truncate max-w-[200px]">{selectedFile.name}</span>
            <button onClick={() => setSelectedFile(null)} className="ml-2 hover:text-red-400">×</button>
          </div>
        )}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder="Ask MA Assistant anything..."
          className="w-full bg-transparent border-none focus:ring-0 text-zinc-100 placeholder:text-zinc-500 py-3 px-2 resize-none max-h-48 scrollbar-hide"
          rows={1}
        />
      </div>

      <button 
        onClick={() => onSend()}
        disabled={!input.trim() && !selectedFile}
        className="p-3 bg-accent-500 hover:bg-accent-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 rounded-xl transition-all active:scale-95 flex items-center justify-center"
      >
        <Send className="w-6 h-6" />
      </button>
    </div>
  );
}
