import VRMViewer from "@/components/avatar/VRMViewer";
import { Character } from "@/lib/characters";
import { VRMAnimationState } from "@/vrm/vrm-animation";

interface ChatBackgroundProps {
  character: Character;
  animationData?: VRMAnimationState;
}

export default function ChatBackground({ character, animationData }: ChatBackgroundProps) {

  return (
    <div className="absolute inset-0 w-full h-full">
      <VRMViewer
        modelPath={character.vrmModel}
        className="relative z-10"
        backgroundImage={character.backgroundImage}
        animationData={animationData}
      />
    </div>
  );
}
