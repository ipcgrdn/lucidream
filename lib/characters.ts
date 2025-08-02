export interface Character {
  id: string;
  name: string;
  description: string;
  previewImage: string;
  vrmModel: string;
  backgroundImage: string;
  personality: string;
  traits: string[];
  created_at?: string;
}

export const characters: Character[] = [
  {
    id: "rosie",
    name: "Rosie",
    description: "A friendly and energetic companion",
    previewImage: "/preview/1.png",
    vrmModel: "/models/2.vrm",
    backgroundImage: "/logo.png",
    personality: "Cheerful, optimistic, and always ready to help",
    traits: ["friendly", "energetic", "helpful", "positive"],
  },
  {
    id: "sia",
    name: "Sia",
    description: "A calm and thoughtful companion",
    previewImage: "/preview/2.png",
    vrmModel: "/models/1.vrm",
    backgroundImage: "/logo.png",
    personality: "Calm, thoughtful, and introspective",
    traits: ["calm", "thoughtful", "wise", "gentle"],
  },
  {
    id: "jessica",
    name: "Jessica",
    description: "A creative and artistic companion",
    previewImage: "/preview/3.png",
    vrmModel: "/models/3.vrm",
    backgroundImage: "/logo.png",
    personality: "Creative, artistic, and inspiring",
    traits: ["creative", "artistic", "inspiring", "imaginative"],
  },
];

export function getCharacterById(id: string): Character | undefined {
  return characters.find((character) => character.id === id);
}

export function getAllCharacters(): Character[] {
  return characters;
}

export function getCharacterNames(): string[] {
  return characters.map((character) => character.name);
}
