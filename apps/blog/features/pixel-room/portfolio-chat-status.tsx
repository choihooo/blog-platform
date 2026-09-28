import { Button } from "@hozui/react/button";

import { CHAT_MODEL } from "./chat-model";
import type { ModelState } from "./portfolio-chat-types";

export function PortfolioChatStatus({
  error,
  modelState,
  onCancel,
  onLoad,
  progress,
}: {
  error: string;
  modelState: ModelState;
  onCancel: () => void;
  onLoad: () => void;
  progress: number;
}) {
  return (
    <>
      {modelState === "unsupported" && (
        <p role="status">
          현재는 WebGPU를 지원하는 데스크톱 Chrome·Edge에서만 사용할 수 있어요. 모바일은 아직
          지원하지 않아요.
        </p>
      )}
      {modelState === "checking" && (
        <p role="status">모델 불러오는 중… 브라우저 지원을 확인하고 있어요.</p>
      )}
      {(modelState === "idle" || modelState === "error") && (
        <div className="chat-model-status">
          <p>
            첫 실행 시 약 {CHAT_MODEL.size}를 내려받아요. 모델은 브라우저에 캐시되며 실행 중에는
            추가 메모리를 사용해요. 커뮤니티 GGUF 변환본을 사용합니다.
          </p>
          <Button
            label={modelState === "error" ? "다시 불러오기" : `모델 불러오기 · ${CHAT_MODEL.size}`}
            onClick={onLoad}
            size="sm"
          />
        </div>
      )}
      {modelState === "loading" && (
        <div className="chat-model-status" role="status">
          <p>모델 불러오는 중…</p>
          <p>{progress < 100 ? `다운로드 ${progress}%` : "다운로드 완료 · GPU에 모델 준비 중…"}</p>
          <p>처음에는 약 {CHAT_MODEL.size}를 내려받아요. 다음 방문에는 브라우저 캐시를 사용해요.</p>
          <progress max={100} value={progress} aria-label="모델 다운로드" />
          <Button label="불러오기 취소" variant="ghost" size="sm" onClick={onCancel} />
        </div>
      )}
      {error && (
        <p className="chat-model-error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
