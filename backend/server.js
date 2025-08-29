const express = require('express');
const axios = require('axios');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'dev_refresh_secret_change_me';

// Basic security & parsers
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "https://crypto-web-fullstack.vercel.app", credentials: true }));

// Rate limiters
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
const strictLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

// In-memory user store (replace with DB in production)
const users = new Map(); // key: email -> { id, email, name, passwordHash }
const refreshTokens = new Map(); // key: refreshToken -> userId

// Helpers
const issueTokens = (user) => {
  const accessToken = jwt.sign({ sub: user.id, email: user.email, name: user.name }, JWT_SECRET, {
    expiresIn: '15m',
  });
  const refreshToken = jwt.sign({ sub: user.id }, REFRESH_SECRET, { expiresIn: '7d' });
  refreshTokens.set(refreshToken, user.id);
  return { accessToken, refreshToken };
};

const setRefreshCookie = (res, token) => {
  res.cookie('refresh_token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/auth/refresh',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// Auth routes
app.post('/auth/register', strictLimiter, async (req, res) => {
  try {
    const { email, password, name } = req.body || {};
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (users.has(email)) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const id = `${Date.now()}`;
    const user = { id, email, name, passwordHash };
    users.set(email, user);
    const { accessToken, refreshToken } = issueTokens(user);
    setRefreshCookie(res, refreshToken);
    return res.status(201).json({ user: { id, email, name }, accessToken });
  } catch (err) {
    return res.status(500).json({ message: 'Registration failed' });
  }
});

app.post('/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const user = users.get(email);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const { accessToken, refreshToken } = issueTokens(user);
    setRefreshCookie(res, refreshToken);
    return res.json({ user: { id: user.id, email: user.email, name: user.name }, accessToken });
  } catch (err) {
    return res.status(500).json({ message: 'Login failed' });
  }
});

app.post('/auth/refresh', authLimiter, (req, res) => {
  try {
    const token = req.cookies?.refresh_token;
    if (!token || !refreshTokens.has(token)) {
      return res.status(401).json({ message: 'No refresh token' });
    }
    const payload = jwt.verify(token, REFRESH_SECRET);
    const userId = refreshTokens.get(token);
    if (!userId || payload.sub !== userId) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    // Rotate refresh token
    refreshTokens.delete(token);
    const user = Array.from(users.values()).find(u => u.id === userId);
    if (!user) return res.status(401).json({ message: 'User not found' });
    const { accessToken, refreshToken } = issueTokens(user);
    setRefreshCookie(res, refreshToken);
    return res.json({ accessToken });
  } catch (err) {
    return res.status(401).json({ message: 'Refresh failed' });
  }
});

app.post('/auth/logout', (req, res) => {
  const token = req.cookies?.refresh_token;
  if (token) refreshTokens.delete(token);
  res.clearCookie('refresh_token', { path: '/auth/refresh' });
  return res.json({ message: 'Logged out' });
});

// Proxy to CoinGecko (unauthenticated)
app.use('/api', async (req, res) => {
  const url = `https://api.coingecko.com/api${req.originalUrl.replace('/api', '')}`;
  try {
    const response = await axios.get(url, { headers: { Accept: 'application/json' } });
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: 'API error', detail: err.message });
  }
});

// Start HTTP and optionally HTTPS if certs provided
app.listen(PORT, () => console.log(`HTTP server running on port ${PORT}`));

try {
  if (fs.existsSync('ssl/key.pem') && fs.existsSync('ssl/cert.pem')) {
    const key = fs.readFileSync('ssl/key.pem');
    const cert = fs.readFileSync('ssl/cert.pem');
    https.createServer({ key, cert }, app).listen(4443, () => {
      console.log('HTTPS server running on port 4443');
    });
  }
} catch {}
