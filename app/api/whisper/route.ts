import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // FormData에서 오디오 파일 추출
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: "Audio file is required" },
        { status: 400 }
      );
    }

    // Whisper API 호출
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      // language 파라미터 제거 시 자동 언어 감지
    });

    return NextResponse.json({
      text: transcription.text,
      success: true,
    });
  } catch (error) {
    console.error("Whisper API error:", error);
    return NextResponse.json(
      { error: "Failed to transcribe audio" },
      { status: 500 }
    );
  }
}