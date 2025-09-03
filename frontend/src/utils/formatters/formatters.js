export const formatCurrency = (value, currency = "USD", minimumFractionDigits = 0) => {
  if (value === null || value === undefined || isNaN(value)) return "$0"

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits,
    maximumFractionDigits: value < 1 ? 6 : 2,
  }).format(value)
}

export const formatPercentage = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) return "0%"

  return `${value.toFixed(decimals)}%`
}

export const formatNumber = (value, decimals = 0) => {
  if (value === null || value === undefined || isNaN(value)) return "0"

  if (value >= 1e12) {
    return `${(value / 1e12).toFixed(decimals)}T`
  } else if (value >= 1e9) {
    return `${(value / 1e9).toFixed(decimals)}B`
  } else if (value >= 1e6) {
    return `${(value / 1e6).toFixed(decimals)}M`
  } else if (value >= 1e3) {
    return `${(value / 1e3).toFixed(decimals)}K`
  }

  return value.toLocaleString()
}

export const formatDate = (date, locale = "vi-VN") => {
  return new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
