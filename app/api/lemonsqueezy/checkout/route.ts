import { NextRequest, NextResponse } from "next/server";
import {
  lemonSqueezySetup,
  createCheckout,
} from "@lemonsqueezy/lemonsqueezy.js";

// Lemon Squeezy 설정
lemonSqueezySetup({
  apiKey: process.env.LEMONSQUEEZY_API_KEY!,
  onError: (error) => console.error("Lemon Squeezy 오류:", error),
});

export async function POST(request: NextRequest) {
  try {
    const { isAnnual, userEmail, userName, userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "사용자 ID가 필요합니다" },
        { status: 400 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://lucidream.vercel.app");

    // 월간/연간에 따른 variant ID 선택
    const variantId = isAnnual
      ? process.env.LEMONSQUEEZY_PREMIUM_YEARLY_VARIANT_ID!
      : process.env.LEMONSQUEEZY_PREMIUM_MONTHLY_VARIANT_ID!;

    // 체크아웃 세션 생성
    const checkout = await createCheckout(
      process.env.LEMONSQUEEZY_STORE_ID!,
      variantId,
      {
        checkoutOptions: {
          embed: false,
          media: false,
          logo: true,
        },
        checkoutData: {
          email: userEmail,
          name: userName,
          custom: {
            user_id: userId,
            billing_cycle: isAnnual ? "annual" : "monthly",
          },
        },
        productOptions: {
          enabledVariants: [parseInt(variantId)],
          redirectUrl: `${baseUrl}/dream`,
          receiptButtonText: "Return to LuciDream",
          receiptThankYouNote: `LuciDream Premium ${
            isAnnual ? "annual" : "monthly"
          } subscription started successfully!`,
        },
      }
    );

    if (!checkout.data) {
      throw new Error("체크아웃 세션 생성 실패");
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: checkout.data?.data.attributes.url,
      billingCycle: isAnnual ? "annual" : "monthly",
    });
  } catch (error) {
    console.error("체크아웃 생성 오류:", error);
    return NextResponse.json(
      {
        error: "체크아웃 세션 생성에 실패했습니다",
        details: error instanceof Error ? error.message : "알 수 없는 오류",
      },
      { status: 500 }
    );
  }
}
