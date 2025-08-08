import { supabase } from "./supabase";

// 사용자 업로드 배경 타입
export interface UserBackground {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  public_url: string;
  created_at: string;
}

// 사용자의 업로드된 배경 이미지들 가져오기
export async function getUserBackgrounds(): Promise<UserBackground[]> {
  try {
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user.user) {
      console.error("User not authenticated:", userError);
      return [];
    }

    const { data, error } = await supabase
      .from("dream_backgrounds")
      .select("*")
      .eq("user_id", user.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user backgrounds:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getUserBackgrounds:", error);
    return [];
  }
}

// 배경 이미지 업로드
export async function uploadBackgroundImage(
  file: File
): Promise<string | null> {
  try {
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user.user) {
      throw new Error("User not authenticated");
    }

    // 파일명 생성 (중복 방지를 위해 timestamp 추가)
    const timestamp = Date.now();
    const fileExt = file.name.split(".").pop();
    const fileName = `${timestamp}.${fileExt}`;
    const filePath = `${user.user.id}/${fileName}`;

    // Storage에 파일 업로드
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("backgrounds")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Public URL 생성
    const { data: urlData } = supabase.storage
      .from("backgrounds")
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new Error("Failed to get public URL");
    }

    // 데이터베이스에 기록 저장
    const { error: dbError } = await supabase.from("dream_backgrounds").insert({
      user_id: user.user.id,
      file_name: fileName,
      file_path: filePath,
      public_url: urlData.publicUrl,
    });

    if (dbError) {
      // Storage에서 파일 삭제 (롤백)
      await supabase.storage.from("backgrounds").remove([filePath]);
      throw dbError;
    }

    return urlData.publicUrl;
  } catch (error) {
    console.error("Error uploading background:", error);
    return null;
  }
}

// 배경 이미지 삭제
export async function deleteBackgroundImage(
  backgroundId: string
): Promise<boolean> {
  try {
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user.user) {
      throw new Error("User not authenticated");
    }

    // 먼저 배경 정보 가져오기
    const { data: background, error: fetchError } = await supabase
      .from("dream_backgrounds")
      .select("*")
      .eq("id", backgroundId)
      .eq("user_id", user.user.id)
      .single();

    if (fetchError || !background) {
      throw new Error("Background not found or unauthorized");
    }

    // Storage에서 파일 삭제
    const { error: storageError } = await supabase.storage
      .from("backgrounds")
      .remove([background.file_path]);

    if (storageError) {
      console.error("Error deleting from storage:", storageError);
    }

    // 데이터베이스에서 기록 삭제
    const { error: dbError } = await supabase
      .from("dream_backgrounds")
      .delete()
      .eq("id", backgroundId)
      .eq("user_id", user.user.id);

    if (dbError) {
      throw dbError;
    }

    return true;
  } catch (error) {
    console.error("Error deleting background:", error);
    return false;
  }
}
