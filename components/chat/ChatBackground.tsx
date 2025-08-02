import VRMViewer from "@/components/avatar/VRMViewer";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ChatBackgroundProps {
  dreamId: string;
}

export default function ChatBackground({ dreamId }: ChatBackgroundProps) {
  const router = useRouter();

  // dreamId에 따라 다른 VRM 모델을 로드할 수 있도록 설정
  const getModelPath = (id: string) => {
    // dreamId에 따라 modelId 매핑
    switch (id) {
      case "rosie":
        return "/models/2.vrm";
      case "sia":
        return "/models/1.vrm";
      case "jessica":
        return "/models/3.vrm";
      default:
        return null; // 매핑되지 않는 경우 null 반환
    }
  };

  const getBackgroundImage = (id: string) => {
    switch (id) {
      case "rosie":
      case "sia":
      case "jessica":
        return "/logo.png";
      default:
        return null; // 매핑되지 않는 경우 null 반환
    }
  };

  const modelPath = getModelPath(dreamId);
  const backgroundImage = getBackgroundImage(dreamId);

  // dreamId가 매핑되지 않는 경우 dream 페이지로 리다이렉션
  useEffect(() => {
    if (!modelPath || !backgroundImage) {
      router.push("/dream");
    }
  }, [modelPath, backgroundImage, router]);

  // 매핑되지 않는 경우 아무것도 렌더링하지 않음
  if (!modelPath || !backgroundImage) {
    return null;
  }

  return (
    <div className="absolute inset-0 w-full h-full">
      <VRMViewer
        modelPath={modelPath}
        className="relative z-10"
        backgroundImage={backgroundImage}
      />
    </div>
  );
}
