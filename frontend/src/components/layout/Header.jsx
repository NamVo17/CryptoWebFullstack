"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import {
  Sun,
  Moon,
  Home,
  TrendingUp,
  Briefcase,
  Newspaper,
  Menu,
  X,
  Bell,
  User,
  LogIn,
  Globe,
} from "lucide-react";
import { toggleTheme, toggleLanguage } from "../../store/slices/settingsSlice";
import { logout } from "../../store/slices/userSlice";
import LoginModal from "../features/auth/LoginModal";
import RegisterModal from "../features/auth/RegisterModal";
import { translations } from "../../utils/formatters/translations";

export default function Header({ 
  isLoginOpen = false,
  onLoginOpenChange,
  isRegisterOpen = false,
  onRegisterOpenChange 
}) {
  const dispatch = useDispatch();
  const location = useLocation();
  const { theme, language } = useSelector((state) => state.settings);
  const { user, isAuthenticated, balance, accessToken } = useSelector((state) => state.user);
  const { priceAlerts } = useSelector((state) => state.crypto);

  // Check if user is truly authenticated
  const isUserAuthenticated = isAuthenticated && user && accessToken;

  // Debug authentication state
  useEffect(() => {
    console.log('Auth state:', {
      isAuthenticated,
      hasUser: !!user,
      hasToken: !!accessToken,
      balance
    });
  }, [isAuthenticated, user, accessToken, balance]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLocalLoginOpen, setIsLocalLoginOpen] = useState(isLoginOpen);
  const [isLocalRegisterOpen, setIsLocalRegisterOpen] = useState(isRegisterOpen);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  // Sync local state with props
  useEffect(() => {
    setIsLocalLoginOpen(isLoginOpen);
  }, [isLoginOpen]);

  useEffect(() => {
    setIsLocalRegisterOpen(isRegisterOpen);
  }, [isRegisterOpen]);
  
  const handleLoginClick = () => {
    if (onLoginOpenChange) {
      onLoginOpenChange(true);
    }
    setIsLocalLoginOpen(true);
  };

  const handleRegisterClick = () => {
    if (onRegisterOpenChange) {
      onRegisterOpenChange(true);
    }
    setIsLocalRegisterOpen(true);
  };

  const handleLoginClose = () => {
    if (onLoginOpenChange) {
      onLoginOpenChange(false);
    }
    setIsLocalLoginOpen(false);
  };

  const handleRegisterClose = () => {
    if (onRegisterOpenChange) {
      onRegisterOpenChange(false);
    }
    setIsLocalRegisterOpen(false);
  };

  const switchToRegister = () => {
    handleLoginClose();
    handleRegisterClick();
  };

  const switchToLogin = () => {
    handleRegisterClose();
    handleLoginClick();
  };

  const t = translations[language];
  const activeAlerts = priceAlerts.filter((alert) => alert.active).length;

  const handleLogout = async () => {
    try {
      // Call logout endpoint
      const API_BASE = process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_BASE || "http://localhost:4000";
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always dispatch logout action to clear local state
      dispatch(logout());
      setIsMenuOpen(false);
    }
  };

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isLanguageMenuOpen && !event.target.closest('.language-toggle')) {
        setIsLanguageMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isLanguageMenuOpen]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.user-menu')) {
        setIsMenuOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className="bg-white dark:bg-dark-100 border-b border-gray-200 dark:border-dark-300 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-crypto-blue to-crypto-purple rounded-xl flex items-center justify-center">
                  <TrendingUp size={20} className="text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  CryptoHub
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/"
                className={`flex items-center space-x-1 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  location.pathname === "/"
                    ? "text-crypto-blue bg-crypto-blue/10"
                    : "text-gray-700 dark:text-gray-300 hover:text-crypto-blue dark:hover:text-crypto-blue"
                }`}
              >
                <Home size={16} />
                <span>{t.home}</span>
              </Link>
              <Link
                to="/market"
                className={`flex items-center space-x-1 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  location.pathname === "/market"
                    ? "text-crypto-blue bg-crypto-blue/10"
                    : "text-gray-700 dark:text-gray-300 hover:text-crypto-blue dark:hover:text-crypto-blue"
                }`}
              >
                <TrendingUp size={16} />
                <span>{t.markets}</span>
              </Link>
              <Link
                to="/portfolio"
                className={`flex items-center space-x-1 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  location.pathname === "/portfolio"
                    ? "text-crypto-blue bg-crypto-blue/10"
                    : "text-gray-700 dark:text-gray-300 hover:text-crypto-blue dark:hover:text-crypto-blue"
                }`}
              >
                <Briefcase size={16} />
                <span>{t.portfolio}</span>
              </Link>
              <Link
                to="/news"
                className={`flex items-center space-x-1 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  location.pathname === "/news"
                    ? "text-crypto-blue bg-crypto-blue/10"
                    : "text-gray-700 dark:text-gray-300 hover:text-crypto-blue dark:hover:text-crypto-blue"
                }`}
              >
                <Newspaper size={16} />
                <span>{t.news}</span>
              </Link>

              {/* Language Toggle */}
              <div className="relative language-toggle">
                <button 
                  onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white  text-gray-700 dark:text-gray-300 dark:bg-dark-100
                   transition-colors cursor-pointer hover:text-blue-500 dark:hover:text-blue-500 "
                >
                  <Globe className="w-5 h-5 " />
                </button>
                
                {/* Language Dropdown */}
                {isLanguageMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-100 rounded-xl shadow-lg border border-gray-200 dark:border-dark-300 py-2 z-50">
                    <div 
                      onClick={() => {
                        dispatch(toggleLanguage('vi'));
                        setIsLanguageMenuOpen(false);
                      }}
                      className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200 cursor-pointer"
                    >
                      <span>🇻🇳 Tiếng Việt</span>
                      {language === 'vi' && <span className="text-crypto-blue">✓</span>}
                    </div>
                    <div 
                      onClick={() => {
                        dispatch(toggleLanguage('en'));
                        setIsLanguageMenuOpen(false);
                      }}
                      className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200 cursor-pointer"
                    >
                      <span>🇺🇸 English</span>
                      {language === 'en' && <span className="text-crypto-blue">✓</span>}
                    </div>
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={() => dispatch(toggleTheme())}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-dark-100 text-gray-700 dark:text-gray-300 
                hover:text-blue-500 dark:hover:text-blue-500 transition-colors cursor-pointer"
                title={theme === "light" ? t.darkMode : t.lightMode}
              >
                {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
              </button>

              {/* User Actions */}
              <div className="flex space-x-2">
                {isAuthenticated ? (
                  <div className="relative user-menu">
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="bg-gray-100 dark:bg-dark-200 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-300 rounded-lg px-4 py-2 text-sm font-medium  \
                      dark:hover:text-crypto-blue hover:text-crypto-blue cursor-pointer whitespace-nowrap"
                    >
                      {user?.name}
                    </button>
                    {isMenuOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-dark-100 rounded-xl shadow-lg border border-gray-200 dark:border-dark-300 py-2">
                        {/* User Info */}
                        <div className="px-4 py-2 border-b border-gray-200 dark:border-dark-300">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user?.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {user?.email}
                          </div>
                        </div>
                        
                        {/* Balance Info */}
                        <div className="px-4 py-2 border-b border-gray-200 dark:border-dark-300">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {t.availableBalance || "Số dư khả dụng"}
                          </div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            ${(user?.balance?.usdt || balance?.usdt || 0).toLocaleString()} USDT
                          </div>
                        </div>
                        
                        {/* Menu Items */}
                        <a
                          href="#"
                          onClick={() => setIsMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200"
                        >
                          {t.profile}
                        </a>
                        <a
                          href="#"
                          onClick={() => setIsMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200"
                        >
                          {t.settings}
                        </a>
                        <hr className="my-2 border-gray-200 dark:border-dark-300" />
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200"
                        >
                          {t.logout}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <button
                      aria-label="open-login"
                      onClick={handleLoginClick}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-crypto-blue hover:bg-gray-100 dark:hover:bg-dark-200 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap"
                    >
                      {t.login}
                    </button>
                    <button
                      onClick={handleRegisterClick}
                      className="px-4 py-2 bg-crypto-blue hover:bg-crypto-blue/90 text-white text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      {t.register}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden flex items-center space-x-2">
              <div className="relative">
                <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-dark-200 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-300 transition-colors cursor-pointer">
                  <span className="text-lg">🇻🇳</span>
                </button>
              </div>
              <button
                onClick={() => dispatch(toggleTheme())}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-dark-200 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-300 transition-colors cursor-pointer"
              >
                {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-dark-200 text-gray-700 dark:text-gray-300 cursor-pointer user-menu"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 dark:border-dark-300">
              <nav className="flex flex-col space-y-2">
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="py-2 text-gray-700 dark:text-gray-300 hover:text-crypto-blue dark:hover:text-crypto-blue"
                >
                  {t.home}
                </Link>
                <Link
                  to="/market"
                  onClick={() => setIsMenuOpen(false)}
                  className="py-2 text-gray-700 dark:text-gray-300 hover:text-crypto-blue dark:hover:text-crypto-blue"
                >
                  {t.markets}
                </Link>
                <Link
                  to="/portfolio"
                  onClick={() => setIsMenuOpen(false)}
                  className="py-2 text-gray-700 dark:text-gray-300 hover:text-crypto-blue dark:hover:text-crypto-blue"
                >
                  {t.portfolio}
                </Link>
                <Link
                  to="/news"
                  onClick={() => setIsMenuOpen(false)}
                  className="py-2 text-gray-700 dark:text-gray-300 hover:text-crypto-blue dark:hover:text-crypto-blue"
                >
                  {t.news}
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      <LoginModal
        isOpen={isLocalLoginOpen}
        onClose={handleLoginClose}
        onSwitchToRegister={switchToRegister}
      />
      <RegisterModal
        isOpen={isLocalRegisterOpen}
        onClose={handleRegisterClose}
        onSwitchToLogin={switchToLogin}
      />
    </>
  );
}
