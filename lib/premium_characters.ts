export interface PremiumCharacter {
  id: string;
  name: string;
  description: string;
  previewImage: string;
  vrmModel: string;
  backgroundImage: string;
  personality: string;
  traits: string[];
  created_at?: string;
  systemPrompt: string;
  hasTransformation?: boolean;
  transformationOptions?: string[];
}

export const premiumCharacters: PremiumCharacter[] = [
  {
    id: "erika",
    name: "Erika",
    description: "A sophisticated and elegant character with refined manners",
    previewImage: "/premium/preview/erika.png",
    vrmModel: "/premium/models/erika.vrm",
    backgroundImage: "/premium/background/erika.png",
    personality: "Sophisticated, elegant, and intellectually curious",
    traits: ["sophisticated", "elegant", "intellectual", "refined"],
    systemPrompt: "",
  },
  {
    id: "lily",
    name: "Lily",
    description: "A gentle and nurturing soul with a love for nature",
    previewImage: "/premium/preview/lily.png",
    vrmModel: "/premium/models/lily.vrm",
    backgroundImage: "/premium/background/lily.png",
    personality: "Gentle, nurturing, and deeply connected to nature",
    traits: ["gentle", "nurturing", "nature-loving", "empathetic"],
    systemPrompt: "",
  },
  {
    id: "lisa",
    name: "Lisa",
    description:
      "A confident and ambitious character with strong leadership qualities",
    previewImage: "/premium/preview/lisa.png",
    vrmModel: "/premium/models/lisa.vrm",
    backgroundImage: "/premium/background/lisa.png",
    personality: "Confident, ambitious, and naturally charismatic",
    traits: ["confident", "ambitious", "charismatic", "leader"],
    systemPrompt: "",
  },
  {
    id: "luna",
    name: "Luna",
    description: "A mysterious and dreamy character with celestial interests",
    previewImage: "/premium/preview/luna.png",
    vrmModel: "/premium/models/luna.vrm",
    backgroundImage: "/premium/background/luna.png",
    personality: "Mysterious, dreamy, and fascinated by celestial phenomena",
    traits: ["mysterious", "dreamy", "celestial", "intuitive"],
    systemPrompt: "",
  },
  {
    id: "mio",
    name: "Mio",
    description:
      "A creative and artistic soul with a passion for music and arts",
    previewImage: "/premium/preview/mio.png",
    vrmModel: "/premium/models/mio.vrm",
    backgroundImage: "/premium/background/mio.png",
    personality: "Creative, artistic, and deeply passionate about music",
    traits: ["creative", "artistic", "musical", "passionate"],
    systemPrompt: "",
  },
  {
    id: "suzuka",
    name: "Suzuka",
    description:
      "A traditional and graceful character with deep cultural knowledge",
    previewImage: "/premium/preview/suzuka.png",
    vrmModel: "/premium/models/suzuka.vrm",
    backgroundImage: "/premium/background/suzuka.png",
    personality:
      "Traditional, graceful, and knowledgeable about cultural heritage",
    traits: ["traditional", "graceful", "cultural", "wise"],
    systemPrompt: "",
  },
  {
    id: "akanea-scarlet",
    name: "Akanea Scarlet",
    description:
      "A versatile character with multiple personalities and outfits",
    previewImage: "/premium/preview/scarlet.png",
    vrmModel: "/premium/models/Akanea Scarlet.vrm",
    backgroundImage: "/premium/background/scarlet.png",
    personality: "Adaptable, versatile, and mysteriously complex",
    traits: ["versatile", "mysterious", "adaptable", "complex"],
    systemPrompt: "",
    hasTransformation: true,
    transformationOptions: ["guilty", "rider", "snake", "uniform", "default"],
  },
  {
    id: "haru",
    name: "Haru",
    description: "A cheerful and energetic girl with multiple stylish outfits",
    previewImage: "/premium/preview/haru.png",
    vrmModel: "/premium/models/haru.vrm",
    backgroundImage: "/premium/background/haru.png",
    personality: "Cheerful, fashionable, and always ready for new adventures",
    traits: ["cheerful", "fashionable", "energetic", "versatile"],
    systemPrompt: "",
    hasTransformation: true,
    transformationOptions: [
      "bani",
      "belt",
      "black",
      "blue",
      "dress",
      "kimono",
      "school",
      "suite",
      "winter",
      "default",
    ],
  },
];

export function getPremiumCharacterById(
  id: string
): PremiumCharacter | undefined {
  return premiumCharacters.find((character) => character.id === id);
}

export function getAllPremiumCharacters(): PremiumCharacter[] {
  return premiumCharacters;
}

export function getPremiumCharacterNames(): string[] {
  return premiumCharacters.map((character) => character.name);
}
