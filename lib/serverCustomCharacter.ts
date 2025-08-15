// 서버 전용 커스텀 캐릭터 함수들
// 클라이언트에서 import하면 안 됨! 서버 컴포넌트/API에서만 사용

import { serverSupabase } from "./serverSupabase";
import { getCharacterById, Character } from "./characters";
import { CustomCharacter } from "./custom_character";
import { getPremiumCharacterById, PremiumCharacter } from "./premium_characters";

/**
 * 서버에서 커스텀 캐릭터를 조회하는 함수 (Service Role 사용)
 */
export async function getCustomCharacterByIdServer(
  characterId: string,
  userId: string
): Promise<CustomCharacter | null> {
  try {
    if (!userId) {
      console.error("User ID is required");
      return null;
    }

    const { data, error } = await serverSupabase
      .from("custom_characters")
      .select("*")
      .eq("id", characterId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching custom character (server):", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getCustomCharacterByIdServer:", error);
    return null;
  }
}

/**
 * CustomCharacter를 Character 인터페이스 형태로 변환하는 헬퍼 함수
 */
function convertCustomCharacterToCharacter(
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
    created_at: customChar.created_at,
  };
}

/**
 * PremiumCharacter를 Character 인터페이스 형태로 변환하는 헬퍼 함수
 */
function convertPremiumCharacterToCharacter(
  premiumChar: PremiumCharacter
): Character {
  return {
    id: premiumChar.id,
    name: premiumChar.name,
    description: premiumChar.description,
    previewImage: premiumChar.previewImage,
    vrmModel: premiumChar.vrmModel,
    backgroundImage: premiumChar.backgroundImage,
    personality: premiumChar.personality,
    traits: premiumChar.traits,
    systemPrompt: premiumChar.systemPrompt,
    created_at: premiumChar.created_at,
  };
}

/**
 * 서버에서 통합 캐릭터 조회 함수 - 기본 캐릭터, 프리미엄 캐릭터, 커스텀 캐릭터를 모두 검색
 */
export async function getCharacterByIdUnifiedServer(
  characterId: string,
  userId?: string
): Promise<Character | null> {
  try {
    // 먼저 기본 캐릭터에서 찾기
    const defaultCharacter = getCharacterById(characterId);
    if (defaultCharacter) {
      return defaultCharacter;
    }

    // 프리미엄 캐릭터에서 찾기
    const premiumCharacter = getPremiumCharacterById(characterId);
    if (premiumCharacter) {
      return convertPremiumCharacterToCharacter(premiumCharacter);
    }

    // 기본 캐릭터와 프리미엄 캐릭터에 없고 userId가 있으면 커스텀 캐릭터에서 찾기 (서버용)
    if (userId) {
      const customCharacter = await getCustomCharacterByIdServer(
        characterId,
        userId
      );
      if (customCharacter) {
        return convertCustomCharacterToCharacter(customCharacter);
      }
    }

    return null;
  } catch (error) {
    console.error("Error in getCharacterByIdUnifiedServer:", error);
    return null;
  }
}
