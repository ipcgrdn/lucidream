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

// 기본 음성 설정 (영어/기타 언어용)
const DEFAULT_VOICE_SETTINGS = {
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0.5,
  use_speaker_boost: true,
};

// 한국어 최적화 음성 설정
const KOREAN_VOICE_SETTINGS = {
  stability: 0.75, // 더 안정적인 발음
  similarity_boost: 0.85, // 음성 특성 강화
  style: 0.5, // 자연스러운 억양 유지
  use_speaker_boost: true,
};

// 음성 ID 설정
const DEFAULT_VOICE_ID = "kdmDKE6EkgrWrrykO9Qt"; // 영어/기타 언어용 기본 음성
const KOREAN_VOICE_ID = "uyVNoMrnUku1dZyVEXwD"; // 한국어 최고 모델

// 한국어 텍스트 감지 함수
function detectKorean(text: string): boolean {
  // 한글 문자가 포함되어 있는지 확인
  const koreanRegex = /[가-힣]/;
  return koreanRegex.test(text);
}

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

    // 한국어 감지
    const isKorean = detectKorean(cleanText);

    // 언어에 따른 음성 ID 및 설정 선택
    let finalVoiceId: string;
    let finalVoiceSettings: typeof DEFAULT_VOICE_SETTINGS;

    if (voice_id) {
      // 사용자가 특정 음성을 지정한 경우 우선 사용
      finalVoiceId = voice_id;
      finalVoiceSettings = isKorean
        ? { ...KOREAN_VOICE_SETTINGS, ...voice_settings }
        : { ...DEFAULT_VOICE_SETTINGS, ...voice_settings };
    } else {
      // 언어에 따른 자동 선택
      finalVoiceId = isKorean ? KOREAN_VOICE_ID : DEFAULT_VOICE_ID;
      finalVoiceSettings = isKorean
        ? { ...KOREAN_VOICE_SETTINGS, ...voice_settings }
        : { ...DEFAULT_VOICE_SETTINGS, ...voice_settings };
    }

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
