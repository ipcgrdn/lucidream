import { supabase } from "@/lib/supabase";

export interface DreamChat {
  id: string;
  dream_id: string;
  message: string;
  type: "user" | "character";
  created_at?: string;
  metadata?: {};
}

export async function getChatsByDreamId(dreamId: string): Promise<DreamChat[]> {
  try {
    const { data: chats, error } = await supabase
      .from("dream_chats")
      .select("*")
      .eq("dream_id", dreamId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("채팅 조회 에러:", error);
      return [];
    }

    return chats || [];
  } catch (error) {
    console.error("getChatsByDreamId 에러:", error);
    return [];
  }
}

export async function saveChatMessage(
  dreamId: string,
  message: string,
  type: "user" | "character",
  metadata: {} = {}
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
