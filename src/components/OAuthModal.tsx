import React, { useState } from 'react';
import { ApiStatus } from '../types';
import { ShieldCheck, RefreshCw, Key, Zap, CheckCircle2, AlertCircle, X, ExternalLink } from 'lucide-react';

interface OAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: ApiStatus | null;
  onRefreshStatus: () => void;
}

export const OAuthModal: React.FC<OAuthModalProps> = ({
  isOpen,
  onClose,
  status,
  onRefreshStatus,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleForceRefreshToken = async () => {
    setIsRefreshing(true);
    setRefreshMessage(null);
    try {
      const res = await fetch('/api/token/refresh', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setRefreshMessage(`Token refreshed successfully! Valid for ${data.expiresInSeconds}s`);
        onRefreshStatus();
      } else {
        setRefreshMessage(`Error: ${data.error || 'Failed to refresh'}`);
      }
    } catch (err: any) {
      setRefreshMessage(`Network error: ${err.message}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="oauth-diagnostics-modal"
        className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl p-6 text-slate-900 overflow-hidden"
      >
        {/* Close Button */}
        <button
          id="close-oauth-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">42 OAuth2 & Token Cache Status</h3>
            <p className="text-xs text-slate-500">Compliance with 42 subject V.1 and Bonus V.2</p>
          </div>
        </div>

        {/* Subject Requirements Checklist */}
        <div className="space-y-3 mb-5 bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="flex items-start gap-2.5 text-xs text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong className="text-slate-900">Mandatory V.1 (No token per query):</strong> In-memory token cache prevents repeated OAuth requests; consecutive queries reuse the stored access token.
            </span>
          </div>
          <div className="flex items-start gap-2.5 text-xs text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong className="text-slate-900">Bonus V.2 (Token Auto-Refresh):</strong> Recreates token upon expiration buffer (&lt;60s) or automatic 401 retry recovery.
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200">
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-blue-600" />
              Credentials Mode
            </span>
            <div className="mt-1 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${status?.hasCredentials ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="text-sm font-semibold text-slate-900">
                {status?.hasCredentials ? 'Live 42 API' : 'Demo / Offline'}
              </span>
            </div>
          </div>

          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200">
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Token Reused
            </span>
            <div className="mt-1">
              <span className="text-lg font-bold font-mono text-blue-600">
                {status?.tokenReuseCount ?? 0}
              </span>
              <span className="text-xs text-slate-500 ml-1">times</span>
            </div>
          </div>

          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200 col-span-2">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
              <span>Token Expiry Countdown</span>
              <span className="text-slate-700 font-mono font-semibold">
                {status?.tokenExpiresInSeconds ? `${Math.floor(status.tokenExpiresInSeconds / 60)}m ${status.tokenExpiresInSeconds % 60}s` : 'N/A'}
              </span>
            </div>
            {status?.hasToken ? (
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, Math.max(0, ((status.tokenExpiresInSeconds || 0) / 7200) * 100))}%` }}
                />
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No active token currently stored (acquired on first request).</p>
            )}
          </div>
        </div>

        {/* Action Button: Force Refresh (Bonus tester) */}
        {status?.hasCredentials && (
          <div className="mb-4">
            <button
              id="force-refresh-token-btn"
              onClick={handleForceRefreshToken}
              disabled={isRefreshing}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing Token...' : 'Test Token Refresh (Bonus Demonstration)'}
            </button>
            {refreshMessage && (
              <p className="text-xs text-center mt-2 text-blue-600 font-medium">{refreshMessage}</p>
            )}
          </div>
        )}

        {/* Credentials instructions */}
        {!status?.hasCredentials && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900">
            <div className="flex items-center gap-2 font-bold mb-1 text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              Live 42 API Credentials Not Set
            </div>
            <p className="text-amber-800 leading-relaxed mb-2">
              The app is fully functional in Demo / Offline mode with realistic 42 profiles. To connect to live 42 Intra, add <code className="bg-white border border-amber-200 px-1 py-0.5 rounded text-amber-900 font-mono font-bold">FORTY_TWO_UID</code> and <code className="bg-white border border-amber-200 px-1 py-0.5 rounded text-amber-900 font-mono font-bold">FORTY_TWO_SECRET</code> to your <code className="bg-white border border-amber-200 px-1 py-0.5 rounded text-amber-900 font-mono font-bold">.env</code> file.
            </p>
            <a
              href="https://profile.intra.42.fr/oauth/applications"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline font-semibold"
            >
              Register Application on 42 Intra <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
