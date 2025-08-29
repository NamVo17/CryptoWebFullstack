"use client"
import React, { useState } from "react"

const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState(null)

    const faqs = [
        {
            id: 1,
            question: "Sàn giao dịch tiền mã hóa là gì?",
            answer: (
                <>
                    Sàn giao dịch <a href="/crypto" className="text-yellow-400 hover:underline">tiền mã hóa</a> là thị trường kỹ thuật số cho phép người dùng mua và bán các loại tiền mã hóa như{" "}
                    <a href="https://bitcoin.org" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline">Bitcoin</a>,{" "}
                    <a href="https://ethereum.org" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline">Ethereum</a> và{" "}
                    <a href="https://tether.to" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline">Tether</a>.
                    Sàn giao dịch Binance là sàn giao dịch tiền mã hóa lớn nhất tính theo khối lượng giao dịch.
                </>
            ),
        },
        {
            id: 2,
            question: "Binance cung cấp những sản phẩm gì?",
            answer: (
                <>
                    Binance là sàn giao dịch tiền mã hóa hàng đầu thế giới, cung cấp dịch vụ cho 235 triệu người dùng đã đăng ký tại hơn 180 quốc gia. Với mức phí thấp và hơn 350 loại tiền mã hóa để giao dịch, Binance là sàn giao dịch ưa thích để giao dịch Bitcoin, Altcoin và các tài sản ảo khác.
                    <br /><br />
                    Với Binance, người dùng có thể:
                    <ul className="list-disc list-inside mt-2">
                        <li>Giao dịch hàng trăm loại tiền mã hóa trên thị trường Spot, Margin và Futures.</li>
                        <li>Mua và bán tiền mã hóa với Binance P2P. The data presented is for informational purposes only.</li>
                        <li>Kiếm tiền lãi từ tiền mã hóa của bạn với Binance Earn.</li>
                        <li>Mua hoặc kiếm token mới trên Binance Launchpad.</li>
                        <li>Giao dịch, staking và cho vay NFT trên thị trường Binance NFT.</li>
                    </ul>
                </>
            ),
        },
        {
            id: 3,
            question: "Cách mua Bitcoin và các loại tiền mã hóa khác trên Binance",
            answer: (
                <>
                    Có rất nhiều cách để {" "}<a href="https://bitcoin.org" target="_blank" rel="noopener noreferrer" className="text-yellow-400 ">mua tiền mã hóa</a>{" "} trên Binance.
                    Bạn có thể sử dụng thẻ tín dụng/thẻ ghi nợ, số dư tiền mặt hoặc Apple Pay/Google Pay để mua tiền mã hóa trên Binance.
                    Trước khi bắt đầu, vui lòng đảm bảo rằng bạn đã hoàn tất {" "}
                    <a href="https://bitcoin.org" target="_blank" rel="noopener noreferrer" className="text-yellow-400 ">Xác minh danh tính</a>{" "} cho tài khoản Binance của mình.
                </>
            ),
        },
        {
            id: 4,
            question: "Cách theo dõi giá tiền mã hóa",
            answer: (
                <>
                    Cách dễ dàng nhất để theo dõi giá tiền mã hóa mới nhất, khối lượng giao dịch, xu hướng của altcoin và vốn hóa thị trường là {" "}
                    <a href="https://bitcoin.org" target="_blank" rel="noopener noreferrer" className="text-yellow-400 ">Danh mục tiền mã hóa Binance</a>.{" "}
                    Nhấp vào các coin để biết giá lịch sử, khối lượng giao dịch trong 24 giờ và giá của các loại tiền mã hóa như {" "}
                    <a href="https://bitcoin.org" target="_blank" rel="noopener noreferrer" className="text-yellow-400 ">Bitcoin</a>,{" "}
                    <a href="https://bitcoin.org" target="_blank" rel="noopener noreferrer" className="text-yellow-400 ">Ethereum</a>,{" "}
                    <a href="https://bitcoin.org" target="_blank" rel="noopener noreferrer" className="text-yellow-400 ">BNB</a>{" "} và các loại tiền mã hóa khác trong thời gian thực.                
                </>
            ),
        },
        {
            id: 5,
            question: "Cách giao dịch tiền mã hóa trên Binance",
            answer: (
                <>
                    Bạn có thể giao dịch hàng trăm loại tiền mã hóa trên Binance thông qua thị trường {" "}
                    <a href="https://bitcoin.org" target="_blank" rel="noopener noreferrer" className="text-yellow-400 ">Spot</a>,{" "}
                    <a href="https://bitcoin.org" target="_blank" rel="noopener noreferrer" className="text-yellow-400 ">Margin</a>,{" "}
                    <a href="https://bitcoin.org" target="_blank" rel="noopener noreferrer" className="text-yellow-400 ">Futures</a>{" "} và {" "}
                    <a href="https://bitcoin.org" target="_blank" rel="noopener noreferrer" className="text-yellow-400 ">Options</a>.
                    Để {" "} <a href="https://bitcoin.org" target="_blank" rel="noopener noreferrer" className="text-yellow-400 ">bắt đầu giao dịch</a>, {" "}
                    người dùng cần đăng ký tài khoản, hoàn tất xác minh danh tính, mua/nạp tiền mã hóa và bắt đầu giao dịch.
                </>
            ),
        },
        {
            id: 6,
            question: "Cách sinh lời từ tiền mã hóa trên Binance",
            answer: (
                <>
                    Người dùng có thể kiếm phần thưởng từ hơn 180 loại tiền mã hóa bằng cách sử dụng một trong những sản phẩm được cung cấp trên Binance Earn.
                    Nền tảng của chúng tôi cung cấp nhiều tài sản kỹ thuật số như {" "}
                    <a href="https://bitcoin.org" target="_blank" rel="noopener noreferrer" className="text-yellow-400 ">Bitcoin</a>,{" "}
                    <a href="https://ethereum.org" target="_blank" rel="noopener noreferrer" className="text-yellow-400 ">Ethereum</a> và các stablecoin.
                </>
            ),
        },
    ]

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index)
    }

    return (
        <div className="space-y-6">
            {faqs.map((faq, index) => (
                <div key={faq.id} className=" pb-4">
                    <div
                        className="flex justify-between items-center cursor-pointer"
                        role="button"
                        tabIndex={0}
                        aria-expanded={openIndex === index}
                        onClick={() => toggleFAQ(index)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault()
                                toggleFAQ(index)
                            }
                        }}
                    >
                        <div className="flex items-center space-x-4">
                            <div className="flex justify-center items-center w-7 h-7 rounded-lg border border-gray-400 dark:border-gray-500 text-xs text-gray-800 dark:text-gray-200 font-semibold select-none">
                                {faq.id}
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white text-base leading-snug">
                                {faq.question}
                            </span>
                        </div>
                        <span className="text-gray-900 dark:text-white text-xl font-bold select-none ">
                            {openIndex === index ? "−" : "+"}
                        </span>
                    </div>

                    {openIndex === index && (
                        <div
                            className="mt-3 text-gray-700 dark:text-gray-300 text-base leading-relaxed ml-10 mr-9 "
                            role="region"
                        >
                            {faq.answer}
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

export default FAQSection
