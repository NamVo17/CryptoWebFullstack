const express = require("express");
const axios = require("axios");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret_change_me";
const REFRESH_SECRET =
  process.env.REFRESH_SECRET || "dev_refresh_secret_change_me";

// Basic security & parsers
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// CORS configuration
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);

// Rate limiters
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
const strictLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

// In-memory user store
const users = new Map(); // key: email -> { id, email, name, passwordHash, balance }
const refreshTokens = new Map(); // key: refreshToken -> userId

// Initialize default user balances - simple version with just USDT
const initializeUserBalance = () => {
  return {
    usdt: 1000,
    btc: 0,
    eth: 0,
  };
};
// Helpers
const issueTokens = (user) => {
  const accessToken = jwt.sign(
    { 
      sub: user.id, 
      email: user.email, 
      name: user.name,
      balance: user.balance
    },
    JWT_SECRET,
    {
      expiresIn: "15m",
    }
  );
  const refreshToken = jwt.sign({ sub: user.id }, REFRESH_SECRET, {
    expiresIn: "7d",
  });
  refreshTokens.set(refreshToken, user.id);
  return { accessToken, refreshToken };
};

const setRefreshCookie = (res, token) => {
  res.cookie("refresh_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/auth/refresh",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// Password validation helper
const validatePassword = (password) => {
  if (password.length < 6) {
    return { isValid: false, message: "Mật khẩu phải có ít nhất 6 ký tự" };
  }
  return { isValid: true };
};

// Auth routes
app.post("/auth/register", strictLimiter, async (req, res) => {
  try {

    const { email, password, name } = req.body || {};


    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Email không hợp lệ",
      });
    }

    // Password validation
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message,
      });
    }

    if (users.has(email)) {
      return res.status(409).json({
        success: false,
        message: "Email đã được đăng ký",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const id = `${Date.now()}`;

    // Initialize default balance for new user
    const balance = {
      usdt: 1000,
      btc: 0,
      eth: 0
    };


    // Create user object with balance
    // Create user object with balance
    const newUser = { id, email, name, passwordHash, balance };
    
    users.set(email, newUser);

    // Response object với đầy đủ thông tin user bao gồm balance
    const userResponse = {
      id,
      email,
      name,
      balance: {
        usdt: 1000,
        btc: 0,
        eth: 0
      }
    };
    

    const { accessToken, refreshToken } = issueTokens(newUser);
    setRefreshCookie(res, refreshToken);

    

    const response = {
      success: true,
      message: "Đăng ký tài khoản thành công!",
      user: {
        id: userResponse.id,
        email: userResponse.email,
        name: userResponse.name,
        balance: {
          usdt: 1000,
          btc: 0,
          eth: 0
        }
      },
      accessToken
    };

    
    return res.status(201).json(response);
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({
      success: false,
      message: "Đăng ký thất bại, vui lòng thử lại",
    });
  }
});

app.post("/auth/login", authLimiter, async (req, res) => {
  try {
   

    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập email và mật khẩu",
      });
    }

    const user = users.get(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    // Always ensure user has valid balance
    if (!user.balance) {
      user.balance = initializeUserBalance();
      users.set(email, user);

    }
    // Ensure user has a balance (for users created before this change)
    if (!user.balance) {
      user.balance = initializeUserBalance();
      users.set(email, user); // persist updated user in memory

    }

    const { accessToken, refreshToken } = issueTokens(user);
    setRefreshCookie(res, refreshToken);

    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      balance: user.balance || {
        usdt: 1000,
        btc: 0,
        eth: 0
      }
    };
    


    // Prepare and log complete response
    const response = {
      success: true,
      message: "Đăng nhập thành công!",
      user: userResponse,
      accessToken,
    };



    return res.json(response);
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      success: false,
      message: "Đăng nhập thất bại, vui lòng thử lại",
    });
  }
});

app.post("/auth/refresh", authLimiter, (req, res) => {
  try {
    const token = req.cookies?.refresh_token;
    if (!token || !refreshTokens.has(token)) {
      return res.status(401).json({ message: "No refresh token" });
    }
    const payload = jwt.verify(token, REFRESH_SECRET);
    const userId = refreshTokens.get(token);
    if (!userId || payload.sub !== userId) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }
    // Rotate refresh token
    refreshTokens.delete(token);
    const user = Array.from(users.values()).find((u) => u.id === userId);
    if (!user) return res.status(401).json({ message: "User not found" });
    // Ensure user always has a balance before issuing tokens
    if (!user.balance) {
      user.balance = initializeUserBalance();
      // update map (keyed by email)
      users.set(user.email, user);

    }

    const { accessToken, refreshToken } = issueTokens(user);
    setRefreshCookie(res, refreshToken);

    return res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        balance: user.balance,
      },
    });
  } catch (err) {
    return res.status(401).json({ message: "Refresh failed" });
  }
});

app.post("/auth/logout", (req, res) => {
  const token = req.cookies?.refresh_token;
  if (token) refreshTokens.delete(token);
  res.clearCookie("refresh_token", { path: "/auth/refresh" });
  return res.json({ message: "Logged out" });
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// Get user balance
app.get("/api/user/balance", authenticateToken, (req, res) => {
  try {
    const user = Array.from(users.values()).find((u) => u.id === req.user.sub);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      success: true,
      balance: user.balance,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

// Update user balance (for trading)
app.post("/api/user/trade", authenticateToken, (req, res) => {
  try {
    const { coinSymbol, quantity, price, tradeType } = req.body;

    if (!coinSymbol || !quantity || !price || !tradeType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = Array.from(users.values()).find((u) => u.id === req.user.sub);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const symbol = coinSymbol.toLowerCase();
    const qty = parseFloat(quantity);
    const cost = parseFloat(price) * qty;

    if (tradeType === "buy") {
      // Check if user has enough USDT
      if (user.balance.usdt < cost) {
        return res.status(400).json({ message: "Insufficient USDT balance" });
      }

      // Update balances
      user.balance.usdt -= cost;
      user.balance[symbol] = (user.balance[symbol] || 0) + qty;
    } else if (tradeType === "sell") {
      // Check if user has enough coin
      if (!user.balance[symbol] || user.balance[symbol] < qty) {
        return res
          .status(400)
          .json({ message: `Insufficient ${coinSymbol} balance` });
      }

      // Update balances
      user.balance[symbol] -= qty;
      user.balance.usdt += cost;
    }

    return res.json({
      success: true,
      message: `${
        tradeType === "buy" ? "Buy" : "Sell"
      } order executed successfully`,
      balance: user.balance,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

// Proxy to CoinGecko (unauthenticated)
app.use("/api", async (req, res) => {
  const url = `https://api.coingecko.com/api${req.originalUrl.replace(
    "/api",
    ""
  )}`;
  try {
    const response = await axios.get(url, {
      headers: { Accept: "application/json" },
    });
    res.json(response.data);
  } catch (err) {
    res
      .status(err.response?.status || 500)
      .json({ error: "API error", detail: err.message });
  }
});

app.listen(PORT, () => {
});
