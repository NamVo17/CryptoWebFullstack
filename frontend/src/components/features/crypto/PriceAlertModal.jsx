import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Bell } from "lucide-react";
import { cryptoSlice } from "../../../store";
import { translations } from "../../../utils/formatters/translations";
import { formatCurrency } from "../../../utils/formatters/formatters";

export default function PriceAlertModal({ isOpen, onClose, coin }) {
  const dispatch = useDispatch();
  const { language } = useSelector((state) => state.settings);
  const [targetPrice, setTargetPrice] = useState("");
  const [condition, setCondition] = useState("above");

  const t = translations[language];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!coin || !targetPrice) return;

    dispatch(
      cryptoSlice.addPriceAlert({
        coinId: coin.id,
        coinName: coin.name,
        coinSymbol: coin.symbol,
        targetPrice: Number.parseFloat(targetPrice),
        condition,
        currentPrice: coin.current_price,
      })
    );

    // Reset form and close modal
    setTargetPrice("");
    setCondition("above");
    onClose();

    // Show success message (you can implement a toast notification here)
    alert(language === "vi" ? "Cảnh báo giá đã được tạo!" : "Price alert created successfully!");
  };

  if (!isOpen || !coin) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t.priceAlertTitle}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Coin Info */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <img src={coin.image || "/placeholder.svg"} alt={coin.name} className="w-10 h-10 rounded-full" />
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">{coin.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {coin.symbol.toUpperCase()} • {formatCurrency(coin.current_price)}
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.targetPrice} (USD)
            </label>
            <input
              type="number"
              step="0.000001"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="input"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.condition}</label>
            <select value={condition} onChange={(e) => setCondition(e.target.value)} className="input">
              <option value="above">{t.above}</option>
              <option value="below">{t.below}</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">
              {t.cancel}
            </button>
            <button type="submit" className="flex-1 btn-primary">
              {t.createAlert}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
