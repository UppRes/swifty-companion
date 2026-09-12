import React, { useState } from 'react';
import { Search, AlertCircle, History, Sparkles, Terminal, ArrowRight, X, ShieldAlert, WifiOff, CheckCircle } from 'lucide-react';
import { SearchHistoryItem } from '../types';

interface SearchViewProps {
  onSearch: (login: string) => void;
  isLoading: boolean;
  error: { code?: string; message: string; login?: string } | null;
  onClearError: () => void;
  history: SearchHistoryItem[];
  onSelectHistory: (login: string) => void;
  onClearHistory: () => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  onSearch,
  isLoading,
  error,
  onClearError,
  history,
  onSelectHistory,
  onClearHistory,
}) => {
  const [inputLogin, setInputLogin] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputLogin.trim()) return;
    onSearch(inputLogin.trim());
  };

  const handleChipClick = (login: string) => {
    setInputLogin(login);
    onSearch(login);
  };

  return (
    <div id="search-view-container" className="flex flex-col flex-1 p-4 md:p-6 max-w-xl mx-auto w-full">
      {/* 42 Companion Hero Badge */}
      <div className="text-center my-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 mb-3 shadow-xs">
          <Terminal className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          42 Intra Explorer
        </h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
          Search any 42 student login to inspect profile details, cursus progress, skills, and project outcomes.
        </p>
      </div>

      {/* Search Input Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="relative flex items-center shadow-xs">
          <div className="absolute left-3.5 text-slate-400 pointer-events-none">
            <Search className="w-5 h-5 text-blue-600" />
          </div>
          <input
            id="student-login-input"
            type="text"
            value={inputLogin}
            onChange={(e) => {
              setInputLogin(e.target.value);
              if (error) onClearError();
            }}
            placeholder="Enter 42 login (e.g. norminet, ykuru)..."
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            className="w-full pl-11 pr-24 py-3.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-xs transition-all font-mono"
            disabled={isLoading}
          />
          {inputLogin && !isLoading && (
            <button
              type="button"
              onClick={() => setInputLogin('')}
              className="absolute right-20 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              aria-label="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            id="search-submit-btn"
            type="submit"
            disabled={isLoading || !inputLogin.trim()}
            className="absolute right-2 top-2 bottom-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Go</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error Presentation Card (Mandatory Requirement V.1: Handle all cases of errors) */}
      {error && (
        <div 
          id="search-error-card"
          className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 shadow-xs text-rose-900 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-600 shrink-0">
              {error.code === 'NETWORK_ERROR' ? (
                <WifiOff className="w-5 h-5" />
              ) : error.code === 'USER_NOT_FOUND' ? (
                <ShieldAlert className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-900 mb-0.5">
                {error.code === 'USER_NOT_FOUND' ? 'Student Not Found (404)' : 'Search Failed'}
              </h4>
              <p className="text-xs text-rose-700 leading-relaxed">
                {error.message}
              </p>
              {error.code === 'USER_NOT_FOUND' && (
                <div className="mt-2 text-[11px] text-rose-600">
                  Tip: Verify spelling or try one of the suggested 42 profiles below.
                </div>
              )}
            </div>
            <button
              onClick={onClearError}
              className="p-1 rounded-lg text-rose-500 hover:text-rose-800 hover:bg-rose-100 transition-colors cursor-pointer"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Suggested Profiles */}
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Quick 42 Profiles</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { login: 'ykuru', label: 'ykuru (Istanbul Cadet)', tag: 'Lvl 10.42' },
            { login: 'norminet', label: 'norminet (Official Mascot)', tag: 'Lvl 21.0' },
            { login: 'marvin', label: 'marvin (42 AI Bot)', tag: 'Lvl 16.42' },
          ].map((item) => (
            <button
              key={item.login}
              id={`quick-profile-${item.login}`}
              type="button"
              onClick={() => handleChipClick(item.login)}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-400 text-xs text-slate-700 transition-all cursor-pointer group shadow-xs"
            >
              <span className="font-mono font-bold text-slate-900 group-hover:text-blue-600">
                {item.login}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono border border-blue-100">
                {item.tag}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Search History */}
      {history.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            <span className="flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-slate-400" />
              Recent Searches
            </span>
            <button
              id="clear-search-history-btn"
              type="button"
              onClick={onClearHistory}
              className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors cursor-pointer normal-case font-medium"
            >
              Clear
            </button>
          </div>
          <div className="space-y-2">
            {history.slice(0, 4).map((item) => (
              <button
                key={item.login + item.timestamp}
                type="button"
                onClick={() => onSelectHistory(item.login)}
                disabled={isLoading}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-left transition-all cursor-pointer group shadow-xs"
              >
                <div className="flex items-center gap-3">
                  {item.avatar ? (
                    <img
                      src={item.avatar}
                      alt={item.login}
                      className="w-7 h-7 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-mono text-xs text-blue-600 font-bold border border-slate-200">
                      {item.login.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 font-mono">
                      {item.login}
                    </span>
                    <span className="text-[11px] text-slate-500 ml-2">
                      {item.displayName}
                    </span>
                  </div>
                </div>
                {item.level !== undefined && (
                  <span className="text-xs font-mono font-bold text-blue-600">
                    lvl {item.level.toFixed(2)}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Peer Evaluation Helper: Test Error States button */}
      <div className="mt-auto pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
          <span>Subject Evaluation Tester:</span>
        </div>
        <div className="flex gap-2">
          <button
            id="simulate-404-btn"
            type="button"
            onClick={() => onSearch('error_404')}
            className="flex-1 py-1.5 px-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-rose-600 hover:text-rose-700 transition-colors cursor-pointer text-center shadow-xs"
          >
            Test 404 User Not Found
          </button>
          <button
            id="simulate-network-error-btn"
            type="button"
            onClick={() => onSearch('error_network')}
            className="flex-1 py-1.5 px-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-amber-700 hover:text-amber-800 transition-colors cursor-pointer text-center shadow-xs"
          >
            Test Network Error
          </button>
        </div>
      </div>
    </div>
  );
};
