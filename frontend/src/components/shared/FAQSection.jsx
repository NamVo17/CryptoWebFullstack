"use client"
import React, { useState } from "react"
import { useSelector } from "react-redux"
import { translations } from "../../utils/formatters/translations"

const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState(null)
    const { language } = useSelector((state) => state.settings)
    const t = translations[language]

    const faqs = [
        {
            id: 1,
            question: t.faq1Question || "Sàn giao dịch tiền mã hóa là gì?",
            answer: (
                <>
                    {t.faq1Answer1 || "Sàn giao dịch"} <a href="/crypto" className="text-yellow-400 hover:underline">{t.faq1Answer2 || "tiền mã hóa"}</a> {t.faq1Answer3 || "là thị trường kỹ thuật số cho phép người dùng mua và bán các loại tiền mã hóa như"}{" "}
                    <a href="https://bitcoin.org" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline">Bitcoin</a>,{" "}
                    <a href="https://ethereum.org" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline">Ethereum</a> {t.faq1Answer4 || "và"}{" "}
                    <a href="https://tether.to" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline">Tether</a>.
                    {t.faq1Answer5 || "Sàn giao dịch CryptoHub là sàn giao dịch tiền mã hóa lớn nhất tính theo khối lượng giao dịch."}
                </>
            ),
        },
        {
            id: 2,
            question: t.faq2Question || "CryptoHub cung cấp những sản phẩm gì?",
            answer: (
                <>
                    {t.faq2Answer1 || "CryptoHub là sàn giao dịch tiền mã hóa hàng đầu thế giới, cung cấp dịch vụ cho 235 triệu người dùng đã đăng ký tại hơn 180 quốc gia. Với mức phí thấp và hơn 350 loại tiền mã hóa để giao dịch, CryptoHub là sàn giao dịch ưa thích để giao dịch Bitcoin, Altcoin và các tài sản ảo khác."}
                    <br /><br />
                    {t.faq2Answer2 || "Với CryptoHub, người dùng có thể:"}
                    <ul className="list-disc list-inside mt-2">
                        <li>{t.faq2Answer3 || "Giao dịch hàng trăm loại tiền mã hóa trên thị trường Spot, Margin và Futures."}</li>
                        <li>{t.faq2Answer4 || "Mua và bán tiền mã hóa với CryptoHub P2P."}</li>
                        <li>{t.faq2Answer5 || "Kiếm tiền lãi từ tiền mã hóa của bạn với CryptoHub Earn."}</li>
                        <li>{t.faq2Answer6 || "Mua hoặc kiếm token mới trên CryptoHub Launchpad."}</li>
                        <li>{t.faq2Answer7 || "Giao dịch, staking và cho vay NFT trên thị trường CryptoHub NFT."}</li>
                    </ul>
                </>
            ),
        },
        {
            id: 3,
            question: t.faq3Question || "Cách mua CryptoHub và các loại tiền mã hóa khác trên CryptoHub",
            answer: (
                <>
                    {t.faq3Answer1 || "Có rất nhiều cách để"}{" "}<a href="https://bitcoin.org" target="_blank" rel="noopener noreferrer" className="text-yellow-400 ">{t.faq3Answer2 || "mua tiền mã hóa"}</a>{" "} {t.faq3Answer3 || "trên CryptoHub."}
                    {t.faq3Answer4 || "Bạn có thể sử dụng thẻ tín dụng/thẻ ghi nợ, số dư tiền mặt hoặc Apple Pay/Google Pay để mua tiền mã hóa trên CryptoHub."}
                    {t.faq3Answer5 || "Trước khi bắt đầu, vui lòng đảm bảo rằng bạn đã hoàn tất"}{" "}
                    <a href="https://bitcoin.org" target="_blank" rel="noopener noreferrer" className="text-yellow-400 ">{t.faq3Answer6 || "Xác minh danh tính"}</a>{" "} {t.faq3Answer7 || "cho tài khoản CryptoHub của mình."}
                </>
            ),
        },
        {
            id: 4,
            question: t.faq4Question || "Cách theo dõi giá tiền mã hóa",
            answer: (
                <>
                    {t.faq4Answer1 || "Cách dễ dàng nhất để theo dõi giá tiền mã hóa mới nhất, khối lượng giao dịch, xu hướng của altcoin và vốn hóa thị trường là"}{" "}
                    <a href="https://bitcoin.org" target="_blank" rel="noopener noreferrer" className="text-yellow-400 ">{t.faq4Answer2 || "Danh mục tiền mã hóa CryptoHub"}</a>.{" "}
                    {t.faq4Answer3 || "Nhấp vào các coin để biết giá lịch sử, khối lượng giao dịch trong 24 giờ và giá của các loại tiền mã hóa như"}{" "}
                    <a href="https://bitcoin.org" target="_blank" rel="noopener noreferrer" className="text-yellow-400 ">Bitcoin</a>,{" "}
                    <a href="https://ethereum.org" target="_blank" rel="noopener noreferrer" className="text-yellow-400 ">Ethereum</a>,{" "}
                    <a href="https://bitcoin.org" target="_blank" rel="noopener noreferrer" className="text-yellow-400 ">BNB</a>{" "} {t.faq4Answer4 || "và các loại tiền mã hóa khác trong thời gian thực."}                
                </>
            ),
        },
        {
            id: 5,
            question: t.faq5Question || "Cách giao dịch tiền mã hóa trên CryptoHub",
            answer: (
                <>
                    {t.faq5Answer1 || "Bạn có thể giao dịch hàng trăm loại tiền mã hóa trên CryptoHub thông qua thị trường"}{" "}
                    <a href="https://bitcoin.org" target="_blank" rel="noopener noreferrer" className="text-yellow-400 ">{t.faq5Answer2 || "Spot"}</a>,{" "}
                    <a href="https://bitcoin.org" target="_blank" rel="noopener noreferrer" className="text-yellow-400 ">{t.faq5Answer3 || "Margin"}</a>,{" "}
                    <a href="https://bitcoin.org" target="_blank" rel="noopener noreferrer" className="text-yellow-400 ">{t.faq5Answer4 || "Futures"}</a>{" "} {t.faq5Answer5 || "và"}{" "}
                    <a href="https://bitcoin.org" target="_blank" rel="noopener noreferrer" className="text-yellow-400 ">{t.faq5Answer6 || "Options"}</a>.
                    {t.faq5Answer7 || "Để"}{" "} <a href="https://bitcoin.org" target="_blank" rel="noopener noreferrer" className="text-yellow-400 ">{t.faq5Answer8 || "bắt đầu giao dịch"}</a>, {" "}
                    {t.faq5Answer9 || "người dùng cần đăng ký tài khoản, hoàn tất xác minh danh tính, mua/nạp tiền mã hóa và bắt đầu giao dịch."}
                </>
            ),
        },
        {
            id: 6,
            question: t.faq6Question || "Cách sinh lời từ tiền mã hóa trên CryptoHub",
            answer: (
                <>
                    {t.faq6Answer1 || "Người dùng có thể kiếm phần thưởng từ hơn 180 loại tiền mã hóa bằng cách sử dụng một trong những sản phẩm được cung cấp trên CryptoHub Earn."}
                    {t.faq6Answer2 || "Nền tảng của chúng tôi cung cấp nhiều tài sản kỹ thuật số như"}{" "}
                    <a href="https://bitcoin.org" target="_blank" rel="noopener noreferrer" className="text-yellow-400 ">Bitcoin</a>,{" "}
                    <a href="https://ethereum.org" target="_blank" rel="noopener noreferrer" className="text-yellow-400 ">Ethereum</a> {t.faq6Answer3 || "và các stablecoin."}
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
