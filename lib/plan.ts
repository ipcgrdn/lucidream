import { supabase } from "./supabase";

export type UserPlan = "free" | "premium";

export interface UserPlanInfo {
  plan: UserPlan;
  status: string;
  isActive: boolean;
  credit: number;
}

/**
 * 사용자의 플랜 정보를 조회합니다.
 * status가 'active'가 아닌 경우 free 플랜으로 처리됩니다.
 */
export async function getUserPlan(userId: string): Promise<UserPlanInfo> {
  const { data, error } = await supabase
    .from("users")
    .select("plan, status, credit")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return {
      plan: "free",
      status: "active",
      isActive: true,
      credit: 0,
    };
  }

  const isActive = data.status === "active";
  const plan: UserPlan = isActive ? (data.plan as UserPlan) : "free";

  return {
    plan,
    status: data.status,
    isActive,
    credit: data.credit || 0,
  };
}

/**
 * 사용자가 프리미엄 플랜인지 확인합니다.
 */
export async function isPremiumUser(userId: string): Promise<boolean> {
  const planInfo = await getUserPlan(userId);
  return planInfo.plan === "premium" && planInfo.isActive;
}

/**
 * 사용자가 특정 플랜인지 확인합니다.
 */
export async function hasUserPlan(
  userId: string,
  targetPlan: UserPlan
): Promise<boolean> {
  const planInfo = await getUserPlan(userId);
  return planInfo.plan === targetPlan && planInfo.isActive;
}

/**
 * 사용자의 credit을 1 증가시킵니다.
 */
export async function incrementUserCredit(userId: string): Promise<boolean> {
  // 현재 credit 값을 가져온 후 1 증가
  const { data: userData, error: fetchError } = await supabase
    .from("users")
    .select("credit")
    .eq("id", userId)
    .single();

  if (fetchError || !userData) {
    return false;
  }

  const { error } = await supabase
    .from("users")
    .update({
      credit: (userData.credit || 0) + 1,
    })
    .eq("id", userId);

  return !error;
}

/**
 * 사용자가 채팅을 계속 사용할 수 있는지 확인합니다.
 * free 사용자는 100 credit까지, premium 사용자는 무제한
 */
export async function canUserSendMessage(userId: string): Promise<{
  canSend: boolean;
  remainingCredits?: number;
  reason?: string;
}> {
  const planInfo = await getUserPlan(userId);

  // Premium 사용자는 무제한
  if (planInfo.plan === "premium" && planInfo.isActive) {
    return { canSend: true };
  }

  // Free 사용자는 100 credit 제한
  const maxFreeCredits = 100;
  const remainingCredits = Math.max(0, maxFreeCredits - planInfo.credit);

  if (planInfo.credit >= maxFreeCredits) {
    return {
      canSend: false,
      remainingCredits: 0,
      reason:
        "Free user can only send 100 messages. Upgrade to Premium to remove this limit.",
    };
  }

  return {
    canSend: true,
    remainingCredits,
  };
}
