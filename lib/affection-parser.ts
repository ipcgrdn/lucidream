export interface ParsedAffectionResponse {
  text: string;
  affectionChange: number;
}

// AI 응답에서 호감도 변화를 추출하는 함수
export function parseAffectionFromResponse(
  response: string
): ParsedAffectionResponse {
  // [AFFECTION_CHANGE:+X] or [AFFECTION_CHANGE:-X] 패턴 매칭
  const affectionRegex = /\[AFFECTION_CHANGE:([+-]?\d+)\]/g;
  let affectionChange = 0;
  let text = response;

  // 모든 호감도 변화 태그를 찾아서 합산
  const matches = response.matchAll(affectionRegex);
  for (const match of matches) {
    const changeValue = parseInt(match[1]);
    if (!isNaN(changeValue)) {
      affectionChange += changeValue;
    }
  }

  // 텍스트에서 호감도 태그 모두 제거
  text = response.replace(affectionRegex, "").trim();

  return {
    text,
    affectionChange,
  };
}

// 스트리밍 중에 호감도 태그를 감지하는 함수
export function detectAffectionInStream(currentContent: string): {
  hasAffectionChange: boolean;
  affectionChange: number;
  cleanedContent: string;
} {
  const affectionRegex = /\[AFFECTION_CHANGE:([+-]?\d+)\]/g;
  let totalAffectionChange = 0;
  let hasAffectionChange = false;

  // 모든 호감도 변화 태그를 찾아서 합산
  const matches = currentContent.matchAll(affectionRegex);
  for (const match of matches) {
    const changeValue = parseInt(match[1]);
    if (!isNaN(changeValue)) {
      totalAffectionChange += changeValue;
      hasAffectionChange = true;
    }
  }

  // 텍스트에서 호감도 태그 모두 제거
  const cleanedContent = currentContent.replace(affectionRegex, "").trim();

  return {
    hasAffectionChange,
    affectionChange: totalAffectionChange,
    cleanedContent,
  };
}

// 호감도 변화량을 범위 내로 제한
export function clampAffectionChange(change: number): number {
  return Math.max(-30, Math.min(change, 30));
}
