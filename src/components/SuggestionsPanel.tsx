import React from 'react';
import { 
  Zap, 
  Languages, 
  FileText, 
  Globe, 
  Sparkles,
  LucideIcon,
  MessageSquare,
  Rocket,
  Search,
  Mail
} from 'lucide-react';
import { motion } from 'motion/react';
import { Suggestion } from '../types';

const ICON_MAP: Record<string, LucideIcon> = {
  Zap,
  Languages,
  FileText,
  Globe,
  Sparkles,
  MessageSquare,
  Rocket,
  Search,
  Mail
};

interface SuggestionsPanelProps {
  suggestions: Suggestion[];
  onSelect: (suggestion: Suggestion) => void;
}

export default function SuggestionsPanel({ suggestions, onSelect }: SuggestionsPanelProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 w-full max-w-6xl mx-auto mt-12 px-6 pb-24 md:pb-12">
      {suggestions.map((suggestion, index) => {
        const Icon = ICON_MAP[suggestion.icon] || Sparkles;
        return (
          <motion.button
            key={suggestion.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelect(suggestion)}
            className="group glass p-6 rounded-2xl text-left hover:border-accent-500/50 hover:bg-accent-500/5 transition-all active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center mb-4 group-hover:bg-accent-500 group-hover:text-zinc-950 transition-colors">
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-zinc-100 group-hover:text-accent-400 transition-colors">{suggestion.title}</h3>
            <p className="text-sm text-zinc-500 mt-1 line-clamp-2">{suggestion.description}</p>
          </motion.button>
        );
      })}
    </div>
  );
}
