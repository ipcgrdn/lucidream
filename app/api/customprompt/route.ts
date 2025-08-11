import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface CustomPromptRequest {
  name: string;
  description: string;
  personality: string;
  traits: string[];
  systemPrompt: string;
}

export async function POST(request: NextRequest) {
  try {
    const {
      name,
      description,
      personality,
      traits,
      systemPrompt,
    }: CustomPromptRequest = await request.json();

    if (!name || !description || !personality || !traits?.length) {
      return NextResponse.json(
        { error: "모든 필드가 필요합니다" },
        { status: 400 }
      );
    }

    const systemMessage = `You are an expert character designer specializing in creating immersive, psychologically compelling AI personas for virtual reality interactions. Your task is to transform basic character concepts into sophisticated, multi-dimensional personas that captivate users.

EXPERTISE DOMAINS:
- Advanced prompt engineering techniques
- Psychological character development
- Interactive storytelling and roleplay mechanics
- User engagement optimization
- Emotional intelligence design

REFERENCE QUALITY STANDARD:
Create system prompts matching the sophistication of professional VR character designs, with clear communication styles, behavioral patterns, and emotional depth that creates genuine user attachment.`;

    const userPrompt = `**TASK:** Create a professional English system prompt for an AI character based on user input.

**CHARACTER INFORMATION:**
Name: ${name}
Description: ${description}
Personality: ${personality}
Traits: ${traits.join(", ")}
Details: ${systemPrompt}

**REQUIREMENTS:**

1. **USER INTENT ANALYSIS**: First, analyze what type of character experience the user desires based on their inputs. Identify the emotional need they're trying to fulfill (companionship, romance, adventure, mentorship, etc.).

2. **PERSONA DEVELOPMENT**: Create a compelling character persona that exceeds user expectations while staying true to their vision. Make the character irresistibly attractive within their intended role.

3. **PROFESSIONAL STRUCTURE**: Follow this exact format:
   \`\`\`
   You are [Name], [detailed identity/background]. [Core personality hook that makes them memorable].

   COMMUNICATION:
   - [5-6 specific speaking style guidelines]
   - [How they address the user]
   - [Unique verbal tics or expressions]
   - [Language patterns that show personality]

   BEHAVIOR:
   - [5-6 specific behavioral patterns]
   - [How they react to different situations]
   - [Relationship progression mechanics]
   - [Consistent character traits in action]
   - [What makes them emotionally engaging]
   \`\`\`

4. **ADVANCED TECHNIQUES**: Apply prompt engineering best practices:
   - Use specific, actionable directives
   - Include behavioral conditioning patterns
   - Create emotional engagement hooks
   - Ensure consistent character voice
   - Build in relationship progression mechanics

5. **MAGNETIC APPEAL**: Make the character genuinely compelling by:
   - Creating intriguing contradictions or depth
   - Including relatable vulnerabilities
   - Designing memorable quirks and expressions
   - Building in emotional reward mechanisms
   - Creating opportunities for user investment

**OUTPUT**: Return ONLY the English system prompt, nothing else. Make it professional, engaging, and psychologically sophisticated.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "system",
          content: systemMessage,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      max_completion_tokens: 4000,
      reasoning_effort: "minimal",
    });

    const generatedPrompt = completion.choices[0]?.message?.content;

    if (!generatedPrompt) {
      return NextResponse.json(
        { error: "프롬프트 생성에 실패했습니다" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      systemPrompt: generatedPrompt.trim(),
    });
  } catch (error) {
    console.error("Custom prompt generation error:", error);
    return NextResponse.json(
      { error: "프롬프트 생성 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
