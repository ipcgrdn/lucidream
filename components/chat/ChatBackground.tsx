import VRMViewer from "@/components/avatar/VRMViewer";
import { Character } from "@/lib/characters";
import { AnimationPresetType } from "@/lib/vrm-animations";
import { Dream } from "@/lib/dreams";

interface ChatBackgroundProps {
  character: Character;
  dream?: Dream;
  animationPreset?: AnimationPresetType;
  onAnimationChange?: (preset: AnimationPresetType) => void;
  audioElement?: HTMLAudioElement | null;
  enableLipSync?: boolean;
  modelPath?: string;
}

export default function ChatBackground({
  character,
  dream,
  animationPreset = "idle",
  onAnimationChange,
  audioElement,
  enableLipSync = false,
  modelPath,
}: ChatBackgroundProps) {
  return (
    <div className="absolute inset-0 w-full h-full">
      <VRMViewer
        modelPath={modelPath || character.vrmModel}
        className="relative z-10"
        backgroundImage={character.backgroundImage}
        animationPreset={animationPreset}
        onAnimationChange={onAnimationChange}
        audioElement={audioElement}
        enableLipSync={enableLipSync}
        dreamId={dream?.id}
      />
    </div>
  );
}
