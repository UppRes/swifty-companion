import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { MOCK_USERS, generateDynamicMockUser } from './src/mockData';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// --- 42 OAuth2 Token Cache (Mandatory + Bonus Requirement) ---
interface TokenCache {
  accessToken: string | null;
  expiresAt: number | null; // epoch ms
  reuseCount: number;
  lastRefreshedAt: string | null;
}

const tokenState: TokenCache = {
  accessToken: null,
  expiresAt: null,
  reuseCount: 0,
  lastRefreshedAt: null,
};

const getCredentials = () => {
  const uid = process.env.FORTY_TWO_UID || process.env.FORTY_TWO_CLIENT_ID || '';
  const secret = process.env.FORTY_TWO_SECRET || process.env.FORTY_TWO_CLIENT_SECRET || '';
  return { uid: uid.trim(), secret: secret.trim(), hasCredentials: Boolean(uid.trim() && secret.trim()) };
};

/**
 * Fetch a fresh OAuth2 token using 42 Client Credentials flow
 * POST https://api.intra.42.fr/oauth/token
 */
async function fetchNewToken(uid: string, secret: string): Promise<string> {
  const tokenEndpoint = 'https://api.intra.42.fr/oauth/token';

  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', uid);
  params.append('client_secret', secret);

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to acquire 42 token (${response.status}): ${errorText}`);
  }

  const data = await response.json() as { access_token: string; expires_in: number; token_type: string };
  const expiresInSeconds = data.expires_in || 7200;

  tokenState.accessToken = data.access_token;
  // Expire 60 seconds before official time to avoid edge-case in-flight expiry
  tokenState.expiresAt = Date.now() + (expiresInSeconds * 1000);
  tokenState.reuseCount = 0;
  tokenState.lastRefreshedAt = new Date().toISOString();

  console.log(`[42 OAuth2] Fresh token acquired. Expires in ${expiresInSeconds}s (${new Date(tokenState.expiresAt).toLocaleTimeString()})`);
  return data.access_token;
}

/**
 * Get valid token from cache or refresh if expired (Bonus requirement)
 * Do NOT create a token for each query!
 */
async function getOrRefreshToken(forceRefresh = false): Promise<string | null> {
  const { uid, secret, hasCredentials } = getCredentials();
  if (!hasCredentials) {
    return null;
  }

  const now = Date.now();
  // Buffer of 60 seconds
  const isExpired = !tokenState.expiresAt || (now >= (tokenState.expiresAt - 60000));

  if (!forceRefresh && tokenState.accessToken && !isExpired) {
    tokenState.reuseCount += 1;
    return tokenState.accessToken;
  }

  // Token missing or expired -> Recreate token at expiration date (Bonus V.2)
  console.log(`[42 OAuth2] Refreshing token. Reason: ${forceRefresh ? 'Forced' : isExpired ? 'Expired' : 'Initial acquisition'}`);
  return await fetchNewToken(uid, secret);
}

// --- API Endpoints ---

/**
 * GET /api/status - OAuth2 cache health and statistics
 */
app.get('/api/status', (req: Request, res: Response) => {
  const { hasCredentials } = getCredentials();
  const now = Date.now();
  const expiresInSeconds = tokenState.expiresAt && tokenState.expiresAt > now
    ? Math.round((tokenState.expiresAt - now) / 1000)
    : 0;

  res.json({
    hasCredentials,
    hasToken: Boolean(tokenState.accessToken),
    tokenExpiresInSeconds: expiresInSeconds,
    tokenExpiresAt: tokenState.expiresAt,
    tokenReuseCount: tokenState.reuseCount,
    lastRefreshedAt: tokenState.lastRefreshedAt,
    isDemoMode: !hasCredentials,
    environment: process.env.NODE_ENV || 'development',
  });
});

/**
 * POST /api/token/refresh - Explicitly force refresh token (Bonus verification)
 */
app.post('/api/token/refresh', async (req: Request, res: Response) => {
  const { hasCredentials, uid, secret } = getCredentials();
  if (!hasCredentials) {
    return res.status(400).json({ error: 'No 42 API credentials found in environment (.env)' });
  }

  try {
    const newToken = await fetchNewToken(uid, secret);
    res.json({
      success: true,
      message: 'OAuth2 token refreshed successfully',
      expiresInSeconds: tokenState.expiresAt ? Math.round((tokenState.expiresAt - Date.now()) / 1000) : 7200,
      tokenExpiresAt: tokenState.expiresAt,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Token refresh failed' });
  }
});

/**
 * GET /api/user/:login - Retrieve student profile by login
 * Handles: Login not found, Rate limit, Network errors, Token expiry & auto-refresh
 */
app.get('/api/user/:login', async (req: Request, res: Response) => {
  const rawLogin = req.params.login;
  const isDemoQuery = req.query.demo === 'true';

  if (!rawLogin || !rawLogin.trim()) {
    return res.status(400).json({
      code: 'EMPTY_LOGIN',
      error: 'Please enter a student login username.',
    });
  }

  const login = rawLogin.trim().toLowerCase();

  // Validate characters (letters, numbers, hyphens, underscores)
  if (!/^[a-zA-Z0-9_-]+$/.test(login)) {
    return res.status(400).json({
      code: 'INVALID_LOGIN_FORMAT',
      error: 'Login contains invalid characters. Use alphanumeric characters, hyphens or underscores.',
    });
  }

  const { hasCredentials } = getCredentials();

  // Fallback to Demo / Mock data if credentials are not configured or requested
  if (!hasCredentials || isDemoQuery) {
    if (login === 'error_404') {
      return res.status(404).json({
        code: 'USER_NOT_FOUND',
        error: `User "${login}" not found on 42 Network.`,
        login,
      });
    }
    if (login === 'error_network') {
      return res.status(503).json({
        code: 'NETWORK_ERROR',
        error: 'Network connection error: Failed to reach 42 API servers.',
      });
    }

    const mockProfile = MOCK_USERS[login] || generateDynamicMockUser(login);
    return res.json({
      ...mockProfile,
      isDemo: true,
      demoNotice: hasCredentials ? 'Viewing in Demo mode' : 'Running in Offline / Demo Mode (Set FORTY_TWO_UID and FORTY_TWO_SECRET in .env for live Intra)',
    });
  }

  // Real 42 API Call with OAuth2 Caching & Token Auto-Refresh
  let attempts = 0;
  while (attempts < 2) {
    attempts++;
    try {
      const token = await getOrRefreshToken(attempts > 1);
      if (!token) {
        throw new Error('No access token available');
      }

      const response = await fetch(`https://api.intra.42.fr/v2/users/${encodeURIComponent(login)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        return res.status(404).json({
          code: 'USER_NOT_FOUND',
          error: `User "${login}" does not exist on 42 intra.`,
          login,
        });
      }

      if (response.status === 429) {
        return res.status(429).json({
          code: 'RATE_LIMITED',
          error: '42 API Rate Limit exceeded (2 requests/second limit). Please wait a moment and retry.',
        });
      }

      if (response.status === 401 && attempts === 1) {
        // Token was revoked or expired remotely - auto refresh and retry! (Bonus V.2)
        console.warn('[42 OAuth2] Received 401 from Intra. Invalidating token and retrying...');
        tokenState.accessToken = null;
        tokenState.expiresAt = null;
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({
          code: 'API_ERROR',
          error: `42 API responded with error code ${response.status}: ${errorText}`,
        });
      }

      const userData = await response.json();
      return res.json({
        ...userData,
        isDemo: false,
      });
    } catch (err: any) {
      if (attempts >= 2) {
        console.error(`[42 API Error for ${login}]:`, err);
        return res.status(503).json({
          code: 'NETWORK_ERROR',
          error: `Network error reaching 42 Intra API: ${err.message}`,
        });
      }
    }
  }
});

// --- Server & Vite Startup ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Swifty Companion server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
