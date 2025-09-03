"use client"

import React, { useState, useMemo, useCallback, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Star, Bell, TrendingUp, TrendingDown, Search } from "lucide-react"
import { addToWatchlist, removeFromWatchlist, setFilters } from "../../../store/slices/cryptoSlice"
import { translations } from "../../../utils/formatters/translations"
import { formatCurrency, formatPercentage, formatNumber } from "../../../utils/formatters/formatters"
import PriceAlertModal from "../crypto/PriceAlertModal"
import { Link } from 'react-router-dom';

// Memoized table row component (now accepts rank prop)
const CoinRow = React.memo(({ coin, rank, isInWatchlist, onWatchlistToggle, onPriceAlert, t }) => {
  const change1h = coin.price_change_percentage_1h_in_currency || 0
  const change24h = coin.price_change_percentage_24h || 0
  const change7d = coin.price_change_percentage_7d_in_currency || 0

  return (
    <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
      <td className="py-4 px-2 text-gray-600 dark:text-gray-400">{rank}</td>
      <td className="py-4 px-2">
        <Link to={`/coin/${coin.id}`} className="flex items-center space-x-3">
          <img src={coin.image || "/placeholder.svg"} alt={coin.name} className="w-8 h-8 rounded-full" />
          <div>
            <div className="font-semibold text-gray-900 dark:text-white">{coin.symbol.toUpperCase()}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{coin.name}</div>
          </div>
        </Link>
      </td>
      <td className="py-4 px-2 text-right font-semibold text-gray-900 dark:text-white">
        <Link to={`/coin/${coin.id}`} className="hover:text-blue-500">
          {formatCurrency(coin.current_price)}
        </Link>
      </td>
      <td className={`py-4 px-2 text-right font-medium ${change1h >= 0 ? "text-green-600" : "text-red-600"}`}>
        <div className="flex items-center justify-end space-x-1">
          {change1h >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{formatPercentage(Math.abs(change1h))}</span>
        </div>
      </td>
      <td className={`py-4 px-2 text-right font-medium ${change24h >= 0 ? "text-green-600" : "text-red-600"}`}>
        <div className="flex items-center justify-end space-x-1">
          {change24h >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{formatPercentage(Math.abs(change24h))}</span>
        </div>
      </td>
      <td className={`py-4 px-2 text-right font-medium ${change7d >= 0 ? "text-green-600" : "text-red-600"}`}>
        <div className="flex items-center justify-end space-x-1">
          {change7d >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{formatPercentage(Math.abs(change7d))}</span>
        </div>
      </td>
      <td className="py-4 px-2 text-right text-gray-600 dark:text-gray-400">{formatNumber(coin.total_volume)}</td>
      <td className="py-4 px-2 text-right text-gray-600 dark:text-gray-400">{formatNumber(coin.market_cap)}</td>
      <td className="py-4 px-2">
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => onWatchlistToggle(coin.id)}
            className={`p-2 rounded-lg transition-colors ${
              isInWatchlist
                ? "text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                : "text-gray-400 hover:text-yellow-500 hover:bg-gray-50 dark:hover:bg-gray-600"
            }`}
            title={isInWatchlist ? t.removeFromWatchlist : t.addToWatchlist}
          >
            <Star size={16} fill={isInWatchlist ? "currentColor" : "none"} />
          </button>
          <button
            onClick={() => onPriceAlert(coin)}
            className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            title={t.setPriceAlert}
          >
            <Bell size={16} />
          </button>
        </div>
      </td>
    </tr>
  )
})

CoinRow.displayName = "CoinRow"

export default function CryptoTable() {
  const dispatch = useDispatch()
  const { coins = [], loading, watchlist = [], filters = {} } = useSelector((state) => state.crypto)
  const { language } = useSelector((state) => state.settings)
  const [alertModalOpen, setAlertModalOpen] = useState(false)
  const [selectedCoin, setSelectedCoin] = useState(null)

  // Pagination local state
  const [currentPage, setCurrentPage] = useState(1)
  const coinsPerPage = 50

  const t = translations[language]

  // memoized filtered & sorted coins (no hard slice here)
  const filteredCoins = useMemo(() => {
    let filtered = Array.isArray(coins) ? [...coins] : []

    const searchTerm = (filters.search || "").trim().toLowerCase()
    if (searchTerm) {
      filtered = filtered.filter(
        (coin) =>
          (coin.name || "").toLowerCase().includes(searchTerm) ||
          (coin.symbol || "").toLowerCase().includes(searchTerm),
      )
    }

    // Sorting
    const sortBy = filters.sortBy || "market_cap"
    const sortOrder = filters.sortOrder || "desc"

    filtered.sort((a, b) => {
      const aValue = Number(a?.[sortBy] ?? 0)
      const bValue = Number(b?.[sortBy] ?? 0)
      if (isNaN(aValue) || isNaN(bValue)) return 0
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue
    })

    return filtered
  }, [coins, filters])

  // Recompute pagination values
  const totalPages = Math.max(1, Math.ceil(filteredCoins.length / coinsPerPage))
  useEffect(() => {
    // Ensure currentPage valid when filteredCoins length changes
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  const indexOfFirst = (currentPage - 1) * coinsPerPage
  const indexOfLast = indexOfFirst + coinsPerPage
  const pageCoins = filteredCoins.slice(indexOfFirst, indexOfLast)

  // callbacks
  const handleWatchlistToggle = useCallback(
    (coinId) => {
      if (watchlist.includes(coinId)) {
        dispatch(removeFromWatchlist(coinId))
      } else {
        dispatch(addToWatchlist(coinId))
      }
    },
    [dispatch, watchlist],
  )

  const handlePriceAlert = useCallback((coin) => {
    setSelectedCoin(coin)
    setAlertModalOpen(true)
  }, [])

  // dispatch search to redux filters + reset to page 1
  const handleSearch = useCallback(
    (e) => {
      const value = e.target.value
      dispatch(setFilters({ search: value }))
      setCurrentPage(1)
    },
    [dispatch],
  )

  const handleSort = useCallback(
    (sortBy) => {
      const newOrder = filters.sortBy === sortBy && filters.sortOrder === "desc" ? "asc" : "desc"
      dispatch(setFilters({ sortBy, sortOrder: newOrder }))
      setCurrentPage(1)
    },
    [dispatch, filters.sortBy, filters.sortOrder],
  )

  if (loading && coins.length === 0) {
    return (
      <div className="card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
          {[...Array(10)].map((_, i) => (
            <div key={`loading-row-${i}`} className="flex space-x-4">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-8"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/6"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/6"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/6"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {language === "vi" ? "Thị trường Cryptocurrency" : "Cryptocurrency Markets"}
          </h2>

          <div className="flex items-center space-x-4 w-full sm:w-auto">
            {/* Search bar large style like hình giữa */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-700 w-4 h-4 dark:text-gray-200" />
              <input
                type="text"
                placeholder={t.search || "Tìm kiếm tiền điện tử..."}
                value={filters.search || ""}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white text-black-700 placeholder-gray-700 border border-gray-700 
                dark:bg-gray-800 dark:text-white dark:border-gray-500 dark:placeholder-gray-200 focus:outline-none"
              />
            </div>

            {/* Quick sort buttons (Vốn hóa, Giá, Thay đổi24h) */}
            <div className="flex gap-2">
              <button
                onClick={() => handleSort("market_cap")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  filters.sortBy === "market_cap" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-900 dark:text-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
                title={t.marketCap}
              >
                {language === "vi" ? "Vốn hóa" : "Market Cap"}
              </button>
              <button
                onClick={() => handleSort("current_price")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  filters.sortBy === "current_price" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
                title={t.price}
              >
                {language === "vi" ? "Giá" : "Price"}
              </button>
              <button
                onClick={() => handleSort("price_change_percentage_24h")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  filters.sortBy === "price_change_percentage_24h"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
                title={t.change24h}
              >
                {language === "vi" ? "Thay đổi 24h" : "24h %"}
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">#</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">{t.name}</th>
                <th
                  className="text-right py-3 px-2 font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:text-blue-600"
                  onClick={() => handleSort("current_price")}
                >
                  {t.price}
                </th>
                <th
                  className="text-right py-3 px-2 font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:text-blue-600"
                  onClick={() => handleSort("price_change_percentage_1h_in_currency")}
                >
                  {t.change1h}
                </th>
                <th
                  className="text-right py-3 px-2 font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:text-blue-600"
                  onClick={() => handleSort("price_change_percentage_24h")}
                >
                  {t.change24h}
                </th>
                <th
                  className="text-right py-3 px-2 font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:text-blue-600"
                  onClick={() => handleSort("price_change_percentage_7d_in_currency")}
                >
                  {t.change7d}
                </th>
                <th
                  className="text-right py-3 px-2 font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:text-blue-600"
                  onClick={() => handleSort("total_volume")}
                >
                  {t.volume24h}
                </th>
                <th
                  className="text-right py-3 px-2 font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:text-blue-600"
                  onClick={() => handleSort("market_cap")}
                >
                  {t.marketCap}
                </th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {pageCoins.map((coin, idx) => (
                <CoinRow
                  key={coin.id}
                  coin={coin}
                  rank={indexOfFirst + idx + 1}
                  isInWatchlist={watchlist.includes(coin.id)}
                  onWatchlistToggle={handleWatchlistToggle}
                  onPriceAlert={handlePriceAlert}
                  t={t}
                />
              ))}
            </tbody>
          </table>
        </div>

        {filteredCoins.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">
              {language === "vi" ? "Không tìm thấy kết quả" : "No results found"}
            </div>
          </div>
        )}

        {/* Pagination */}
        {filteredCoins.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
            <div className="text-sm text-gray-400">
              {language === "vi"
                ? `Trang ${currentPage} / ${totalPages} `
                : `Page ${currentPage} / ${totalPages} `}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                ← Trước
              </button>

              {/* Simple page buttons (you can enhance with ellipsis logic if needed) */}
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1
                  // optional: only render nearby pages to avoid huge list (basic example)
                  // if (totalPages > 12 && Math.abs(page - currentPage) > 5 && page !== 1 && page !== totalPages) return null
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg text-sm  ${
                        page === currentPage ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                Sau →
              </button>
            </div>
          </div>
        )}
      </div>

      <PriceAlertModal isOpen={alertModalOpen} onClose={() => setAlertModalOpen(false)} coin={selectedCoin} />
    </>
  )
}
