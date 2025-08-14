"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { useAuth } from "@/contexts/Authcontext";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PricingModal({ isOpen, onClose }: PricingModalProps) {
  const [isAnnual, setIsAnnual] = useState(false);
  const { user } = useAuth();

  const handleStartPremium = () => {
    // 월간/연간에 따른 상품 ID 선택
    const productId = isAnnual
      ? process.env.NEXT_PUBLIC_DODO_PAYMENTS_ANNUAL_PRODUCT_ID
      : process.env.NEXT_PUBLIC_DODO_PAYMENTS_MONTHLY_PRODUCT_ID;

    // Static Payment Link 생성
    const baseUrl = "https://test.checkout.dodopayments.com/buy";
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dream`;

    // URL 파라미터 생성
    const params = new URLSearchParams({
      quantity: "1",
      redirect_url: redirectUrl,
    });

    // 사용자 ID를 metadata로 추가
    if (user?.id) {
      params.append("metadata_userId", user.id);
      params.append("metadata_planType", isAnnual ? "annual" : "monthly");
      params.append("metadata_createdAt", new Date().toISOString());
    }

    const paymentUrl = `${baseUrl}/${productId}?${params.toString()}`;

    // 결제 페이지로 리다이렉트
    window.location.href = paymentUrl;
  };

  if (!isOpen) return null;

  const annualDiscount = 0.2; // 20% 할인

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative z-10 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-3xl p-4 md:p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                <h2 className="text-4xl font-bold text-white mb-4 font-orbitron">
                  Upgrade to Premium
                </h2>

                {/* Billing Toggle */}
                <div className="flex items-center justify-center mt-6 gap-4">
                  <span
                    className={`text-sm ${
                      !isAnnual ? "text-white" : "text-white/60"
                    }`}
                  >
                    Monthly
                  </span>
                  <button
                    onClick={() => setIsAnnual(!isAnnual)}
                    className="relative w-12 h-6 bg-white/20 rounded-full transition-colors"
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        isAnnual ? "translate-x-6" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                  <span
                    className={`text-sm ${
                      isAnnual ? "text-white" : "text-white/60"
                    }`}
                  >
                    Annual
                    <span className="ml-1 text-green-400 text-xs">-20%</span>
                  </span>
                </div>
              </div>

              {/* Pricing Cards */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* Free Plan */}
                <div className="bg-black/90 backdrop-blur border border-white/50 rounded-2xl p-8">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2 font-orbitron">
                      Free
                    </h3>
                    <div className="text-4xl font-bold text-white">
                      $0
                      <span className="text-lg text-white/60 font-normal">
                        /month
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center text-white/80">
                      <svg
                        className="w-5 h-5 text-green-400 mr-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Up to 100 messages
                    </li>
                    <li className="flex items-center text-white/80">
                      <svg
                        className="w-5 h-5 text-green-400 mr-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      All basic characters
                    </li>
                    <li className="flex items-center text-white/80">
                      <svg
                        className="w-5 h-5 text-green-400 mr-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Basic animations (10 types)
                    </li>
                    <li className="flex items-center text-white/80">
                      <svg
                        className="w-5 h-5 text-green-400 mr-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      3D Avatar experience
                    </li>
                    <li className="flex items-center text-white/50">
                      <svg
                        className="w-5 h-5 text-red-400 mr-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      No custom characters
                    </li>
                    <li className="flex items-center text-white/50">
                      <svg
                        className="w-5 h-5 text-red-400 mr-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      No access to premium characters
                    </li>
                  </ul>
                </div>

                {/* Premium Plan */}
                <BackgroundGradient animate={true} containerClassName="group">
                  <div className="bg-black/90 backdrop-blur rounded-2xl p-6 relative">
                    <div className="text-center mb-6 mt-2">
                      <h3 className="text-2xl font-bold text-white mb-2 font-orbitron">
                        Premium
                      </h3>
                      <div className="text-4xl font-bold text-white mb-2">
                        $
                        {isAnnual
                          ? ((14.99 * 12 * (1 - annualDiscount)) / 12).toFixed(
                              2
                            )
                          : "14.99"}
                        <span className="text-lg text-white/60 font-normal">
                          /{isAnnual ? "month" : "month"}
                        </span>
                      </div>
                      {isAnnual && (
                        <p className="text-green-400 text-sm mb-2">
                          Save ${(14.99 * 12 * annualDiscount).toFixed(0)} per
                          year
                        </p>
                      )}
                    </div>

                    <ul className="space-y-3 mt-2 mb-8">
                      <li className="flex items-center text-white/80">
                        <svg
                          className="w-5 h-5 text-green-400 mr-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Unlimited conversations
                      </li>
                      <li className="flex items-center text-white/80">
                        <svg
                          className="w-5 h-5 text-green-400 mr-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Create custom characters
                      </li>
                      <li className="flex items-center text-white/80">
                        <svg
                          className="w-5 h-5 text-green-400 mr-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Access to premium characters
                      </li>
                      <li className="flex items-center text-white/80">
                        <svg
                          className="w-5 h-5 text-green-400 mr-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        All 30+ animations
                      </li>
                      <li className="flex items-center text-white/80">
                        <svg
                          className="w-5 h-5 text-green-400 mr-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Priority support
                      </li>
                      <li className="flex items-center text-white/80">
                        <svg
                          className="w-5 h-5 text-green-400 mr-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Early access to new characters
                      </li>
                    </ul>

                    <button
                      onClick={handleStartPremium}
                      className="w-full py-3 px-6 bg-white hover:bg-gray-100 rounded-lg text-black font-semibold transition-all transform hover:scale-105"
                    >
                      Start Premium Journey
                    </button>
                  </div>
                </BackgroundGradient>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
