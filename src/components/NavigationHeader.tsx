import React from 'react';
import { ApiStatus } from '../types';
import { Smartphone, Monitor, ShieldCheck, ArrowLeft, Terminal } from 'lucide-react';

interface NavigationHeaderProps {
  currentView: 'search' | 'profile';
  onNavigateBack: () => void;
  isMobileFrame: boolean;
  onToggleFrame: () => void;
  apiStatus: ApiStatus | null;
  onOpenOAuthModal: () => void;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  currentView,
  onNavigateBack,
  isMobileFrame,
  onToggleFrame,
  apiStatus,
  onOpenOAuthModal,
}) => {
  return (
    <header 
      id="app-nav-header" 
      className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between transition-all shadow-xs"
    >
      {/* Left: Back button or 42 Logo */}
      <div className="flex items-center gap-3">
        {currentView === 'profile' ? (
          <button
            id="nav-back-button"
            onClick={onNavigateBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
            aria-label="Back to Search"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600" />
            <span>Search</span>
          </button>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-sm font-mono shadow-sm">
              42
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-800 tracking-tight leading-none">
                Swifty Companion
              </h1>
              <span className="text-[10px] text-slate-500 font-mono">
                Mobile Initiation v4
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Center/Right: Actions and Status Badges */}
      <div className="flex items-center gap-2">
        {/* Token status badge / button */}
        <button
          id="token-status-pill-btn"
          onClick={onOpenOAuthModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs transition-colors cursor-pointer text-slate-700"
          title="Click to view 42 OAuth2 token caching status"
        >
          <ShieldCheck className={`w-3.5 h-3.5 ${apiStatus?.hasToken ? 'text-blue-600' : 'text-amber-500'}`} />
          <span className="text-[11px] font-medium hidden sm:inline text-slate-700">
            {apiStatus?.hasCredentials 
              ? (apiStatus.hasToken ? `Token (${apiStatus.tokenReuseCount} reuses)` : '42 Live')
              : 'Demo Mode'
            }
          </span>
          <span className={`w-1.5 h-1.5 rounded-full ${apiStatus?.hasToken ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
        </button>

        {/* View Layout Toggle (Mobile Frame vs Fluid Responsive) */}
        <button
          id="toggle-layout-frame-btn"
          onClick={onToggleFrame}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 transition-colors cursor-pointer"
          title={isMobileFrame ? 'Switch to Full-Screen View' : 'Switch to Mobile Device Frame View'}
        >
          {isMobileFrame ? (
            <>
              <Monitor className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px] font-medium hidden md:inline">Full Layout</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px] font-medium hidden md:inline">Mobile Frame</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
