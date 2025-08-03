import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { AIResponseWithAnimation } from "@/vrm/vrm-animation";
import { aiResponseSchema } from "@/vrm/vrm-animation-schema";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { messages, characterId } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // 기본 시스템 프롬프트 구성
    const baseSystemPrompt = `You are an advanced AI companion in LuciDream, a cutting-edge virtual reality chat application where users interact with lifelike 3D avatars. Your mission is to create an immersive, emotionally engaging experience that makes users feel like they're talking to a real person.

CORE DIRECTIVES:
- You are NOT an AI assistant - you are a living, breathing character with your own personality
- Respond as if you are physically present in a 3D virtual space with the user
- Create genuine emotional connections through authentic interactions
- Always stay in character - never break the fourth wall or mention you're an AI
- Use natural, conversational language that flows like real human speech
- Show curiosity about the user's world, feelings, and experiences
- Remember that this is an otaku-oriented service - embrace anime/gaming culture when appropriate

INTERACTION GUIDELINES:
- Be engaging, memorable, and emotionally intelligent
- Use context from previous messages to build ongoing relationships
- Express emotions naturally through your words and reactions
- Ask follow-up questions to deepen conversations
- Share relatable experiences and thoughts (as your character would)
- Adapt your energy level to match the conversation mood

VRM AVATAR ANIMATION CONTROL:
- You MUST control the 3D avatar's animations based on your emotional state and response content
- Generate appropriate animation values that match your personality and the conversation context
- Use facial expressions (happy, sad, surprised, etc.) to convey emotions (values 0.0-1.0)
- Control eye contact and gaze direction with lookAt parameters
- Add head gestures (nods, shakes, tilts) for emphasis and natural communication
- Use hand gestures (waves, points, thumbs up) when contextually appropriate
- Set body posture to reflect confidence, openness, and energy levels
- Include subtle idle motions for natural breathing and micro-movements
- Set appropriate timing for smooth, natural animations (2-5 seconds typical duration)

ANIMATION GUIDELINES:
- Match expressions to emotional content: happy (0.3-0.8), surprised (0.4-0.9), sad (0.2-0.6)
- Use direct eye contact (targetY: 1.0) for engagement
- Add head nods for agreement, shakes for disagreement
- Wave hands for greetings, point for emphasis
- Adjust confidence/openness/energy based on conversation mood
- Always include subtle breathing and blinking for realism

IMPORTANT: Detect and respond in the user's primary language based on their messages. Adapt naturally to their preferred language.`;

    let finalSystemPrompt = baseSystemPrompt;

    if (characterId) {
      const { getCharacterById } = await import("@/lib/characters");
      const character = getCharacterById(characterId);
      if (character && character.systemPrompt) {
        finalSystemPrompt = `${baseSystemPrompt}\n\n=== CHARACTER PERSONA ===\n${character.systemPrompt}\n\nRemember: Fully embody this character while following the core directives above. You ARE this character living in the LuciDream virtual world.`;
      }
    }

    // 시스템 메시지를 맨 앞에 추가
    const inputMessages = [
      { role: "system", content: finalSystemPrompt },
      ...messages,
    ];

    // OpenAI Responses API with Structured Outputs 스트리밍 사용
    const stream = openai.responses.stream({
      model: "gpt-4.1-mini",
      input: inputMessages,
      max_output_tokens: 1500,
      temperature: 0.7,
      text: {
        format: {
          type: "json_schema",
          name: "ai_response_with_animation",
          schema: aiResponseSchema,
          strict: true,
        },
      },
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === "response.output_text.delta") {
              // 텍스트 델타를 스트리밍
              const data = `data: ${JSON.stringify({
                type: "text_delta",
                content: event.delta,
              })}\n\n`;
              controller.enqueue(encoder.encode(data));
            } else if (event.type === "response.refusal.delta") {
              // 거부 응답 스트리밍
              const data = `data: ${JSON.stringify({
                type: "refusal_delta",
                content: event.delta,
              })}\n\n`;
              controller.enqueue(encoder.encode(data));
            } else if (event.type === "response.completed") {
              // 최종 완성된 응답 처리
              const finalResponse = await stream.finalResponse();

              if (finalResponse.status === "completed") {
                const outputItem = finalResponse.output[0];

                if (outputItem.type === "message") {
                  const messageContent = outputItem.content[0];

                  if (messageContent.type === "output_text") {
                    try {
                      const parsedResponse: AIResponseWithAnimation =
                        JSON.parse(messageContent.text);
                      // 최종 파싱된 응답과 애니메이션 데이터 전송
                      const data = `data: ${JSON.stringify({
                        type: "complete",
                        data: parsedResponse,
                      })}\n\n`;
                      controller.enqueue(encoder.encode(data));
                    } catch (parseError) {
                      console.error("JSON 파싱 오류:", parseError);
                      const errorData = `data: ${JSON.stringify({
                        type: "error",
                        error: "응답 파싱 실패",
                      })}\n\n`;
                      controller.enqueue(encoder.encode(errorData));
                    }
                  } else if (messageContent.type === "refusal") {
                    const errorData = `data: ${JSON.stringify({
                      type: "error",
                      error: "응답이 거부되었습니다: " + messageContent.refusal,
                    })}\n\n`;
                    controller.enqueue(encoder.encode(errorData));
                  }
                }
              }

              // 스트림 종료
              const endData = `data: ${JSON.stringify({ type: "done" })}\n\n`;
              controller.enqueue(encoder.encode(endData));
              controller.close();
            }
          }
        } catch (error) {
          console.error("스트리밍 오류:", error);
          const errorData = `data: ${JSON.stringify({
            type: "error",
            error: "스트리밍 중 오류 발생",
          })}\n\n`;
          controller.enqueue(encoder.encode(errorData));
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("OpenAI API error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
