"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Mail, Lock, User, AlertCircle, CheckCircle } from "lucide-react";
import { loginStart, loginSuccess, loginFailure, registerSuccess } from "../store/userSlice";
import { translations } from "../utils/translations";

export default function LoginModal({ isOpen, onClose, onSwitchToRegister }) {
  const API_BASE = process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_BASE || "http://localhost:4000";
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.user);
  const { language } = useSelector((state) => state.settings);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const t = translations[language];

  // Validation functions
  const validateForm = () => {
    const newErrors = {};

    if (isLogin) {
      // Login validation
      if (!formData.email.trim()) {
        newErrors.email = "Vui lòng nhập email";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Email không hợp lệ";
      }

      if (!formData.password) {
        newErrors.password = "Vui lòng nhập mật khẩu";
      }
    } else {
      // Register validation
      if (!formData.fullName.trim()) {
        newErrors.fullName = "Vui lòng nhập họ và tên";
      } else if (formData.fullName.trim().length < 2) {
        newErrors.fullName = "Họ và tên phải có ít nhất 2 ký tự";
      }

      if (!formData.email.trim()) {
        newErrors.email = "Vui lòng nhập email";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Email không hợp lệ";
      }

      if (!formData.password) {
        newErrors.password = "Vui lòng nhập mật khẩu";
      } else if (formData.password.length < 6) {
        newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    dispatch(loginStart());
    setErrors({});

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : { email: formData.email, password: formData.password, name: formData.fullName };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Authentication failed");
      }
      
      // Success
      // Log the response data for debugging
      console.log('📥 Received response from server:', {
        success: data.success,
        message: data.message,
        user: data.user,
        hasAccessToken: !!data.accessToken
      });

      if (isLogin) {
        setSuccessMessage("Đăng nhập thành công!");
        // Dispatch with complete user data including balance
        dispatch(loginSuccess(data));
        
        // Auto close after 1 second
        setTimeout(() => {
          setSuccessMessage("");
          onClose();
          setFormData({ email: "", password: "", confirmPassword: "", fullName: "" });
        }, 1000);
      } else {
        // Registration success
        setSuccessMessage("Đăng ký tài khoản thành công!");
         dispatch(registerSuccess(data));// New action to handle registration success
        
        // Clear form and switch to login after 2 seconds
        setTimeout(() => {
          setSuccessMessage("");
          setIsLogin(true);
          setFormData({ email: "", password: "", confirmPassword: "", fullName: "" });
        }, 2000);
      }
      
    } catch (error) {
      dispatch(loginFailure(error.message));
      setErrors({ general: error.message });
    }
  };

  const resetForm = () => {
    setFormData({ email: "", password: "", confirmPassword: "", fullName: "" });
    setErrors({});
    setSuccessMessage("");
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md animate-fade-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isLogin ? t.loginTitle : t.registerTitle}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mx-6 mt-4 notification-success animate-fade-in">
            <div className="flex items-center space-x-3">
              <CheckCircle className="text-green-500 w-6 h-6 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-green-800 dark:text-green-200 text-sm font-semibold">
                  {isLogin ? "Đăng nhập thành công!" : "Thành công!"}
                </div>
                <div className="text-green-700 dark:text-green-300 text-sm">
                  {successMessage}
                </div>
                {!isLogin && (
                  <div className="mt-2 text-green-600 dark:text-green-400 text-xs">
                    Vui lòng đăng nhập với tài khoản vừa tạo
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* General Error */}
        {errors.general && (
          <div className="mx-6 mt-4 notification-error animate-fade-in">
            <div className="flex items-center space-x-3">
              <AlertCircle className="text-red-500 w-6 h-6 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-red-800 dark:text-red-200 text-sm font-semibold">
                  Lỗi!
                </div>
                <div className="text-red-700 dark:text-red-300 text-sm">
                  {errors.general}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.fullName} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`input pl-10 ${
                    errors.fullName 
                      ? "border-red-300 focus:ring-red-500" 
                      : ""
                  }`}
                  placeholder={t.fullName}
                  required={!isLogin}
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.fullName}</span>
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.email} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`input pl-10 ${
                  errors.email 
                    ? "border-red-300 focus:ring-red-500" 
                    : ""
                }`}
                placeholder={t.email}
                required
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.password} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`input pl-10 ${
                  errors.password 
                    ? "border-red-300 focus:ring-red-500" 
                    : ""
                }`}
                placeholder={isLogin ? t.password : "Mật khẩu (tối thiểu 6 ký tự)"}
                required
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.password}</span>
              </p>
            )}
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.confirmPassword} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`input pl-10 ${
                    errors.confirmPassword 
                      ? "border-red-300 focus:ring-red-500" 
                      : ""
                  }`}
                  placeholder={t.confirmPassword}
                  required={!isLogin}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.confirmPassword}</span>
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>{isLogin ? "Đang đăng nhập..." : "Đang đăng ký..."}</span>
              </div>
            ) : (
              <span>{isLogin ? t.loginButton : t.registerButton}</span>
            )}
          </button>
        </form>

        {/* Switch Mode */}
        <div className="px-6 pb-6">
          <button
            onClick={switchMode}
            className="w-full text-center text-primary-600 hover:text-primary-700 transition-colors"
          >
            {isLogin ? t.switchToRegister : t.switchToLogin}
          </button>
        </div>
      </div>
    </div>
  );
}
