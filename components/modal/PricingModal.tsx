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
  const [isLoading, setIsLoading] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const { user } = useAuth();

  const handleStartPremium = async () => {
    if (!ageConfirmed) {
      alert(
        "You must confirm that you are 18 years or older to access premium content."
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/lemonsqueezy/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isAnnual,
          userId: user?.id,
          userEmail: user?.email,
          userName: user?.user_metadata.name,
        }),
      });

      const data = await response.json();

      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        console.error("결제 페이지를 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("결제 오류:", error);
      console.error("결제 처리 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
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
            className="relative z-10 w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="bg-black/80 backdrop-blur-xl border border-white/20 p-8">
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
                  </div>
                </BackgroundGradient>
              </div>

              {/* Age Verification Section - Moved outside of pricing cards */}
              <div className="mt-8 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <div className="flex items-start mb-3">
                  <svg
                    className="w-5 h-5 text-orange-400 mr-2 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="text-sm">
                    <p className="font-medium text-orange-300 mb-1">
                      Age Restriction Notice
                    </p>
                    <p className="text-orange-200">
                      Premium content includes characters with mature designs
                      and is restricted to users 18 years and older. By
                      proceeding, you acknowledge that you understand the nature
                      of this content and assume full responsibility for your
                      usage.
                    </p>
                  </div>
                </div>

                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ageConfirmed}
                    onChange={(e) => setAgeConfirmed(e.target.checked)}
                    className="mt-1 h-4 w-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm text-white">
                    <strong>I am 18 years of age or older</strong> and
                    understand that premium content may include mature visual
                    designs. I acknowledge full responsibility for accessing and
                    using such content.
                  </span>
                </label>
              </div>

              {/* Premium Purchase Button - Moved outside of pricing cards */}
              <div className="mt-6">
                <button
                  onClick={handleStartPremium}
                  disabled={isLoading || !ageConfirmed}
                  className={`w-full py-4 px-6 rounded-xl font-semibold font-orbitron transition-all transform ${
                    ageConfirmed && !isLoading
                      ? "bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white shadow-lg backdrop-blur-sm hover:scale-105"
                      : "bg-gray-600 cursor-not-allowed text-gray-400"
                  }`}
                >
                  {isLoading ? "Loading..." : "Start Premium Journey"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
