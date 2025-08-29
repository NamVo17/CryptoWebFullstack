"use client"

import { useSelector } from "react-redux"
import { Github, Twitter, Facebook, Mail, Heart } from "lucide-react"
import { translations } from "../utils/translations"

export default function Footer() {
  const { language } = useSelector((state) => state.settings)
  const t = translations[language]

  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CV</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Crypto Vietnam</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
              {language === "vi"
                ? "Nền tảng theo dõi và phân tích cryptocurrency hàng đầu Việt Nam. Cung cấp thông tin thị trường real-time và công cụ đầu tư chuyên nghiệp."
                : "Vietnam's leading cryptocurrency tracking and analysis platform. Providing real-time market information and professional investment tools."}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary-600 transition-colors" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-600 transition-colors" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-600 transition-colors" aria-label="Github">
                <Github size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-600 transition-colors" aria-label="Email">
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              {language === "vi" ? "Liên kết nhanh" : "Quick Links"}
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">
                  {t.home}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">
                  {t.markets}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">
                  {t.portfolio}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">
                  {t.news}
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              {language === "vi" ? "Hỗ trợ" : "Support"}
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">
                  {t.aboutUs}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">
                  {t.contact}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">
                  {t.privacy}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">
                  {t.terms}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-200 dark:border-dark-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            © {currentYear} Crypto Vietnam. {language === "vi" ? "Tất cả quyền được bảo lưu." : "All rights reserved."}
          </p>
          <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 text-sm mt-4 md:mt-0">
            <span>{language === "vi" ? "Được tạo với" : "Made with"}</span>
            <Heart size={16} className="text-red-500" />
            <span>{language === "vi" ? "tại Việt Nam" : "in Vietnam"}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
