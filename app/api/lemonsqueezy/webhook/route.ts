import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { serverSupabase } from "@/lib/serverSupabase";

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  const expectedSignature = hmac.digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expectedSignature, "hex")
  );
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-signature");

    if (!signature) {
      console.error("웹훅 서명이 없습니다");
      return NextResponse.json({ error: "서명이 필요합니다" }, { status: 400 });
    }

    // 웹훅 서명 검증
    const isValid = verifyWebhookSignature(
      rawBody,
      signature,
      process.env.LEMONSQUEEZY_WEBHOOK_SECRET!
    );

    if (!isValid) {
      console.error("웹훅 서명 검증 실패");
      return NextResponse.json({ error: "잘못된 서명입니다" }, { status: 400 });
    }

    const webhook = JSON.parse(rawBody);
    const eventName = webhook.meta.event_name;
    const data = webhook.data;

    /* 웹훅 처리 시작 */
    switch (eventName) {
      case "subscription_updated":
        await handleSubscriptionUpdated(
          data,
          webhook.meta.custom_data?.user_id
        );
        break;

      case "subscription_payment_success":
        await handleSubscriptionPaymentSuccess(
          data,
          webhook.meta.custom_data?.user_id
        );
        break;

      default:
        console.log(`처리되지 않은 이벤트: ${eventName}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("웹훅 처리 오류:", error);
    return NextResponse.json({ error: "웹훅 처리 실패" }, { status: 500 });
  }
}

async function handleSubscriptionUpdated(
  data: {
    attributes: { status: string; cancelled: boolean; product_name: string };
  },
  userId?: string
) {
  if (!userId) {
    console.error("사용자 ID가 제공되지 않았습니다");
    return;
  }

  try {
    // 1. 플랜 결정 (product_name 기반)
    let plan = "free";
    if (data.attributes.product_name === "Premium") {
      plan = "premium";
    }

    // 2. 서비스 접근 가능 상태 그룹핑
    // const serviceAllowed = ["active", "past_due", "cancelled"];
    const serviceBlocked = ["paused", "unpaid", "expired"];

    // 3. 상태에 따른 처리
    const lemonStatus = data.attributes.status; // 실제 LemonSqueezy status 저장

    // 4. 서비스 차단 상태인 경우 plan을 free로 처리
    if (serviceBlocked.includes(data.attributes.status)) {
      plan = "free";
    }

    // 5. users 테이블 업데이트
    const { error } = await serverSupabase
      .from("users")
      .update({
        plan: plan,
        lemon_status: lemonStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("사용자 구독 정보 업데이트 실패:", error);
    }
  } catch (error) {
    console.error("handleSubscriptionUpdated 오류:", error);
  }
}

async function handleSubscriptionPaymentSuccess(
  data: {
    id: string;
    attributes: {
      billing_reason: string;
      total: number;
      currency: string;
      status: string;
    };
  },
  userId?: string
) {
  if (!userId) {
    console.error("사용자 ID가 제공되지 않았습니다");
    return;
  }

  try {
    // billing_history에 결제 이력 저장
    const { error } = await serverSupabase.from("billing").insert({
      user_id: userId,
      lemonsqueezy_invoice_id: data.id,
      reason:
        data.attributes.billing_reason === "initial"
          ? "초기 구독"
          : "정기 결제",
      amount: parseFloat((data.attributes.total / 100).toFixed(2)), // LemonSqueezy sends in cents
      currency: data.attributes.currency,
    });

    if (error) {
      console.error("billing_history 저장 실패:", error);
    }
  } catch (error) {
    console.error("handleSubscriptionPaymentSuccess 오류:", error);
  }
}
