import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, MessageSquare, Phone, Send, MapPin, Sparkles, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          className="glass p-12 rounded-3xl max-w-md border-accent-500/30"
        >
          <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Message Received</h2>
          <p className="text-zinc-400 mb-8">
            Thank you for contacting MA AI Assistant (Gold Edition). Our support team will get back to you within 24 hours.
          </p>
          <button 
            onClick={() => setSubmitted(false)}
            className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-bold transition-colors"
          >
            Send Another Message
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto">
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-12">
        <motion.div 
          initial={{ x: -20, opacity: 0 }} 
          animate={{ x: 0, opacity: 1 }}
          className="space-y-8"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/10 text-accent-400 text-[10px] font-bold uppercase tracking-widest mb-4">
              Support
            </div>
            <h1 className="text-5xl font-bold tracking-tight mb-4 text-white">Get in <span className="text-accent">Touch</span></h1>
            <p className="text-zinc-400 text-lg">
              Have questions about MA AI Gold Edition? Whether it's for business automation or personal use, our team is ready to assist.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 glass rounded-xl flex items-center justify-center shrink-0 border-accent-500/20">
                <Mail className="w-6 h-6 text-accent-400" />
              </div>
              <div>
                <h4 className="font-bold text-white">Email Us</h4>
                <p className="text-zinc-500 text-sm">mohammad.ali.official@hotmail.com</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 glass rounded-xl flex items-center justify-center shrink-0 border-accent-500/20">
                <Phone className="w-6 h-6 text-accent-400" />
              </div>
              <div>
                <h4 className="font-bold text-white">Phone Support</h4>
                <p className="text-zinc-500 text-sm">00000000000</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ x: 20, opacity: 0 }} 
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="glass p-8 rounded-3xl border-accent-500/20 space-y-6 shadow-2xl">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Name</label>
                <input required className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:border-accent-500/50 outline-none text-white" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Email</label>
                <input required type="email" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:border-accent-500/50 outline-none text-white" placeholder="john@example.com" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Subject</label>
              <select className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:border-accent-500/50 outline-none text-white">
                <option>Business Automation</option>
                <option>Premium Membership</option>
                <option>Technical Support</option>
                <option>General Inquiry</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Message</label>
              <textarea required rows={4} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:border-accent-500/50 outline-none text-white resize-none" placeholder="Tell us how we can help..." />
            </div>
            <button className="w-full accent-gradient text-zinc-950 py-4 rounded-xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-all">
              <Send className="w-5 h-5" />
              Send Secure Message
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
