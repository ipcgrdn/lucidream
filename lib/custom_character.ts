import { supabase } from "./supabase";
import { getUserBackgrounds } from "./dream_backgrounds";
import { getCharacterById, Character } from "./characters";

// Custom Character Database Interface
export interface CustomCharacter {
  id: string;
  user_id: string;
  name: string;
  description: string;
  personality: string;
  traits: string[];
  system_prompt: string;
  preview_image_url: string;
  vrm_model_url: string;
  background_image_url: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Form data interface from CreateCharacterModal
export interface CustomCharacterFormData {
  name: string;
  description: string;
  personality: string;
  traits: string[];
  systemPrompt: string;
  previewImage: File;
  // VRM selection
  selectedDefaultVrm: string | null;
  vrmModel: File | null;
  // Background selection
  selectedDefaultBackground: string | null;
  selectedUserBackground: string | null;
  backgroundImage: File | null;
}

// Default assets mappings
export const DEFAULT_VRM_MODELS = {
  reina: "/models/reina.vrm",
  sia: "/models/sia.vrm",
  jessica: "/models/jessica.vrm",
  hiyori: "/models/hiyori.vrm",
  ren: "/models/ren.vrm",
};

export const DEFAULT_BACKGROUNDS = {
  reina1: "/background/reina.png",
  reina2: "/background/reina2.png",
  sia1: "/background/sia.png",
  sia2: "/background/sia2.png",
  jessica1: "/background/jessica.png",
  jessica2: "/background/jessica2.png",
  hiyori1: "/background/hiyori.png",
  hiyori2: "/background/hiyori2.png",
  ren1: "/background/ren.png",
  ren2: "/background/ren2.png",
};

/**
 * Upload file to Supabase storage
 */
async function uploadFileToStorage(
  file: File,
  bucketName: string,
  userId: string,
  characterId: string,
  fileType: string
): Promise<string | null> {
  try {
    const timestamp = Date.now();
    const fileExt = file.name.split(".").pop();
    const fileName = `${fileType}_${timestamp}.${fileExt}`;
    const filePath = `${userId}/${characterId}/${fileName}`;

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error(`Error uploading ${fileType}:`, uploadError);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return urlData?.publicUrl || null;
  } catch (error) {
    console.error(`Error in uploadFileToStorage (${fileType}):`, error);
    return null;
  }
}

/**
 * Get user's custom characters
 */
export async function getUserCustomCharacters(
  userId: string
): Promise<CustomCharacter[]> {
  try {
    if (!userId) {
      console.error("User ID is required");
      return [];
    }

    const { data, error } = await supabase
      .from("custom_characters")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching custom characters:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getUserCustomCharacters:", error);
    return [];
  }
}

/**
 * Get custom character by ID
 */
export async function getCustomCharacterById(
  characterId: string,
  userId: string
): Promise<CustomCharacter | null> {
  try {
    if (!userId) {
      console.error("User ID is required");
      return null;
    }

    const { data, error } = await supabase
      .from("custom_characters")
      .select("*")
      .eq("id", characterId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching custom character:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getCustomCharacterById:", error);
    return null;
  }
}

/**
 * Create a new custom character
 */
export async function createCustomCharacter(
  formData: CustomCharacterFormData,
  userId: string
): Promise<CustomCharacter | null> {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    // Generate character ID for file paths
    const characterId = crypto.randomUUID();

    // Upload preview image (required)
    const previewImageUrl = await uploadFileToStorage(
      formData.previewImage,
      "custom-character-previews",
      userId,
      characterId,
      "preview"
    );

    if (!previewImageUrl) {
      throw new Error("Failed to upload preview image");
    }

    let vrmModelUrl = "";
    let backgroundImageUrl = "";

    // Handle VRM model (default or uploaded)
    if (formData.selectedDefaultVrm) {
      vrmModelUrl =
        DEFAULT_VRM_MODELS[
          formData.selectedDefaultVrm as keyof typeof DEFAULT_VRM_MODELS
        ];
    } else if (formData.vrmModel) {
      const uploadedVrmUrl = await uploadFileToStorage(
        formData.vrmModel,
        "custom-character-vrms",
        userId,
        characterId,
        "model"
      );
      if (!uploadedVrmUrl) {
        throw new Error("Failed to upload VRM model");
      }
      vrmModelUrl = uploadedVrmUrl;
    } else {
      throw new Error("VRM model is required");
    }

    // Handle background image (default, user existing, or new upload)
    if (formData.selectedDefaultBackground) {
      backgroundImageUrl =
        DEFAULT_BACKGROUNDS[
          formData.selectedDefaultBackground as keyof typeof DEFAULT_BACKGROUNDS
        ];
    } else if (formData.selectedUserBackground) {
      // Get user background URL from dream_backgrounds table
      const userBackgrounds = await getUserBackgrounds();
      const selectedBg = userBackgrounds.find(
        (bg) => bg.id === formData.selectedUserBackground
      );
      if (!selectedBg) {
        throw new Error("Selected user background not found");
      }
      backgroundImageUrl = selectedBg.public_url;
    } else if (formData.backgroundImage) {
      const uploadedBgUrl = await uploadFileToStorage(
        formData.backgroundImage,
        "custom-character-backgrounds",
        userId,
        characterId,
        "background"
      );
      if (!uploadedBgUrl) {
        throw new Error("Failed to upload background image");
      }
      backgroundImageUrl = uploadedBgUrl;
    } else {
      throw new Error("Background image is required");
    }

    // Insert into database
    const { data, error } = await supabase
      .from("custom_characters")
      .insert({
        id: characterId,
        user_id: userId,
        name: formData.name,
        description: formData.description,
        personality: formData.personality,
        traits: formData.traits,
        system_prompt: formData.systemPrompt,
        preview_image_url: previewImageUrl,
        vrm_model_url: vrmModelUrl,
        background_image_url: backgroundImageUrl,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      // Clean up uploaded files if database insert fails
      if (previewImageUrl.includes("custom-character-previews")) {
        await supabase.storage
          .from("custom-character-previews")
          .remove([
            `${userId}/${characterId}/preview_${Date.now()}.${formData.previewImage.name
              .split(".")
              .pop()}`,
          ]);
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error creating custom character:", error);
    return null;
  }
}

/**
 * Update custom character
 */
export async function updateCustomCharacter(
  characterId: string,
  updates: Partial<CustomCharacterFormData>,
  userId: string
): Promise<CustomCharacter | null> {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    // Get existing character
    const existing = await getCustomCharacterById(characterId, userId);
    if (!existing) {
      throw new Error("Character not found");
    }

    const updateData: Partial<CustomCharacter> = {};

    // Handle basic text updates
    if (updates.name) updateData.name = updates.name;
    if (updates.description) updateData.description = updates.description;
    if (updates.personality) updateData.personality = updates.personality;
    if (updates.traits) updateData.traits = updates.traits;
    if (updates.systemPrompt) updateData.system_prompt = updates.systemPrompt;

    // Handle file updates (simplified version - can be expanded)
    // For now, we'll just handle text updates

    const { data, error } = await supabase
      .from("custom_characters")
      .update(updateData)
      .eq("id", characterId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error updating custom character:", error);
    return null;
  }
}

/**
 * Delete (hard delete) custom character
 */
export async function deleteCustomCharacter(
  characterId: string,
  userId: string
): Promise<boolean> {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    // Get character info before deletion for file cleanup
    const character = await getCustomCharacterById(characterId, userId);
    if (!character) {
      throw new Error("Character not found");
    }

    // Delete from database first
    const { error } = await supabase
      .from("custom_characters")
      .delete()
      .eq("id", characterId)
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    // Clean up uploaded files (if they're custom uploads, not default assets)
    try {
      // Clean up preview image if it's a custom upload
      if (character.preview_image_url.includes("custom-character-previews")) {
        const previewPath = character.preview_image_url.split(
          "/custom-character-previews/"
        )[1];
        if (previewPath) {
          await supabase.storage
            .from("custom-character-previews")
            .remove([previewPath]);
        }
      }

      // Clean up VRM model if it's a custom upload
      if (character.vrm_model_url.includes("custom-character-vrms")) {
        const vrmPath = character.vrm_model_url.split(
          "/custom-character-vrms/"
        )[1];
        if (vrmPath) {
          await supabase.storage
            .from("custom-character-vrms")
            .remove([vrmPath]);
        }
      }

      // Clean up background image if it's a custom upload
      if (
        character.background_image_url.includes("custom-character-backgrounds")
      ) {
        const bgPath = character.background_image_url.split(
          "/custom-character-backgrounds/"
        )[1];
        if (bgPath) {
          await supabase.storage
            .from("custom-character-backgrounds")
            .remove([bgPath]);
        }
      }
    } catch (fileError) {
      console.warn("Error cleaning up files:", fileError);
      // Don't fail the entire operation if file cleanup fails
    }

    return true;
  } catch (error) {
    console.error("Error deleting custom character:", error);
    return false;
  }
}

/**
 * CustomCharacter를 Character 인터페이스 형태로 변환하는 헬퍼 함수
 */
export function convertCustomCharacterToCharacter(
  customChar: CustomCharacter
): Character {
  return {
    id: customChar.id,
    name: customChar.name,
    description: customChar.description,
    previewImage: customChar.preview_image_url,
    vrmModel: customChar.vrm_model_url,
    backgroundImage: customChar.background_image_url,
    personality: customChar.personality,
    traits: customChar.traits,
    systemPrompt: customChar.system_prompt,
  };
}

/**
 * 통합 캐릭터 조회 함수 - 기본 캐릭터와 커스텀 캐릭터를 모두 검색
 */
export async function getCharacterByIdUnified(
  characterId: string,
  userId?: string
): Promise<Character | null> {
  try {
    // 먼저 기본 캐릭터에서 찾기
    const defaultCharacter = getCharacterById(characterId);
    if (defaultCharacter) {
      return defaultCharacter;
    }

    // 기본 캐릭터에 없고 userId가 있으면 커스텀 캐릭터에서 찾기
    if (userId) {
      const customCharacter = await getCustomCharacterById(characterId, userId);
      if (customCharacter) {
        return convertCustomCharacterToCharacter(customCharacter);
      }
    }

    return null;
  } catch (error) {
    console.error("Error in getCharacterByIdUnified:", error);
    return null;
  }
}
