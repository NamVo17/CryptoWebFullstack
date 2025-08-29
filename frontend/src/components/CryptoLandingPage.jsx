// components/CryptoRow.jsx
import React from "react";

const CryptoLandingPage = React.memo(({ crypto }) => {
  return (
    <li className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <img 
          alt={`${crypto.symbol} logo`} 
          className="w-5 h-5 rounded-full" 
          src={crypto.icon}
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/20x20?text=?";
          }}
        />
        <div>
          <span className="font-semibold">{crypto.symbol}</span>
          <span className="text-[#5A5F6E] ml-1">{crypto.name}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-semibold">{crypto.price}</span>
        <span className={`${crypto.isPositive ? 'text-green-500' : 'text-[#E63946]'}`}>
          {crypto.change}
        </span>
      </div>
    </li>
  );
}, (prevProps, nextProps) => {
  // ❗ chỉ render lại nếu giá hoặc phần trăm thay đổi khác
  return (
    prevProps.crypto.price === nextProps.crypto.price &&
    prevProps.crypto.change === nextProps.crypto.change
  );
});

export default CryptoLandingPage;
