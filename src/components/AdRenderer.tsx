import React, { useEffect, useRef } from 'react';
import { db, collection, onSnapshot, query, where } from '../lib/firebase';
import { Ad } from '../types';

interface AdRendererProps {
  placement: 'sidebar' | 'chat_top' | 'chat_bottom' | 'sidebar_top' | 'chat_middle' | 'global_header';
  className?: string;
}

export default function AdRenderer({ placement, className = '' }: AdRendererProps) {
  const [ads, setAds] = React.useState<Ad[]>([]);
  const [loading, setLoading] = React.useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, 'ads'), 
      where('placement', '==', placement),
      where('active', '==', true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad)));
      setLoading(false);
    }, (error) => {
      console.error("AdRenderer error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [placement]);

  useEffect(() => {
    if (ads.length > 0 && containerRef.current) {
      // Clear container and inject script/HTML safely
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
      
      ads.forEach(ad => {
        const adDiv = document.createElement('div');
        adDiv.className = 'ad-unit mb-4 last:mb-0 min-h-[50px] flex items-center justify-center bg-zinc-900/10 rounded-lg overflow-hidden';
        
        try {
          const range = document.createRange();
          range.selectNode(document.body);
          const fragment = range.createContextualFragment(ad.code);
          adDiv.appendChild(fragment);
          containerRef.current?.appendChild(adDiv);
        } catch (e) {
          console.error("Failed to render ad script:", e);
        }
      });
    }
  }, [ads]);

  if (loading) {
    return <div className={`animate-pulse bg-zinc-900/20 rounded-xl h-12 ${className}`} />;
  }

  if (ads.length === 0) return null;

  return (
    <div 
      ref={containerRef}
      className={`ad-container ${className}`}
    />
  );
}
