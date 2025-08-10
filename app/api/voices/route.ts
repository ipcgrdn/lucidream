import { NextResponse } from "next/server";

interface Voice {
  voice_id: string;
  name: string;
  samples:
    | {
        sample_id: string;
        file_name: string;
        mime_type: string;
        size_bytes: number;
        hash: string;
      }[]
    | null;
  category: string;
  fine_tuning: {
    language: string;
    is_allowed_to_fine_tune: boolean;
    finetuning_requested: boolean;
    finetuning_state: string;
    verification_attempts: any[] | null;
    verification_failures: string[];
    verification_attempts_count: number;
    slice_ids: string[] | null;
  };
  labels: {
    [key: string]: string;
  };
  description: string;
  preview_url: string;
  available_for_tiers: string[];
  settings: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  } | null;
  sharing: {
    status: string;
    history_item_sample_id: string | null;
    original_voice_id: string | null;
    public_owner_id: string | null;
    liked_by_count: number;
    cloned_by_count: number;
    name: string;
    description: string;
    labels: {
      [key: string]: string;
    };
    created_at: string;
    notice_period: number;
  } | null;
  high_quality_base_model_ids: string[];
  safety_control: string | null;
  voice_verification: {
    requires_verification: boolean;
    is_verified: boolean;
    verification_failures: string[];
    verification_attempts_count: number;
    language: string | null;
    verification_attempts: any[] | null;
  };
  owner_id: string | null;
  permission_on_resource: string | null;
}

interface VoicesResponse {
  voices: Voice[];
}

export async function GET() {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ElevenLabs API key not configured" },
        { status: 500 }
      );
    }

    // ElevenLabs API에서 음성 목록 가져오기
    const response = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: {
        "xi-api-key": apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", response.status, errorText);
      return NextResponse.json(
        { error: `ElevenLabs API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data: VoicesResponse = await response.json();

    // 기존 커스텀 음성 추가 (CHARACTER_VOICES에서 사용하던 것들)
    const customVoices = [
      {
        voice_id: "54Cze5LrTSyLgbO6Fhlc",
        name: "Cat",
        category: "custom",
        description: "Droll and dry",
        preview_url: "",
        labels: { gender: "female", accent: "american" },
        settings: null,
      },
      {
        voice_id: "vGQNBgLaiM3EdZtxIiuY",
        name: "Kawaii Aerisita",
        category: "custom",
        description: "Cute and sweet",
        preview_url: "",
        labels: { gender: "female", accent: "american" },
        settings: null,
      },
      {
        voice_id: "kdmDKE6EkgrWrrykO9Qt",
        name: "Alexandra",
        category: "custom",
        description: "Calm and collected",
        preview_url: "",
        labels: { gender: "neutral", accent: "american" },
        settings: null,
      },
    ];

    // API에서 받은 음성들 필터링하고 필요한 정보만 추출
    const apiVoices = data.voices
      .filter((voice) => {
        // premade 또는 cloned 음성만 포함
        return voice.category === "premade" || voice.category === "cloned";
      })
      .map((voice) => ({
        voice_id: voice.voice_id,
        name: voice.name,
        category: voice.category,
        description: voice.description,
        preview_url: voice.preview_url,
        labels: voice.labels,
        settings: voice.settings,
      }));

    // 커스텀 음성과 API 음성 합치기
    const availableVoices = [...customVoices, ...apiVoices].sort((a, b) => {
      // custom -> premade -> cloned 순으로 정렬
      const categoryOrder = { custom: 0, premade: 1, cloned: 2 };
      const aOrder =
        categoryOrder[a.category as keyof typeof categoryOrder] ?? 3;
      const bOrder =
        categoryOrder[b.category as keyof typeof categoryOrder] ?? 3;

      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({
      voices: availableVoices,
      total: availableVoices.length,
    });
  } catch (error) {
    console.error("Voices API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch voices" },
      { status: 500 }
    );
  }
}
