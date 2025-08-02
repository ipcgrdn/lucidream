"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import ChatNavbar from "@/components/chat/ChatNavbar";
import ChatBackground from "@/components/chat/ChatBackground";
import LeftCard from "@/components/chat/LeftCard";
import RightCard from "@/components/chat/RightCard";

export default function DreamChatPage() {
  const params = useParams();
  const dreamId = params.id as string;

  const [isLeftCardOpen, setIsLeftCardOpen] = useState(true);
  const [isRightCardOpen, setIsRightCardOpen] = useState(true);

  return (
    <div className="h-screen w-full relative overflow-hidden">
      <ChatNavbar
        onLeftMenuClick={() => setIsLeftCardOpen(!isLeftCardOpen)}
        onRightMenuClick={() => setIsRightCardOpen(!isRightCardOpen)}
      />

      <ChatBackground dreamId={dreamId} />

      <LeftCard isOpen={isLeftCardOpen} />
      <RightCard isOpen={isRightCardOpen} />
    </div>
  );
}
