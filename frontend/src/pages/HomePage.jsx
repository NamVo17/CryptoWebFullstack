import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useSelector } from "react-redux";
import { translations } from "../utils/translations";
import LandingPage from "../components/LandingPage";
import FAQSection from "../components/FAQSection";

const HomePage = () => {
  
  const { language } = useSelector((state) => state.settings);
  const t = translations[language];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header />
      <main className="container mx-auto px-4 py-6 space-y-8 bg-gray-50 dark:bg-gray-900">
        <div
          className="relative h-96 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl overflow-hidden"
          style={{
            backgroundImage:
              'url("https://readdy.ai/api/search-image?query=Modern%20cryptocurrency%20trading%20dashboard%20with%20digital%20charts%20and%20graphs%20in%20blue%20purple%20gradient%20background%20futuristic%20financial%20technology%20design%20clean%20professional%20layout&width=1200&height=400&seq=hero001&orientation=landscape")',
            backgroundSize: "cover",
            backgroundPosition: "center center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-purple-900/80"></div>
          <div className="relative h-full flex items-center justify-center px-8">
            <div className="text-white max-w-2xl text-center">
              <h1 className="text-5xl font-bold mb-4">
                {t.TopCryptoMarketInVietnam ||
                  "Thị trường Crypto hàng đầu Việt Nam"}
              </h1>
              <p className="text-xl mb-6 opacity-90">
                {t.TrackPricesAndInvestSmartly ||
                  "Nền tảng giao dịch và theo dõi tiền điện tử hàng đầu với dữ liệu thời gian thực, phân tích chuyên sâu và quản lý danh mục đầu tư thông minh."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  className="px-8 py-4 bg-crypto-blue hover:bg-crypto-blue/90 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 cursor-pointer whitespace-nowrap"
                  href="/market"
                >
                  <i className="ri-line-chart-line mr-2"></i>
                  Khám phá thị trường
                </a>
                <a
                  className="px-8 py-4 bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap"
                  href="/portfolio"
                >
                  <i className="ri-briefcase-line mr-2"></i>
                  Tạo danh mục
                </a>
              </div>
            </div>
          </div>
        </div>

        <LandingPage />


        {/* FAQ Section */}
        <section className="py-12 bg-gray-100 dark:bg-gray-900 rounded-lg">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Các câu hỏi thường gặp
            </h2>
            <FAQSection />
          </div>
        </section>
        {/* Video Section */}
        <section className="py-12">
          <div className="max-w-6xl mx-auto">
            <div className="relative aspect-video max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl">
              <video
                className="absolute top-0 left-0 w-full h-full"
                src="/video.mp4"
                autoPlay
                muted
                loop
                playsInline
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6 bg-black/40">
                <h2 className="text-4xl font-bold mb-4">Bắt đầu tăng thu nhập ngay hôm nay</h2>
                <button
                  className="mt-4 bg-[#F5B916] text-[#12161E] font-semibold rounded-lg px-5 py-3 text-sm hover:bg-yellow-200 transition"
                >
                  Đăng ký ngay
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
