import React, { useState, useEffect, useCallback } from 'react';
import { User42, ApiStatus, SearchHistoryItem } from './types';
import { NavigationHeader } from './components/NavigationHeader';
import { SearchView } from './components/SearchView';
import { ProfileView } from './components/ProfileView';
import { OAuthModal } from './components/OAuthModal';

const HISTORY_STORAGE_KEY = 'swifty_companion_history_v1';

export default function App() {
  const [currentView, setCurrentView] = useState<'search' | 'profile'>('search');
  const [activeUser, setActiveUser] = useState<User42 | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ code?: string; message: string; login?: string } | null>(null);
  const [isMobileFrame, setIsMobileFrame] = useState(false);
  const [isOAuthModalOpen, setIsOAuthModalOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);

  // Search history state persisted in localStorage
  const [history, setHistory] = useState<SearchHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return [
      {
        login: 'ykuru',
        displayName: 'Yusuf Kuru',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        level: 10.42,
        timestamp: Date.now() - 3600000,
      },
      {
        login: 'norminet',
        displayName: 'Norminet',
        avatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80',
        level: 21.0,
        timestamp: Date.now() - 7200000,
      },
    ];
  });

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch {
      // ignore
    }
  }, [history]);

  // Fetch API / OAuth2 status
  const fetchApiStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setApiStatus(data);
      }
    } catch {
      // ignore server not ready
    }
  }, []);

  useEffect(() => {
    fetchApiStatus();
    const interval = setInterval(fetchApiStatus, 15000);
    return () => clearInterval(interval);
  }, [fetchApiStatus]);

  // Search handler
  const handleSearch = async (login: string) => {
    if (!login.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/user/${encodeURIComponent(login.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        setError({
          code: data.code || 'UNKNOWN_ERROR',
          message: data.error || `Could not fetch user "${login}".`,
          login,
        });
        return;
      }

      // Success: update active user
      setActiveUser(data);
      setCurrentView('profile');

      // Update recent search history
      setHistory((prev) => {
        const filtered = prev.filter((item) => item.login.toLowerCase() !== data.login.toLowerCase());
        const mainCursus = data.cursus_users?.[0];
        const newItem: SearchHistoryItem = {
          login: data.login,
          displayName: data.displayname || `${data.first_name} ${data.last_name}`,
          avatar: data.image?.versions?.medium || data.image?.link,
          level: mainCursus?.level,
          timestamp: Date.now(),
        };
        return [newItem, ...filtered].slice(0, 8);
      });

      // Refresh status for token reuse metrics
      fetchApiStatus();
    } catch (err: any) {
      setError({
        code: 'NETWORK_ERROR',
        message: 'Network error: Unable to reach the server. Please check your connection.',
        login,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateBack = () => {
    setCurrentView('search');
    setError(null);
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      {/* Container wrapper: Mobile Frame vs Responsive Fluid layout */}
      <div className={`flex-1 flex flex-col w-full mx-auto transition-all ${
        isMobileFrame 
          ? 'max-w-md my-4 sm:my-8 bg-white border border-slate-300 rounded-[2.5rem] shadow-2xl overflow-hidden ring-8 ring-slate-200/80 relative' 
          : 'w-full'
      }`}>
        {/* Mobile Mock Status Bar if in Mobile Frame */}
        {isMobileFrame && (
          <div className="bg-[#1E293B] px-6 pt-3 pb-1 flex items-center justify-between text-[10px] font-mono text-slate-300 select-none border-b border-slate-700">
            <span>09:42</span>
            <div className="w-16 h-3.5 bg-slate-900 rounded-full mx-auto -mt-1 border border-slate-700" />
            <div className="flex items-center gap-1.5">
              <span>5G</span>
              <div className="w-4 h-2 border border-slate-300 rounded-sm p-0.2">
                <div className="w-full h-full bg-emerald-400 rounded-xs" />
              </div>
            </div>
          </div>
        )}

        {/* Global Navigation Header */}
        <NavigationHeader
          currentView={currentView}
          onNavigateBack={handleNavigateBack}
          isMobileFrame={isMobileFrame}
          onToggleFrame={() => setIsMobileFrame((prev) => !prev)}
          apiStatus={apiStatus}
          onOpenOAuthModal={() => setIsOAuthModalOpen(true)}
        />

        {/* Main Content: View 1 (Search) or View 2 (Profile) */}
        <main className="flex-1 flex flex-col bg-[#F8FAFC]">
          {currentView === 'search' ? (
            <SearchView
              onSearch={handleSearch}
              isLoading={isLoading}
              error={error}
              onClearError={() => setError(null)}
              history={history}
              onSelectHistory={handleSearch}
              onClearHistory={handleClearHistory}
            />
          ) : (
            activeUser && (
              <ProfileView
                user={activeUser}
                onNavigateBack={handleNavigateBack}
              />
            )
          )}
        </main>

        {/* Mobile Home Indicator if in Mobile Frame */}
        {isMobileFrame && (
          <div className="py-2 flex justify-center bg-white border-t border-slate-200">
            <div className="w-28 h-1 bg-slate-300 rounded-full" />
          </div>
        )}
      </div>

      {/* Footer / Subject Compliance Bar (when in fluid desktop mode) */}
      {!isMobileFrame && (
        <footer className="py-3 px-4 border-t border-slate-200 bg-white text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-3 max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Swifty Companion v4</span>
            <span>•</span>
            <span>42 Mobile Initiation Subject</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOAuthModalOpen(true)}
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline cursor-pointer"
            >
              OAuth2 & Cache Diagnostics
            </button>
            <span>•</span>
            <span className="text-slate-500">
              {apiStatus?.hasCredentials ? 'Live Intra API Connected' : 'Demo & Offline Ready'}
            </span>
          </div>
        </footer>
      )}

      {/* OAuth2 Diagnostics & Evaluation Modal */}
      <OAuthModal
        isOpen={isOAuthModalOpen}
        onClose={() => setIsOAuthModalOpen(false)}
        status={apiStatus}
        onRefreshStatus={fetchApiStatus}
      />
    </div>
  );
}
