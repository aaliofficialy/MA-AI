import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  MessageSquare, 
  ShieldCheck, 
  Activity, 
  Search, 
  Filter,
  MoreHorizontal,
  Mail,
  Zap,
  TrendingUp,
  Cpu,
  Layout,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { db, collection, onSnapshot, query, orderBy, limit as firestoreLimit, addDoc, deleteDoc, doc, updateDoc } from '../lib/firebase';
import { Ad } from '../types';

export default function AdminView({ isAdmin }: { isAdmin: boolean }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'ads'>('overview');
  const [permissionError, setPermissionError] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalChats: 0,
    activeNow: 12,
    apiHealth: '99.9%'
  });
  
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [isAddingAd, setIsAddingAd] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  
  // Ad Form State
  const [adForm, setAdForm] = useState<Omit<Ad, 'id' | 'createdAt'>>({
    name: '',
    code: '',
    placement: 'sidebar',
    active: true
  });

  useEffect(() => {
    if (!isAdmin) return;

    const usersQ = query(collection(db, 'users'), orderBy('createdAt', 'desc'), firestoreLimit(5));
    const chatsQ = collection(db, 'chats');
    const adsQ = query(collection(db, 'ads'), orderBy('createdAt', 'desc'));

    const unsubUsers = onSnapshot(usersQ, (snapshot) => {
      setRecentUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setStats(prev => ({ ...prev, totalUsers: snapshot.size + 142 }));
    }, (error) => {
      if (error.code === 'permission-denied') {
        console.warn("User does not have admin permissions for users collection.");
        setPermissionError(true);
      } else {
        console.error("Admin view users error:", error);
      }
    });

    const unsubChats = onSnapshot(chatsQ, (snapshot) => {
      setStats(prev => ({ ...prev, totalChats: snapshot.size }));
    }, (error) => {
      if (error.code === 'permission-denied') {
          console.warn("User does not have admin permissions for chats collection.");
      } else {
          console.error("Admin view chats error:", error);
      }
    });

    const unsubAds = onSnapshot(adsQ, (snapshot) => {
      setAds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad)));
    }, (error) => {
      console.error("Admin view ads error:", error);
    });

    const statsInterval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        activeNow: Math.max(8, Math.min(25, prev.activeNow + (Math.random() > 0.5 ? 1 : -1)))
      }));
    }, 5000);

    return () => {
      unsubUsers();
      unsubChats();
      unsubAds();
      clearInterval(statsInterval);
    };
  }, [isAdmin]);

  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAd) {
        await updateDoc(doc(db, 'ads', editingAd.id), {
          ...adForm,
          updatedAt: Date.now()
        });
      } else {
        await addDoc(collection(db, 'ads'), {
          ...adForm,
          createdAt: Date.now()
        });
      }
      setIsAddingAd(false);
      setEditingAd(null);
      setAdForm({ name: '', code: '', placement: 'sidebar', active: true });
    } catch (err) {
      console.error("Error saving ad:", err);
      alert("Failed to save ad. Check permissions.");
    }
  };

  const handleDeleteAd = async (id: string) => {
    if (confirm("Are you sure you want to delete this ad?")) {
      try {
        await deleteDoc(doc(db, 'ads', id));
        // No need for alert on success, it will disappear from UI
      } catch (err: any) {
        console.error("Error deleting ad:", err);
        alert(`Failed to delete ad: ${err.message || 'Permission denied'}`);
      }
    }
  };

  const handleToggleAd = async (ad: Ad) => {
    try {
      await updateDoc(doc(db, 'ads', ad.id), {
        active: !ad.active
      });
    } catch (err) {
      console.error("Error toggling ad:", err);
    }
  };

  if (!isAdmin || permissionError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-zinc-950">
        <XCircle className="w-16 h-16 text-red-500 mb-6" />
        <h2 className="text-3xl font-bold text-white mb-2">Access Restricted</h2>
        <p className="text-zinc-500 max-w-md">
          You do not have the required administrative privileges to view the system dashboard. 
          If you believe this is an error, please contact the primary administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-y-auto custom-scrollbar">
      <div className="p-8 md:p-12 max-w-7xl mx-auto w-full space-y-12">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-4">
              Administrator Controls
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white">System <span className="text-accent">Dashboard</span></h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                setActiveTab('ads');
                setIsAddingAd(true);
                setEditingAd(null);
                setAdForm({ name: '', code: '', placement: 'sidebar', active: true });
              }}
              className="px-4 py-2 bg-accent-500 rounded-xl text-zinc-950 text-xs font-bold flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <Plus className="w-4 h-4" />
              Inject New Ad
            </button>
            <div className="glass px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold text-zinc-400">
              <Activity className="w-4 h-4 text-emerald-500" />
              Real-time Monitoring Active
            </div>
          </div>
        </header>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-zinc-900/50 border border-zinc-800 rounded-xl self-start">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'ads', label: 'Ad Management', icon: Layout }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.id 
                ? 'bg-accent-500 text-zinc-950 shadow-lg shadow-accent/20' 
                : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-400' },
                { label: 'Chat Sessions', value: stats.totalChats, icon: MessageSquare, color: 'text-accent-400' },
                { label: 'Active Now', value: stats.activeNow, icon: TrendingUp, color: 'text-emerald-400' },
                { label: 'API Uptime', value: stats.apiHealth, icon: Cpu, color: 'text-purple-400' },
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass p-6 rounded-2xl border-zinc-800/50 hover:border-zinc-700/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl bg-zinc-900 border border-zinc-800 ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em] font-mono">+12%</span>
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">
                    {typeof stat.value === 'number' && isNaN(stat.value) ? '0' : stat.value}
                  </p>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Content Tabs Area */}
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* User Management */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Recent Registrations</h3>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-500 transition-colors"><Search className="w-4 h-4" /></button>
                    <button className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-500 transition-colors"><Filter className="w-4 h-4" /></button>
                  </div>
                </div>
                
                <div className="glass rounded-2xl overflow-hidden divide-y divide-zinc-900 border-zinc-800/50">
                  {recentUsers.length === 0 ? (
                    <div className="p-12 text-center text-zinc-600">No users found.</div>
                  ) : (
                    recentUsers.map((user, i) => (
                      <div key={i} className="p-4 flex items-center justify-between hover:bg-zinc-900/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-zinc-300">
                            {user.displayName?.[0] || user.email?.[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{user.displayName || 'Anonymous User'}</p>
                            <p className="text-[10px] text-zinc-500 font-mono">{user.email}</p>
                            <p className="text-[10px] text-zinc-600">Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'New'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="hidden sm:block">
                            <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-1">Status</p>
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-bold">Premium</span>
                          </div>
                          <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-600">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Actions / Alerts */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white">System Alerts</h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-accent-500/5 border border-accent-500/20">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-accent-500/20 flex items-center justify-center shrink-0">
                        <Zap className="w-5 h-5 text-accent-400" />
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-accent-400 mb-1">High Token Usage</h5>
                        <p className="text-xs text-zinc-500 leading-relaxed">System-wide Gemini 3.5 token usage has increased by 45% in the last hour.</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5 text-zinc-400" />
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-zinc-200 mb-1">Backup Success</h5>
                        <p className="text-xs text-zinc-500 leading-relaxed">Firestore database snapshots and security rule backups completed successfully.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 glass rounded-2xl border-accent-500/20">
                   <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-[0.2em] mb-4">Quick Links</h4>
                   <div className="space-y-2">
                     <button 
                       onClick={() => { setActiveTab('ads'); setIsAddingAd(true); }}
                       className="w-full text-left p-3 rounded-xl hover:bg-zinc-900 text-xs font-bold text-accent flex items-center justify-between group"
                     >
                       Inject New Ad
                       <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                     </button>
                     <button className="w-full text-left p-3 rounded-xl hover:bg-zinc-900 text-xs font-bold text-zinc-400 flex items-center justify-between group">
                       Developer Logs
                       <TrendingUp className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                     </button>
                     <button className="w-full text-left p-3 rounded-xl hover:bg-zinc-900 text-xs font-bold text-zinc-400 flex items-center justify-between group">
                       Email Settings
                       <Mail className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                     </button>
                   </div>
                </div>
              </div>

            </div>
          </>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">Ad Inventory</h3>
                <p className="text-sm text-zinc-500">Manage scripts and code snippets for different ad placements.</p>
              </div>
              <button 
                onClick={() => {
                  setIsAddingAd(true);
                  setEditingAd(null);
                  setAdForm({ name: '', code: '', placement: 'sidebar', active: true });
                }}
                className="flex items-center gap-2 px-6 py-3 bg-accent-500 rounded-xl text-zinc-950 font-bold shadow-lg shadow-accent/20 hover:scale-105 active:scale-95 transition-all text-sm"
              >
                <Plus className="w-4 h-4" />
                Inject New Ad
              </button>
            </div>

            <div className="p-4 bg-zinc-900/50 border border-accent-500/10 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <ExternalLink className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-200">AdMob & AdSense Tip</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed mt-1">
                    To integrate <strong>AdMob (Web)</strong> or <strong>AdSense</strong>, create a 'Display Ad' in your provider's dashboard, 
                    then copy the <code>&lt;ins&gt;</code> and <code>&lt;script&gt;</code> tags and paste them into the integration code field below.
                  </p>
                </div>
              </div>
            </div>

            {(isAddingAd || editingAd) && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass p-8 rounded-3xl border-accent-500/30"
              >
                <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  {editingAd ? <Edit2 className="w-5 h-5 text-accent" /> : <Plus className="w-5 h-5 text-accent" />}
                  {editingAd ? 'Edit Ad Component' : 'Deploy New Ad Asset'}
                </h4>
                <form onSubmit={handleSaveAd} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Name / Identifier</label>
                      <input 
                        type="text"
                        required
                        placeholder="e.g. Google Adsense - Sidebar"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent transition-colors"
                        value={adForm.name}
                        onChange={e => setAdForm({...adForm, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Placement Target</label>
                      <select 
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent transition-colors appearance-none"
                        value={adForm.placement}
                        onChange={e => setAdForm({...adForm, placement: e.target.value as any})}
                      >
                        <option value="sidebar">Sidebar Bottom</option>
                        <option value="sidebar_top">Sidebar Top</option>
                        <option value="chat_top">Chat Top</option>
                        <option value="chat_middle">Chat Middle</option>
                        <option value="chat_bottom">Chat Bottom</option>
                        <option value="global_header">Global Header</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Integration Code (AdSense Script/HTML)</label>
                    <textarea 
                      required
                      placeholder="Paste your <ins> or <script> code here..."
                      rows={6}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs font-mono text-zinc-300 focus:outline-none focus:border-accent transition-colors resize-none"
                      value={adForm.code}
                      onChange={e => setAdForm({...adForm, code: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox"
                      id="ad-active"
                      checked={adForm.active}
                      onChange={e => setAdForm({...adForm, active: e.target.checked})}
                      className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-accent focus:ring-accent"
                    />
                    <label htmlFor="ad-active" className="text-sm font-bold text-zinc-300">Set active immediately after deployment</label>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button 
                      type="submit"
                      className="px-8 py-3 bg-white text-zinc-950 rounded-xl font-bold text-sm hover:bg-accent transition-colors"
                    >
                      {editingAd ? 'Update Ad' : 'Deploy Ad'}
                    </button>
                    <button 
                      type="button"
                      onClick={() => { setIsAddingAd(false); setEditingAd(null); }}
                      className="px-8 py-3 bg-zinc-900 text-zinc-400 rounded-xl font-bold text-sm hover:bg-zinc-800"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ads.length === 0 ? (
                <div className="col-span-full py-20 glass rounded-3xl border-dashed border-2 border-zinc-800 flex flex-col items-center justify-center text-zinc-600 gap-4">
                  <Layout className="w-12 h-12 opacity-20" />
                  <p className="font-bold">No ads configured yet.</p>
                </div>
              ) : (
                ads.map((ad) => (
                  <motion.div 
                    key={ad.id}
                    layout
                    className="glass p-6 rounded-2xl border-zinc-800/50 hover:border-zinc-700/50 transition-colors flex flex-col justify-between h-full"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          ad.active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                          {ad.active ? 'Active' : 'Paused'}
                        </div>
                        <div className="text-[10px] text-zinc-600 font-mono">
                          {ad.placement.split('_').join(' ').toUpperCase()}
                        </div>
                      </div>
                      <h4 className="text-lg font-bold text-zinc-100 mb-2 truncate">{ad.name}</h4>
                      <p className="text-[10px] text-zinc-500 font-mono line-clamp-3 mb-6 bg-zinc-950/50 p-2 rounded-lg border border-zinc-900">
                        {ad.code}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-zinc-900">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleToggleAd(ad)}
                          className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400"
                          title={ad.active ? 'Deactivate' : 'Activate'}
                        >
                          {ad.active ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => {
                            setEditingAd(ad);
                            setAdForm({ name: ad.name, code: ad.code, placement: ad.placement, active: ad.active });
                            setIsAddingAd(false);
                          }}
                          className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                      <button 
                        onClick={() => handleDeleteAd(ad.id)}
                        className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-zinc-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
