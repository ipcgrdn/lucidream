import VRMViewer from "@/components/avatar/VRMViewer";
import { Character } from "@/lib/characters";
import { AnimationPresetType } from "@/lib/vrm-animations";

interface ChatBackgroundProps {
  character: Character;
  animationPreset?: AnimationPresetType;
  onAnimationChange?: (preset: AnimationPresetType) => void;
  audioElement?: HTMLAudioElement | null;
  enableLipSync?: boolean;
}

export default function ChatBackground({
  character,
  animationPreset = "idle",
  onAnimationChange,
  audioElement,
  enableLipSync = false,
}: ChatBackgroundProps) {
  return (
    <div className="absolute inset-0 w-full h-full">
      <VRMViewer
        modelPath={character.vrmModel}
        className="relative z-10"
        backgroundImage={character.backgroundImage}
        animationPreset={animationPreset}
        onAnimationChange={onAnimationChange}
        audioElement={audioElement}
        enableLipSync={enableLipSync}
      />
    </div>
  );
}
