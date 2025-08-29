import React, { useState } from "react";
import { useSelector } from "react-redux";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { translations } from "../utils/translations";
import { Calendar, Clock, TrendingUp, TrendingDown, ExternalLink, Search, Filter } from "lucide-react";

const NewsPage = () => {
  const { language } = useSelector((state) => state.settings);
  const t = translations[language];

  // Mock news data - in real app this would come from a news API
  const [news] = useState([
    { id: 1, title: "Bitcoin đạt mức cao mới trong năm 2024", excerpt: "Bitcoin đã vượt qua ngưỡng $52,000, đánh dấu mức cao nhất trong năm 2024 và thể hiện sự phục hồi mạnh mẽ của thị trường crypto.", content: "Bitcoin đã đạt được mức giá $52,000 trong ngày hôm nay, đánh dấu mức cao nhất trong năm 2024. Sự tăng trưởng này được thúc đẩy bởi việc chấp thuận ETF Bitcoin và sự quan tâm ngày càng tăng từ các nhà đầu tư tổ chức.", category: "Bitcoin", publishedAt: "2024-01-15T10:30:00Z", readTime: "3 phút", image: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=250&fit=crop", sentiment: "positive", source: "CryptoNews", url: "#" },
    { id: 2, title: "Ethereum 2.0: Cập nhật quan trọng về Proof of Stake", excerpt: "Ethereum tiếp tục quá trình chuyển đổi sang Proof of Stake với những cập nhật quan trọng về hiệu suất và bảo mật.", content: "Ethereum đã công bố những cập nhật quan trọng về quá trình chuyển đổi sang Proof of Stake. Những thay đổi này sẽ cải thiện đáng kể hiệu suất giao dịch và giảm thiểu tác động môi trường của blockchain.", category: "Ethereum", publishedAt: "2024-01-15T09:15:00Z", readTime: "5 phút", image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=250&fit=crop", sentiment: "neutral", source: "BlockchainDaily", url: "#" },
    { id: 3, title: "DeFi protocols ghi nhận sự tăng trưởng mạnh mẽ", excerpt: "Các giao thức DeFi đã ghi nhận sự tăng trưởng đáng kể về tổng giá trị bị khóa (TVL) và số lượng người dùng hoạt động.", content: "Thị trường DeFi đang chứng kiến sự tăng trưởng mạnh mẽ với tổng giá trị bị khóa (TVL) đạt mức cao mới. Các giao thức như Uniswap, Aave và Compound đang thu hút ngày càng nhiều người dùng và vốn đầu tư.", category: "DeFi", publishedAt: "2024-01-15T08:45:00Z", readTime: "4 phút", image: "https://file.coin98.com/insights/marginatm/2021-09/defi-tvl-1632043734007.png", sentiment: "positive", source: "DeFiInsider", url: "#" },
    { id: 4, title: "Regulation: Các quy định mới về cryptocurrency tại châu Âu", excerpt: "Liên minh châu Âu đã thông qua các quy định mới về cryptocurrency, tạo khung pháp lý rõ ràng cho thị trường.", content: "Liên minh châu Âu đã thông qua MiCA (Markets in Crypto-Assets), bộ quy định toàn diện đầu tiên về cryptocurrency. Điều này sẽ tạo ra khung pháp lý rõ ràng và thúc đẩy sự phát triển của thị trường crypto tại châu Âu.", category: "Regulation", publishedAt: "2024-01-14T16:20:00Z", readTime: "6 phút", image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop", sentiment: "neutral", source: "CryptoRegulation", url: "#" },
    { id: 5, title: "NFT market: Xu hướng mới trong nghệ thuật số", excerpt: "Thị trường NFT đang chứng kiến sự đa dạng hóa với sự xuất hiện của các dự án nghệ thuật số độc đáo và sáng tạo.", content: "Thị trường NFT đang phát triển vượt bậc với sự xuất hiện của các dự án nghệ thuật số độc đáo. Từ nghệ thuật truyền thống đến âm nhạc và gaming, NFT đang mở ra những cơ hội mới cho các nghệ sĩ và nhà sáng tạo.", category: "NFT", publishedAt: "2024-01-14T14:30:00Z", readTime: "4 phút", image: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=400&h=250&fit=crop", sentiment: "positive", source: "NFTWorld", url: "#" },
    { id: 6, title: "Altcoin season: Cơ hội đầu tư vào các coin tiềm năng", excerpt: "Với sự phục hồi của Bitcoin, các altcoin cũng đang thể hiện tiềm năng tăng trưởng mạnh mẽ trong thời gian tới.", content: "Sau sự phục hồi của Bitcoin, thị trường altcoin đang thể hiện những tín hiệu tích cực. Các coin như Cardano, Solana và Polkadot đang thu hút sự quan tâm từ các nhà đầu tư với tiềm năng tăng trưởng cao.", category: "Altcoins", publishedAt: "2024-01-14T12:15:00Z", readTime: "5 phút", image: "https://cryptodnes.bg/vn/wp-content/uploads/sites/19/2025/07/Altcoin_Season_%E0%B9%80%E0%B8%AB%E0%B8%A3%E0%B8%A2%E0%B8%8D%E0%B8%84%E0%B8%A3%E0%B8%9B%E0%B9%82%E0%B8%95%E0%B9%84%E0%B8%AB%E0%B8%99_processed.jpg", sentiment: "positive", source: "AltcoinInsider", url: "#" },
  ]);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    { id: "all", name: "Tất cả", count: news.length },
    { id: "Bitcoin", name: "Bitcoin", count: news.filter(n => n.category === "Bitcoin").length },
    { id: "Ethereum", name: "Ethereum", count: news.filter(n => n.category === "Ethereum").length },
    { id: "DeFi", name: "DeFi", count: news.filter(n => n.category === "DeFi").length },
    { id: "NFT", name: "NFT", count: news.filter(n => n.category === "NFT").length },
    { id: "Regulation", name: "Quy định", count: news.filter(n => n.category === "Regulation").length },
    { id: "Altcoins", name: "Altcoins", count: news.filter(n => n.category === "Altcoins").length }
  ];

  const filteredNews = news.filter(article => {
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) || article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
      case 'negative': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="w-4 h-4" />;
      case 'negative': return <TrendingDown className="w-4 h-4" />;
      default: return <TrendingUp className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header />
      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Page Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{t.news || "Tin tức Crypto"}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">{t.newsDescription || "Cập nhật tin tức mới nhất về thị trường cryptocurrency, blockchain và DeFi"}</p>
        </div>

        {/* Search and Filter */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" placeholder={t.searchNews || "Tìm kiếm tin tức..."} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name} ({category.count})</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* News Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((article) => (
            <article key={article.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow duration-300">
              {/* Article Image */}
              <div className="relative h-48 overflow-hidden">
                <img src={article.image} alt={article.title} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                <div className="absolute top-4 left-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(article.sentiment)}`}>
                    {getSentimentIcon(article.sentiment)}
                    <span className="ml-1">{article.category}</span>
                  </span>
                </div>
              </div>

              {/* Article Content */}
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{formatDate(article.publishedAt)}</span>
                  <Clock className="w-4 h-4 ml-4 mr-2" />
                  <span>{article.readTime}</span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">{article.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{article.excerpt}</p>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{article.source}</span>
                  <a href={article.url} className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                    {t.readMore || "Đọc thêm"}
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* No Results */}
        {filteredNews.length === 0 && (
          <section className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">
              <Search className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">{t.noNewsFound || "Không tìm thấy tin tức"}</h3>
              <p>{t.noNewsDescription || "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc danh mục"}</p>
            </div>
          </section>
        )}

        {/* Newsletter Signup */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">{t.stayUpdated || "Luôn cập nhật tin tức mới nhất"}</h2>
          <p className="text-lg mb-6 opacity-90">{t.newsletterDescription || "Đăng ký nhận tin tức crypto hàng ngày trực tiếp vào email của bạn"}</p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input type="email" placeholder={t.enterEmail || "Nhập email của bạn"} className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white focus:outline-none" />
            <button className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">{t.subscribe || "Đăng ký"}</button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default NewsPage;

