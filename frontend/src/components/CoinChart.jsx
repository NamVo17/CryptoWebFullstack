import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import api from "../services/api";
import { translations } from "../utils/translations";

// Hàm rút gọn số
const formatNumber = (num) => {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + "T"; // nghìn tỷ
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B"; // tỷ
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M"; // triệu
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K"; // nghìn
  return num;
};

function CoinChart({
  id,
  metric = "price",
  chartType = "line",
  timeRange = "24H",
}) {
  const [chartData, setChartData] = useState([]);
  const { language } = useSelector((state) => state.settings);
  const t = translations[language];

  const rangeMap = {
    "24H": 1,
    "7D": 7,
    "1M": 30,
    "3M": 90,
    "1Y": 365,
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const days = rangeMap[timeRange];
        const response = await api.get(
          `/coins/${id}/market_chart?vs_currency=usd&days=${days}`
        );
        let data = [];
        if (metric === "price") {
          data = response.data.prices.map(([time, value]) => ({
            time,
            value,
          }));
        } else {
          data = response.data.market_caps.map(([time, value]) => ({
            time,
            value,
          }));
        }
        setChartData(data);
      } catch (err) {
        console.error("Error fetching chart data:", err);
      }
    };
    fetchData();
  }, [id, metric, timeRange]);
  // Xác định màu sắc theo giá trị đầu - cuối
  const getChartColor = () => {
    if (chartData.length < 2) return "#2BC67D"; // mặc định xanh
    const first = chartData[0].value;
    const last = chartData[chartData.length - 1].value;
    return last >= first ? "#2BC67D" : "#FF4D4D"; // xanh nếu tăng, đỏ nếu giảm
  };

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        {chartType === "line" ? (
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              axisLine={false} // Ẩn trục dọc
              tickLine={false} // Ẩn gạch nhỏ đầu dòng
              tickFormatter={(timestamp) => {
                const date = new Date(timestamp);

                if (timeRange === "24H") {
                  return date.toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }); // HH:mm
                }

                if (timeRange === "7D" || timeRange === "1M") {
                  return `${date.getDate()}/${date.getMonth() + 1}`; // DD/MM
                }

                if (timeRange === "3M" || timeRange === "1Y") {
                  return `${date.getMonth() + 1}/${date.getFullYear()}`; // MM/YYYY
                }

                return date.toLocaleDateString("en-GB");
              }}
            />

            <YAxis
              domain={["auto", "auto"]}
              orientation="right"
              tickFormatter={formatNumber}
              axisLine={false} // Ẩn trục dọc
              tickLine={false} // Ẩn gạch nhỏ đầu dòng
            />
            <Tooltip />

            {/* Gradient fill */}
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={getChartColor()}
                  stopOpacity={0.6}
                />
                <stop
                  offset="100%"
                  stopColor={getChartColor()}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            {/* Line + Fill */}
            <Area
              type="monotone"
              dataKey="value"
              stroke={getChartColor()}
              strokeWidth={2.5} // tăng độ đậm line
              fill="url(#colorValue)"
            />
          </AreaChart>
        ) : (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              hide={timeRange === "24H"}
              axisLine={false} // Ẩn trục dọc
              tickLine={false} // Ẩn gạch nhỏ đầu dòng
            />
            <YAxis
              domain={["auto", "auto"]}
              orientation="right"
              tickFormatter={formatNumber}
              axisLine={false} // Ẩn trục dọc
              tickLine={false} // Ẩn gạch nhỏ đầu dòng
            />
            <Tooltip />
            <Bar dataKey="value" fill="#2BC67D" />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

export default CoinChart;
