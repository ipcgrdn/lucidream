import { supabase } from "@/lib/supabase";

export interface DreamChat {
  id: string;
  dream_id: string;
  message: string;
  type: "user" | "character";
  created_at?: string;
  metadata?: "";
}

export async function getChatsByDreamIdPaginated(
  dreamId: string,
  limit: number = 20,
  offset: number = 0
): Promise<{ chats: DreamChat[]; hasMore: boolean }> {
  try {
    // limit + 1을 가져와서 hasMore 판단
    const { data: chats, error } = await supabase
      .from("dream_chats")
      .select("*")
      .eq("dream_id", dreamId)
      .order("created_at", { ascending: false }) // 최신 순으로 정렬
      .range(offset, offset + limit);

    if (error) {
      console.error("채팅 조회 에러:", error);
      return { chats: [], hasMore: false };
    }

    const hasMore = (chats?.length || 0) > limit;
    const resultChats = hasMore ? chats?.slice(0, limit) || [] : chats || [];

    return {
      chats: resultChats.reverse(), // 시간 순으로 다시 정렬
      hasMore,
    };
  } catch (error) {
    console.error("getChatsByDreamIdPaginated 에러:", error);
    return { chats: [], hasMore: false };
  }
}

export async function saveChatMessage(
  dreamId: string,
  message: string,
  type: "user" | "character",
  metadata: string = ""
): Promise<DreamChat | null> {
  try {
    const { data: chat, error } = await supabase
      .from("dream_chats")
      .insert({
        dream_id: dreamId,
        message,
        type,
        metadata,
      })
      .select()
      .single();

    if (error) {
      console.error("채팅 저장 에러:", error);
      return null;
    }

    return chat;
  } catch (error) {
    console.error("saveChatMessage 에러:", error);
    return null;
  }
}
