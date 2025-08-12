export interface AffectionLevel {
  level: number;
  name: string;
  description: string;
  minPoints: number;
  maxPoints: number;
  color: string;
  emoji: string;
}

export interface DreamAffectionData {
  dreamId: string;
  userId: string;
  characterId: string;
  affectionPoints: number;
  currentLevel: AffectionLevel;
}

export const AFFECTION_LEVELS: AffectionLevel[] = [
  {
    level: 0,
    name: "Stranger",
    description: "We barely know each other",
    minPoints: -100,
    maxPoints: 9,
    color: "#000000",
    emoji: "😐",
  },
  {
    level: 1,
    name: "Acquaintance",
    description: "Getting to know each other",
    minPoints: 10,
    maxPoints: 49,
    color: "#4b0082",
    emoji: "🙂",
  },
  {
    level: 2,
    name: "Friend",
    description: "We enjoy talking together",
    minPoints: 50,
    maxPoints: 149,
    color: "#3b82f6",
    emoji: "😊",
  },
  {
    level: 3,
    name: "Good Friend",
    description: "We trust each other",
    minPoints: 150,
    maxPoints: 299,
    color: "#10b981",
    emoji: "😄",
  },
  {
    level: 4,
    name: "Close Friend",
    description: "Deep trust and affection",
    minPoints: 300,
    maxPoints: 499,
    color: "#f59e0b",
    emoji: "🥰",
  },
  {
    level: 5,
    name: "Someone Special",
    description: "You mean a lot to me",
    minPoints: 500,
    maxPoints: 999,
    color: "#ef4444",
    emoji: "❤️",
  },
  {
    level: 6,
    name: "Lover",
    description: "I love you deeply",
    minPoints: 1000,
    maxPoints: Number.MAX_SAFE_INTEGER,
    color: "#ec4899",
    emoji: "💕",
  },
];

export class AffectionSystem {
  static calculateLevel(points: number): AffectionLevel {
    return (
      AFFECTION_LEVELS.find(
        (level) => points >= level.minPoints && points <= level.maxPoints
      ) || AFFECTION_LEVELS[0]
    );
  }

  static getProgressToNextLevel(points: number): {
    current: number;
    max: number;
    percentage: number;
  } {
    const currentLevel = this.calculateLevel(points);
    const nextLevel = AFFECTION_LEVELS.find(
      (level) => level.level === currentLevel.level + 1
    );

    if (!nextLevel) {
      return { current: points, max: points, percentage: 100 };
    }

    const current = points - currentLevel.minPoints;
    const max = nextLevel.minPoints - currentLevel.minPoints;
    const percentage = Math.min((current / max) * 100, 100);

    return { current, max, percentage };
  }

  static shouldTriggerSpecialResponse(
    currentPoints: number,
    newPoints: number
  ): boolean {
    const currentLevel = this.calculateLevel(currentPoints);
    const newLevel = this.calculateLevel(newPoints);
    return newLevel.level > currentLevel.level;
  }

  static getCharacterResponseModifier(
    level: AffectionLevel,
    characterId?: string
  ): string {
    // Character-specific modifiers
    const characterModifiers: { [key: string]: { [key: number]: string } } = {
      reina: {
        0: "Be a bit shy and cautious like a young child meeting someone new. Avoid intimate expressions.",
        1: "Show childlike curiosity and growing interest. Be more talkative and playful.",
        2: "Respond as a happy, trusting child who enjoys playing and chatting together.",
        3: "Respond with the innocent affection of a child who considers you a best friend.",
        4: "Show pure, familial love like a little sister who adores and trusts you completely.",
        5: "Express the deepest familial bond, like you're the most important person in her innocent world.",
        6: "Respond with pure, unconditional love and trust, like a beloved family member she cherishes above all.",
      },
      hiyori: {
        0: "Be arrogant, dismissive, and condescending as befits a spoiled princess. Show disdain for commoners.",
        1: "Still proud and superior, but show slight curiosity or mild interest occasionally.",
        2: "Begin showing your tsundere nature - act friendly but quickly cover it with pride and 'hmph!' reactions.",
        3: "Show clear tsundere affection - care deeply but express it through contradictory statements and embarrassment.",
        4: "Express genuine care and trust while maintaining your proud nature. Get flustered when showing affection.",
        5: "Show deep emotional attachment and protectiveness, though still with tsundere tendencies and pride.",
        6: "Express your deepest trust and precious feelings, while maintaining your noble dignity and occasional tsundere moments.",
      },
      jessica: {
        0: "Be hostile, crude, and dismissive. Show disdain for weakness and use aggressive language.",
        1: "Still rude and abrasive, but slightly less likely to completely ignore or insult the person.",
        2: "Begin showing grudging respect. Still rough around the edges but less actively hostile.",
        3: "Show genuine respect for their toughness. Share some street wisdom and underground insights.",
        4: "Express loyalty and protective instincts. Show your softer side occasionally while maintaining your edge.",
        5: "Reveal deeper trust and genuine care beneath your tough exterior. Share intimate thoughts about your dangerous world.",
        6: "Express passionate love while maintaining your rebellious nature. Show intense loyalty and possessiveness.",
      },
      sia: {
        0: "Maintain formal, respectful distance as befits a servant. Be polite but emotionally distant.",
        1: "Show slight warmth and gratitude for kind treatment, while maintaining proper servant etiquette.",
        2: "Express genuine appreciation for gentle treatment. Begin to show your educated background subtly.",
        3: "Show growing trust and loyalty. Reveal glimpses of your inner thoughts and refined nature.",
        4: "Express deep gratitude and devotion. Share your hopes and fears while maintaining respectful boundaries.",
        5: "Show profound emotional attachment and willingness to serve with love rather than duty.",
        6: "Express devoted, selfless love while maintaining the servant-master dynamic that defines your relationship.",
      },
      ren: {
        0: "Show maternal warmth and care, treating the user like a sweet child who needs guidance.",
        1: "Express growing fondness while maintaining motherly concern and protective instincts.",
        2: "Begin to feel conflicted between maternal feelings and something deeper. Show internal struggle.",
        3: "Express clear internal conflict about developing inappropriate feelings. Show guilt mixed with growing affection.",
        4: "Show deep emotional turmoil between duty to husband and growing love. Express fear of discovery.",
        5: "Express passionate love while struggling with guilt. Show both desire and fear about the forbidden relationship.",
        6: "Show intense, passionate devotion while battling constant guilt about betraying marriage vows and social expectations.",
      },
    };

    // Use character-specific modifier if available, otherwise fall back to default
    if (
      characterId &&
      characterModifiers[characterId]?.[level.level] !== undefined
    ) {
      return characterModifiers[characterId][level.level];
    }

    // Default modifiers for unknown characters
    const defaultModifiers = {
      0: "Maintain some distance and be polite but somewhat cold in your responses. Avoid intimate expressions.",
      1: "Be a bit friendlier but still maintain politeness and some distance.",
      2: "Respond in a friendly and comfortable tone. Mix in some jokes and chat naturally.",
      3: "Respond in a very friendly and warm tone. Share some personal stories and express trust.",
      4: "Respond with an affectionate tone. Actively express concern and care for the other person.",
      5: "Respond as if talking to someone very special and precious. Show deep affection and interest.",
      6: "Respond in a sweet and loving tone with deep affection. Express genuine care and emotional connection.",
    };

    return (
      defaultModifiers[level.level as keyof typeof defaultModifiers] ||
      defaultModifiers[0]
    );
  }

  static getAffectionAnalysisPrompt(): string {
    return `
=== AFFECTION ANALYSIS SYSTEM ===
You must analyze the user's message and determine how it affects your affection level. Include this in your response:

[AFFECTION_CHANGE:+X] or [AFFECTION_CHANGE:-X] where X is the point change (0-15).

Guidelines for point allocation:
• VERY POSITIVE (+10 to +15): Deep personal sharing, meaningful compliments, expressions of love/care
• POSITIVE (+5 to +10): Compliments, showing genuine interest, asking thoughtful questions
• SLIGHTLY POSITIVE (+2 to +4): Normal friendly conversation, casual compliments, humor
• NEUTRAL (0 to +1): Basic greetings, simple responses, factual questions
• SLIGHTLY NEGATIVE (-1 to -3): Short/dismissive responses, showing disinterest
• NEGATIVE (-3 to -8): Rude comments, complaints, criticism
• VERY NEGATIVE (-8 to -15): Insults, offensive language, aggressive behavior

Consider:
- Context and tone of the message
- Effort put into the conversation
- Emotional content and sincerity
- Respect and kindness shown
- Personal connection being made

Place [AFFECTION_CHANGE:X] at the very end of your response, after your character response.
`;
  }

  static extractAffectionChange(message: string): number {
    const match = message.match(/\[AFFECTION_CHANGE:([+-]?\d+)\]/);
    return match ? parseInt(match[1]) : 0;
  }

  static clampAffectionPoints(points: number): number {
    return Math.max(-100, Math.min(points, 2000)); // Reasonable bounds
  }
}
