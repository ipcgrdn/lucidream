import { NextRequest, NextResponse } from "next/server";

interface TTSRequest {
  text: string;
  voice_id?: string;
  model_id?: string;
  voice_settings?: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

// 기본 음성 설정
const DEFAULT_VOICE_SETTINGS = {
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0.5,
  use_speaker_boost: true,
};

// 캐릭터별 음성 ID 매핑 (한국어 지원 음성들)
const CHARACTER_VOICES = {
  jessica: "54Cze5LrTSyLgbO6Fhlc",
  reina: "vGQNBgLaiM3EdZtxIiuY",
  sia: "kdmDKE6EkgrWrrykO9Qt",
  ren: "kdmDKE6EkgrWrrykO9Qt",
  hiyori: "vGQNBgLaiM3EdZtxIiuY",
  default: "kdmDKE6EkgrWrrykO9Qt",
};

export async function POST(request: NextRequest) {
  try {
    const {
      text,
      voice_id,
      model_id = "eleven_multilingual_v2",
      voice_settings,
    }: TTSRequest = await request.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ElevenLabs API key not configured" },
        { status: 500 }
      );
    }

    // 애니메이션 태그 제거
    const cleanText = text.replace(/\[ANIMATION:[^\]]*\]/g, "").trim();
    if (!cleanText) {
      return NextResponse.json(
        { error: "No valid text content after cleaning" },
        { status: 400 }
      );
    }

    // 기본 음성 ID 사용
    const finalVoiceId = voice_id || CHARACTER_VOICES.default;
    const finalVoiceSettings = { ...DEFAULT_VOICE_SETTINGS, ...voice_settings };

    // ElevenLabs API 호출
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${finalVoiceId}`,
      {
        method: "POST",
        headers: {
          Accept: "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: model_id,
          voice_settings: finalVoiceSettings,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", response.status, errorText);
      return NextResponse.json(
        { error: `ElevenLabs API error: ${response.status}` },
        { status: response.status }
      );
    }

    // 오디오 데이터를 ArrayBuffer로 받기
    const audioBuffer = await response.arrayBuffer();

    // 응답 헤더 설정
    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000", // 1년 캐시
      },
    });
  } catch (error) {
    console.error("TTS API error:", error);
    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 }
    );
  }
}
