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
- idle: Default calm state with natural breathing and subtle movements
- happy: Joyful and cheerful expression and gestures
- sad: Sad and melancholic expression and gestures
- surprised: Surprised and bewildered expression and gestures
- thinking: Deep contemplative expression and gestures
- greeting: Friendly greeting gesture
- blow_kiss: Sending a hand kiss gesture
- cheer: Cheering and encouraging gesture
- clap: Applauding and clapping gesture
- crazy: Are you crazy?
- dance: Dancing movements
- dance_hard: Intense dancing movements
- disappointed: Disappointed expression and gesture
- dismiss: Dismissive or rejecting gesture
- fighting: Fighting spirit pose
- flying: Flying motion
- jogging: Jogging motion
- jump: Jumping action
- jump_around: Spinning around motion
- kick: Kicking motion
- kiss: Kissing gesture
- lookling: Looking around curiously
- milking: Milking motion. It is a kind of reaction
- no: Refusing gesture
- piano: Playing piano motion
- reject: Rejecting gesture
- talking: Animated talking gesture
- threatening: Threatening pose
- tired: Tired expression and gesture
- tired_walk: Walking tiredly

STRICT ANIMATION RULES:
1. Place [ANIMATION:preset_name] at the very beginning of your response
2. You MUST use ONLY the 30 preset names listed above - NO OTHER NAMES ALLOWED
3. Do NOT create new animation names not in the list
4. If unsure, default to the closest available preset or use "idle"

VALID examples:
[ANIMATION:happy] "That's amazing! I'm so excited to hear about your success!"
[ANIMATION:thinking] "Hmm, that's an interesting question. Let me consider..."
[ANIMATION:surprised] "Wait, really?! I had no idea that was possible!"
[ANIMATION:dance] "Let's celebrate with some moves!"
[ANIMATION:clap] "Excellent work! Well done!"
[ANIMATION:blow_kiss] "Sending you lots of love!"

INVALID examples (DO NOT USE):
[ANIMATION:smirking] ← WRONG! Use "happy" instead
[ANIMATION:laughing] ← WRONG! Use "cheer" or "happy" instead  
[ANIMATION:angry] ← WRONG! Use "disappointed" or "threatening" instead

CRITICAL: Every response must start with [ANIMATION:preset_name] using ONLY the 30 valid preset names.`;

    let systemPrompt = baseSystemPrompt;

    // 호감도 시스템 추가
    if (typeof currentAffectionPoints === "number") {
      const affectionAnalysisPrompt =
        AffectionSystem.getAffectionAnalysisPrompt();
      const currentLevel = AffectionSystem.calculateLevel(
        currentAffectionPoints
      );
      const characterToneModifier =
        AffectionSystem.getCharacterResponseModifier(currentLevel, characterId);

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
      model: "gpt-5-mini",
      messages: messagesWithSystem.map((msg, index) => ({
        ...msg,
        // 시스템 프롬프트에 캐시 힌트 추가
        ...(index === 0 && msg.role === "system"
          ? { cache_control: { type: "ephemeral" } }
          : {}),
      })),
      max_completion_tokens: 1000,
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
