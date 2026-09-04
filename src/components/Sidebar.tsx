import React, { useState } from 'react';
import { 
  MessageSquare, 
  Briefcase, 
  User, 
  Trash2,
  ChevronRight,
  Sparkles,
  LogOut,
  Settings,
  ShieldCheck,
  Mail,
  Plus,
  Search,
  X,
  Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Message } from '../types';
import { signOut, auth } from '../lib/firebase';
import AdRenderer from './AdRenderer';
import { useTheme } from './ThemeContext';

interface SidebarProps {
  currentView: 'ai' | 'contact' | 'admin' | 'admin-login';
  setView: (view: 'ai' | 'contact' | 'admin' | 'admin-login') => void;
  currentMode: 'personal' | 'business';
  setMode: (mode: 'personal' | 'business') => void;
  clearHistory: () => void;
  history: Message[];
  chats: any[];
  currentChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  userEmail?: string | null;
  isAdmin?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ 
  currentView, 
  setView, 
  currentMode, 
  setMode, 
  clearHistory, 
  history, 
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  userEmail, 
  isAdmin,
  onClose 
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showThemePicker, setShowThemePicker] = useState(false);
  const { accent, setAccent } = useTheme();
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredChats = chats.filter(chat => 
    (chat.title || 'Untitled Chat').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const accents: { value: 'gold' | 'emerald' | 'violet'; color: string; label: string }[] = [
    { value: 'gold', color: 'bg-gold-500', label: 'Gold' },
    { value: 'emerald', color: 'bg-emerald-500', label: 'Emerald' },
    { value: 'violet', color: 'bg-violet-500', label: 'Violet' },
  ];

  return (
    <aside className="w-72 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl accent-gradient flex items-center justify-center shadow-lg shadow-accent-500/20">
            <Sparkles className="w-6 h-6 text-zinc-950" />
          </div>
          <div>
            <h2 className="font-bold text-lg leading-tight tracking-tight text-white">A L I</h2>
            <span className="text-[10px] uppercase tracking-widest text-accent-500 font-bold opacity-80">Affiliate Legal Intelligence</span>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="md:hidden p-2 text-zinc-500 hover:text-white">
            <span className="text-xl">×</span>
          </button>
        )}
      </div>

      <div className="px-4 mb-4">
        <button 
          onClick={() => {
            onNewChat();
            if (onClose) onClose();
          }}
          className="w-full flex items-center gap-3 p-3 rounded-xl bg-accent-500 text-zinc-950 font-bold text-sm hover:bg-accent-400 transition-all shadow-lg shadow-accent-500/20 mb-4 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          New Conversation
        </button>
        
        <div className="bg-zinc-950 p-1 rounded-xl flex gap-1 border border-zinc-800">
          <button 
            onClick={() => setMode('personal')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${currentMode === 'personal' ? 'bg-zinc-800 text-accent-400 border border-zinc-700 shadow-xl text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <User className="w-4 h-4" />
            Personal
          </button>
          <button 
            onClick={() => setMode('business')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${currentMode === 'business' ? 'bg-zinc-800 text-accent-400 border border-zinc-700 shadow-xl text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Briefcase className="w-4 h-4" />
            Business
          </button>
        </div>
      </div>

      <nav className="px-4 mb-8 space-y-1">
        <button 
          onClick={() => {
            setView('ai');
            if (onClose) onClose();
          }}
          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-sm font-medium ${currentView === 'ai' ? 'bg-accent-500/10 text-accent-400 border border-accent-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <MessageSquare className="w-4 h-4" />
          AI Assistant
        </button>
        <button 
          onClick={() => {
            setView('contact');
            if (onClose) onClose();
          }}
          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-sm font-medium ${currentView === 'contact' ? 'bg-accent-500/10 text-accent-400 border border-accent-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <Mail className="w-4 h-4" />
          Contact Support
        </button>
        
        <button 
          onClick={() => {
            setView(isAdmin ? 'admin' : 'admin-login');
            if (onClose) onClose();
          }}
          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-sm font-medium ${currentView === 'admin' || currentView === 'admin-login' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'text-zinc-500 hover:text-red-400'}`}
        >
          <ShieldCheck className="w-4 h-4" />
          {isAdmin ? 'Admin Dashboard' : 'Admin Login'}
        </button>
      </nav>

      <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
        <AdRenderer placement="sidebar_top" className="mb-4 mt-2" />
        {currentView === 'ai' && (
          <>
            <div className="px-2 mb-4">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-accent-400 transition-colors" />
                <input 
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chats..."
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-accent-500/50 outline-none rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-zinc-600 transition-all font-medium"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mb-2 px-2">
              <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] font-mono">Recent Chats</h3>
              <button 
                onClick={clearHistory} 
                className="text-zinc-600 hover:text-red-400 transition-colors p-1"
                title="Clear all history"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {filteredChats.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-zinc-600 text-xs italic">
                  {searchQuery ? 'No matching conversations' : 'No chats yet...'}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredChats.map(chat => (
                  <button 
                    key={chat.id}
                    onClick={() => {
                      onSelectChat(chat.id);
                      if (onClose) onClose();
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-sm font-medium text-left group ${currentChatId === chat.id ? 'bg-accent-500/10 text-accent-400 border border-accent-500/20' : 'text-zinc-500 hover:text-zinc-300 border border-transparent'}`}
                  >
                    <MessageSquare className="w-4 h-4 shrink-0" />
                    <span className="truncate flex-1">{chat.title || 'Untitled Chat'}</span>
                    {currentChatId === chat.id && <ChevronRight className="w-3 h-3 opacity-50" />}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="px-4 py-2">
        <AdRenderer placement="sidebar" />
      </div>

      <div className="p-4 border-t border-zinc-800 space-y-1">
        <div className="relative">
          <button 
            onClick={() => setShowThemePicker(!showThemePicker)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-sm font-medium ${showThemePicker ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'}`}
          >
            <Palette className="w-4 h-4 text-accent-400" />
            Accents
            <div className="ml-auto flex gap-1">
              {accents.map((a) => (
                <div key={a.value} className={`w-2 h-2 rounded-full ${a.color} ${accent === a.value ? 'ring-2 ring-white ring-offset-1 ring-offset-zinc-900' : ''}`} />
              ))}
            </div>
          </button>

          <AnimatePresence>
            {showThemePicker && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full left-0 w-full mb-2 p-2 glass rounded-2xl z-50 shadow-2xl"
              >
                <div className="grid grid-cols-1 gap-1">
                  {accents.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => {
                        setAccent(item.value);
                        setShowThemePicker(false);
                      }}
                      className={`flex items-center gap-3 p-2 rounded-xl transition-all text-sm font-medium ${accent === item.value ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}`}
                    >
                      <div className={`w-4 h-4 rounded-full ${item.color}`} />
                      {item.label}
                      {accent === item.value && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-400" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-100 text-sm font-medium">
          <Settings className="w-4 h-4" />
          Settings
        </button>
        {isAdmin && (
          <button 
            onClick={() => signOut(auth)}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 transition-colors text-zinc-400 hover:text-red-400 text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Logout Admin
          </button>
        )}
        <div className="p-4 glass rounded-2xl mt-4">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isAdmin ? 'bg-red-500 text-white' : 'bg-zinc-800 text-accent-400'}`}>
              {userEmail?.[0].toUpperCase() || 'G'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold truncate text-white">{isAdmin ? 'Aali (Admin)' : 'Guest User'}</p>
              <p className="text-[10px] text-zinc-500">{isAdmin ? 'System Root' : 'Guest Member'}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
