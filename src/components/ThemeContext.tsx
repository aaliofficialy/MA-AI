import React, { createContext, useContext, useState, useEffect } from 'react';

type AccentColor = 'gold' | 'emerald' | 'violet';

interface ThemeContextType {
  accent: AccentColor;
  setAccent: (accent: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [accent, setAccent] = useState<AccentColor>(() => {
    return (localStorage.getItem('app-accent') as AccentColor) || 'gold';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accent);
    localStorage.setItem('app-accent', accent);
  }, [accent]);

  return (
    <ThemeContext.Provider value={{ accent, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
