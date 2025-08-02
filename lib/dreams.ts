import { supabase } from "@/lib/supabase";

export interface Dream {
  id: string;
  user_id: string;
  character_id: string;
  created_at?: string;
  updated_at?: string;
}

export async function findOrCreateDream(
  userId: string,
  characterId: string
): Promise<Dream | null> {
  try {
    // 기존 dream 확인
    const { data: existingDreams, error: findError } = await supabase
      .from("dreams")
      .select("*")
      .eq("user_id", userId)
      .eq("character_id", characterId)
      .limit(1);

    if (findError) {
      console.error("Dream 조회 에러:", findError);
      return null;
    }

    // 기존 dream이 있으면 반환
    if (existingDreams && existingDreams.length > 0) {
      return existingDreams[0];
    }

    // 없으면 새로 생성
    const { data: newDream, error: createError } = await supabase
      .from("dreams")
      .insert({
        user_id: userId,
        character_id: characterId,
      })
      .select()
      .single();

    if (createError) {
      console.error("Dream 생성 에러:", createError);
      return null;
    }

    return newDream;
  } catch (error) {
    console.error("findOrCreateDream 에러:", error);
    return null;
  }
}

export async function getDreamById(dreamId: string): Promise<Dream | null> {
  try {
    const { data: dream, error } = await supabase
      .from("dreams")
      .select("*")
      .eq("id", dreamId)
      .single();

    if (error) {
      console.error("Dream 조회 에러:", error);
      return null;
    }

    return dream;
  } catch (error) {
    console.error("getDreamById 에러:", error);
    return null;
  }
}

export async function getDreamsByUserId(userId: string): Promise<Dream[]> {
  try {
    const { data: dreams, error } = await supabase
      .from("dreams")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("사용자 Dreams 조회 에러:", error);
      return [];
    }

    return dreams || [];
  } catch (error) {
    console.error("getDreamsByUserId 에러:", error);
    return [];
  }
}
