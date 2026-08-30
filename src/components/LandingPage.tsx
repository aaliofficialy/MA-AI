import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Shield, Zap, Globe, MessageSquare, ArrowRight } from 'lucide-react';
import { signInWithPopup, googleProvider, auth } from '../lib/firebase';
import AdRenderer from './AdRenderer';

export default function LandingPage({ onBack }: { onBack?: () => void }) {
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);
    
    try {
      // In a real app, this would be a secure backend call
      const result = await (auth as any).signInWithPassword('admin', password);
      if (result.success) {
        if (onBack) onBack();
      } else {
        setError('Invalid administrator credentials');
      }
    } catch (err: any) {
      setError('An error occurred during authentication');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Global Ad Header */}
      <div className="absolute top-0 left-0 w-full z-20">
        <AdRenderer placement="global_header" className="border-b border-zinc-800/50" />
      </div>

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-zinc-800/5 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full text-center relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-red-500/30 text-red-500 text-xs font-bold uppercase tracking-widest mb-8">
          <Shield className="w-3 h-3" />
          Restricted Access Interface
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-white uppercase">
          Admin <span className="text-red-500">Portal</span>
        </h1>
        
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          This interface is reserved for system administrators only. 
          Use your authorized credentials to access the system dashboard and ad management tools.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 mb-8">
          <form onSubmit={handleLogin} className="w-full sm:w-96 space-y-4">
            <div className="relative">
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin Password"
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-red-500/50 outline-none rounded-2xl px-6 py-4 text-white placeholder:text-zinc-600 transition-all text-center"
                autoFocus
              />
              {error && (
                <p className="text-red-500 text-xs mt-2 font-medium">{error}</p>
              )}
            </div>
            
            <button 
              type="submit"
              disabled={isLoggingIn || !password}
              className="group w-full bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-red-500/20 disabled:opacity-50 disabled:scale-100"
            >
              {isLoggingIn ? 'Authenticating...' : 'Access Dashboard'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>

        {onBack && (
          <button 
            onClick={onBack}
            className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 mx-auto text-sm"
          >
            Back to Assistant View
          </button>
        )}

        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto opacity-30">
          {[
            { icon: Globe, label: 'Geo Filtering' },
            { icon: MessageSquare, label: 'Log Auditing' },
            { icon: Shield, label: 'Access Control' },
            { icon: Zap, label: 'System Vitals' }
          ].map((feature, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <feature.icon className="w-6 h-6 text-zinc-400" />
              <span className="text-[10px] uppercase tracking-widest font-bold">{feature.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
