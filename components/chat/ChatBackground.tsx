import VRMViewer from "@/components/avatar/VRMViewer";
import { Character } from "@/lib/characters";

interface ChatBackgroundProps {
  character: Character;
}

export default function ChatBackground({ character }: ChatBackgroundProps) {
  return (
    <div className="absolute inset-0 w-full h-full">
      <VRMViewer
        modelPath={character.vrmModel}
        className="relative z-10"
        backgroundImage={character.backgroundImage}
      />
    </div>
  );
}
