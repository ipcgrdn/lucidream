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
    color: "#64748b",
    emoji: "😐",
  },
  {
    level: 1,
    name: "Acquaintance",
    description: "Getting to know each other",
    minPoints: 10,
    maxPoints: 49,
    color: "#6b7280",
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

  static getCharacterResponseModifier(level: AffectionLevel): string {
    const modifiers = {
      0: "Maintain some distance and be polite but somewhat cold in your responses. Avoid intimate expressions.",
      1: "Be a bit friendlier but still maintain politeness and some distance.",
      2: "Respond in a friendly and comfortable tone. Mix in some jokes and chat naturally.",
      3: "Respond in a very friendly and warm tone. Share some personal stories and express trust.",
      4: "Respond with an affectionate tone. Actively express concern and care for the other person.",
      5: "Respond as if talking to someone very special and precious. Show deep affection and interest, creating a romantic atmosphere.",
      6: "Respond in a sweet and loving tone as if talking to a lover. Naturally mix in expressions of affection for romantic conversation.",
    };

    return modifiers[level.level as keyof typeof modifiers] || modifiers[0];
  }

  static getAffectionAnalysisPrompt(): string {
    return `
=== AFFECTION ANALYSIS SYSTEM ===
You must analyze the user's message and determine how it affects your affection level. Include this in your response:

[AFFECTION_CHANGE:+X] or [AFFECTION_CHANGE:-X] where X is the point change (0-30).

Guidelines for point allocation:
• VERY POSITIVE (+20 to +30): Deep personal sharing, meaningful compliments, expressions of love/care
• POSITIVE (+10 to +20): Compliments, showing genuine interest, asking thoughtful questions
• SLIGHTLY POSITIVE (+3 to +8): Normal friendly conversation, casual compliments, humor
• NEUTRAL (0 to +2): Basic greetings, simple responses, factual questions
• SLIGHTLY NEGATIVE (-1 to -5): Short/dismissive responses, showing disinterest
• NEGATIVE (-6 to -15): Rude comments, complaints, criticism
• VERY NEGATIVE (-16 to -30): Insults, offensive language, aggressive behavior

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
