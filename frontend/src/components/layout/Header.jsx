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
import VerticalNav from "./VerticalNav";
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
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  // Use props or local state for login/register modals
  const [localLoginOpen, setLocalLoginOpen] = useState(isLoginOpen);
  const [localRegisterOpen, setLocalRegisterOpen] = useState(isRegisterOpen);

  // Determine which state to use - props if available, otherwise local
  const isLocalLoginOpen = onLoginOpenChange ? isLoginOpen : localLoginOpen;
  const isLocalRegisterOpen = onRegisterOpenChange ? isRegisterOpen : localRegisterOpen;

  // Helper function to set login state
  const setIsLocalLoginOpen = (value) => {
    if (onLoginOpenChange) {
      onLoginOpenChange(value);
    } else {
      setLocalLoginOpen(value);
    }
  };

  // Helper function to set register state
  const setIsLocalRegisterOpen = (value) => {
    if (onRegisterOpenChange) {
      onRegisterOpenChange(value);
    } else {
      setLocalRegisterOpen(value);
    }
  };

  const handleLoginClick = () => {
    setIsLocalLoginOpen(true);
  };

  const handleRegisterClick = () => {
    setIsLocalRegisterOpen(true);
  };

  const handleLoginClose = () => {
    setIsLocalLoginOpen(false);
  };

  const handleRegisterClose = () => {
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
      // Don't close menu if clicking on menu button or inside menu area or vertical nav
      if (isMenuOpen && !event.target.closest('.user-menu') && !event.target.closest('a') && !event.target.closest('.mobile-user-actions') && !event.target.closest('nav')) {
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
            <div className="flex items-center mr-2">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-14 h-14 bg-gradient-to-r  rounded-xl flex items-center justify-center overflow-hidden">
                  <img
                    src="/iconweb.png"
                    alt="Web Icon"
                    className="w-14 h-14 object-contain"
                  />
                </div>
                <span className="font-playfair text-2xl font-bold text-gray-900 dark:text-white">
                  VIETNAMCoin
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className=" hidden md:flex items-center space-x-2">
              <Link
                to="/"
                className={`flex items-center space-x-1 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${location.pathname === "/"
                  ? "text-crypto-blue bg-crypto-blue/10"
                  : "text-gray-700 dark:text-gray-300 hover:text-crypto-blue dark:hover:text-crypto-blue"
                  }`}
              >
                <Home size={16} />
                <span>{t.home}</span>
              </Link>
              <Link
                to="/market"
                className={`flex items-center space-x-1 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${location.pathname === "/market"
                  ? "text-crypto-blue bg-crypto-blue/10"
                  : "text-gray-700 dark:text-gray-300 hover:text-crypto-blue dark:hover:text-crypto-blue"
                  }`}
              >
                <TrendingUp size={16} />
                <span>{t.markets}</span>
              </Link>
              <Link
                to="/portfolio"
                className={`flex items-center space-x-1 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${location.pathname === "/portfolio"
                  ? "text-crypto-blue bg-crypto-blue/10"
                  : "text-gray-700 dark:text-gray-300 hover:text-crypto-blue dark:hover:text-crypto-blue"
                  }`}
              >
                <Briefcase size={16} />
                <span>{t.portfolio}</span>
              </Link>
              <Link
                to="/news"
                className={`flex items-center space-x-1 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${location.pathname === "/news"
                  ? "text-crypto-blue bg-crypto-blue/10"
                  : "text-gray-700 dark:text-gray-300 hover:text-crypto-blue dark:hover:text-crypto-blue"
                  }`}
              >
                <Newspaper size={16} />
                <span>{t.news}</span>
              </Link>

              {/* Language Toggle */}
              <div className=" hidden lg:block relative language-toggle">
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
                className="hidden lg:flex w-10 h-10  items-center justify-center rounded-xl bg-white dark:bg-dark-100 text-gray-700 dark:text-gray-300 
                hover:text-blue-500 dark:hover:text-blue-500 transition-colors cursor-pointer"
                title={theme === "light" ? t.darkMode : t.lightMode}
              >
                {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
              </button>

              {/* User Actions */}
              <div className="  space-x-1 hidden lg:flex">
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
                      className=" px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-crypto-blue hover:bg-gray-100 dark:hover:bg-dark-200 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap"
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
            <div className="lg:hidden flex items-center space-x-2">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-dark-200 text-gray-700 dark:text-gray-300 cursor-pointer user-menu"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>
       {/* Vertical Navigation Sidebar */}
      <VerticalNav
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onLoginClick={handleLoginClick}
        onRegisterClick={handleRegisterClick}
        onLogout={handleLogout}
        isAuthenticated={isUserAuthenticated}
        user={user}
        balance={balance}
      />   
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
