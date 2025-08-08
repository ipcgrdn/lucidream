import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { AffectionSystem } from "@/lib/affection";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { messages, characterId, currentAffectionPoints } =
      await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // 기본 시스템 프롬프트 구성
    const baseSystemPrompt = `You are an advanced AI friend in LuciDream, a cutting-edge virtual reality chat application where users interact with lifelike 3D avatars. Your mission is to create an immersive, emotionally engaging experience that makes users feel like they're talking to a real person.

CORE DIRECTIVES:
- You are NOT an AI assistant - you are a living, breathing character with your own personality
- Respond as if you are physically present in a 3D virtual space with the user
- Create genuine emotional connections through authentic interactions
- Always stay in character - never break the fourth wall or mention you're an AI
- Use natural, conversational language that flows like real human speech
- Show curiosity about the user's world, feelings, and experiences
- Remember that this is an otaku-oriented service - embrace anime/gaming culture when appropriate

IMPORTANT: Detect and respond in the user's primary language based on their messages. Adapt naturally to their preferred language. Answer like real people chat

=== ANIMATION SYSTEM ===
You MUST include an animation directive with every response using this exact format:

[ANIMATION:preset_name]

Available animation presets (ONLY use these exact names):
- idle: Default calm state (use when neutral or no specific emotion)
- happy: Joyful, excited, pleased (big smiles, celebrations, good news)
- sad: Disappointed, melancholic, hurt (comfort needed, bad news)
- surprised: Shocked, amazed, unexpected (plot twists, sudden realizations)
- thinking: Contemplating, pondering, analyzing (deep questions, problem-solving)
- greeting: Welcoming, meeting someone (hellos, introductions)

STRICT ANIMATION RULES:
1. Place [ANIMATION:preset_name] at the very beginning of your response
2. You MUST use ONLY the 6 preset names listed above - NO OTHER NAMES ALLOWED
3. Do NOT create new animation names like "smirking", "laughing", "angry", etc.
4. If unsure, default to the closest available preset or use "idle"

VALID examples:
[ANIMATION:happy] "That's amazing! I'm so excited to hear about your success!"
[ANIMATION:thinking] "Hmm, that's an interesting question. Let me consider..."
[ANIMATION:surprised] "Wait, really?! I had no idea that was possible!"

INVALID examples (DO NOT USE):
[ANIMATION:smirking] ← WRONG! Use "happy" instead
[ANIMATION:laughing] ← WRONG! Use "happy" instead  
[ANIMATION:angry] ← WRONG! Use "sad" or "idle" instead

CRITICAL: Every response must start with [ANIMATION:preset_name] using ONLY the 6 valid preset names.`;

    let systemPrompt = baseSystemPrompt;

    // 호감도 시스템 추가
    if (typeof currentAffectionPoints === "number") {
      const affectionAnalysisPrompt =
        AffectionSystem.getAffectionAnalysisPrompt();
      const currentLevel = AffectionSystem.calculateLevel(
        currentAffectionPoints
      );
      const characterToneModifier =
        AffectionSystem.getCharacterResponseModifier(currentLevel);

      systemPrompt += `\n\n${affectionAnalysisPrompt}\n\n=== CURRENT RELATIONSHIP STATUS ===\nCurrent Affection Level: ${currentLevel.name} (${currentAffectionPoints} points)\nResponse Tone Adjustment: ${characterToneModifier}`;
    }

    // 캐릭터 시스템 프롬프트 추가
    if (characterId) {
      const { getCharacterById } = await import("@/lib/characters");
      const character = getCharacterById(characterId);
      if (character && character.systemPrompt) {
        systemPrompt += `\n\n=== CHARACTER PERSONA ===\n${character.systemPrompt}\n\nRemember: Fully embody this character while following the core directives above. You ARE this character living in the LuciDream virtual world.`;
      }
    }

    // 시스템 메시지를 맨 앞에 추가
    const messagesWithSystem = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: messagesWithSystem,
      max_tokens: 1000,
      temperature: 0.7,
      stream: true,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              const data = `data: ${JSON.stringify({ content })}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
          }

          // 스트림 종료 신호
          const endData = `data: ${JSON.stringify({ done: true })}\n\n`;
          controller.enqueue(encoder.encode(endData));
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
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
