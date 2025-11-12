"use client";

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import {
  Sun,
  Moon,
  Home,
  TrendingUp,
  Briefcase,
  Newspaper,
  X,
  Globe,
  LogIn,
  UserPlus,
} from "lucide-react";
import { toggleTheme, toggleLanguage } from "../../store/slices/settingsSlice";
import { translations } from "../../utils/formatters/translations";

export default function VerticalNav({
  isOpen,
  onClose,
  onLoginClick,
  onRegisterClick,
  onLogout,
  isAuthenticated,
  user,
  balance,
}) {
  const dispatch = useDispatch();
  const location = useLocation();
  const { theme, language } = useSelector((state) => state.settings);
  const t = translations[language];
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  // Navigation links
  const navLinks = [
    { to: "/", label: t.home, icon: Home },
    { to: "/market", label: t.markets, icon: TrendingUp },
    { to: "/portfolio", label: t.portfolio, icon: Briefcase },
    { to: "/news", label: t.news, icon: Newspaper },
  ];

  const handleNavClick = (e) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden lg:hidden"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        />
      )}

      {/* Vertical Navigation */}
      <nav
  className={`fixed right-0 top-16 h-[calc(100vh-64px)] w-64
  bg-white dark:bg-dark-100
  border-l border-gray-200 dark:border-dark-300
  transform transition-transform duration-300 ease-in-out z-50
  lg:hidden
  ${isOpen ? "translate-x-0" : "translate-x-full"}`}
>

        <div className="flex flex-col h-full overflow-y-auto">
          {/* Close Button */}
          <div className="flex items-center justify-center p-4 border-b border-gray-200 dark:border-dark-300">
            <span className="text-2xl font-semibold text-gray-900 dark:text-white">
              {t.menu || "Menu"}
            </span>

          </div>

          {/* Navigation Links */}
          <div className="md:hidden flex-1 overflow-y-auto">
            <div className="space-y-1 p-4">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={handleNavClick}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === to
                      ? "bg-crypto-blue/10 text-crypto-blue"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200"
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* User Section */}
          <div className="border-t border-gray-200 dark:border-dark-300 p-4 space-y-3">
            {/* User Info if Authenticated */}
            {isAuthenticated && user && (
              <div className="bg-gray-50 dark:bg-dark-200 rounded-lg p-3">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </div>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {t.availableBalance || "Số dư khả dụng"}
                </div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  ${(user?.balance?.usdt || balance?.usdt || 0).toLocaleString()} USDT
                </div>
              </div>
            )}

            {/* Language Selection */}
            <div className="relative language-menu-container">
              <button
                onClick={() => {
                  setIsLanguageMenuOpen(!isLanguageMenuOpen);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gray-100 dark:bg-dark-200 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-300 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Globe size={18} />
                  <span className="text-sm font-medium">
                    {language === "vi" ? "🇻🇳" : "🇺🇸"} {language === "vi" ? "Tiếng Việt" : "English"}
                  </span>
                </div>
              </button>
              {isLanguageMenuOpen && (
                <div 
                  className="absolute  bottom-full mb-2 left-0 right-0  bg-white dark:bg-dark-100 rounded-lg shadow-lg border border-gray-200 dark:border-dark-300 py-2 z-50"
                >
                  <button
                    onClick={() => {
                      dispatch(toggleLanguage("vi"));
                      setIsLanguageMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors"
                  >
                    <span>🇻🇳 Tiếng Việt</span>
                    {language === "vi" && (
                      <span className="text-crypto-blue font-semibold">✓</span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      dispatch(toggleLanguage("en"));
                      setIsLanguageMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors"
                  >
                    <span>🇺🇸 English</span>
                    {language === "en" && (
                      <span className="text-crypto-blue font-semibold">✓</span>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-dark-200 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-300 transition-colors font-medium"
            >
              {theme === "light" ? (
                <>
                  <Moon size={18} />
                  <span className="text-sm">{t.darkMode || "Dark Mode"}</span>
                </>
              ) : (
                <>
                  <Sun size={18} />
                  <span className="text-sm">{t.lightMode || "Light Mode"}</span>
                </>
              )}
            </button>

            {/* Auth Buttons */}
            {!isAuthenticated ? (
              <div className="space-y-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLoginClick();
                    onClose();
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-crypto-blue border border-crypto-blue rounded-lg hover:bg-crypto-blue/5 transition-colors"
                >
                  <LogIn size={18} />
                  <span>{t.login}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRegisterClick();
                    onClose();
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-crypto-blue rounded-lg hover:bg-crypto-blue/90 transition-colors"
                >
                  <UserPlus size={18} />
                  <span>{t.register}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLogout();
                  onClose();
                }}
                className="w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-dark-200 rounded-lg transition-colors"
              >
                {t.logout}
              </button>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
