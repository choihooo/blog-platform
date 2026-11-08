import { Button } from "@hozui/react/button";

import { CHAT_MODEL } from "./chat-model";
import type { ChatDiagnosticsData, ModelState } from "./portfolio-chat-types";

export function PortfolioChatDiagnostics({
  data,
  generating,
  modelState,
  onLoad,
  onLoadWithDownload,
  onRunSuite,
  onSendBaseline,
  onSendOptimized,
  suiteProgress,
}: {
  data: ChatDiagnosticsData;
  generating: boolean;
  modelState: ModelState;
  onLoad: () => void;
  onLoadWithDownload: () => void;
  onRunSuite: () => void;
  onSendBaseline: () => void;
  onSendOptimized: () => void;
  suiteProgress: number;
}) {
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <details className="chat-diagnostics">
      <summary>성능 진단 · 개발 전용</summary>
      <p>벤치마크는 현재 대화 대신 같은 질문을 새 대화로 실행합니다.</p>
      <Button
        size="sm"
        variant="ghost"
        label={`${CHAT_MODEL.quantization.toUpperCase()} 현재 모델 불러오기`}
        disabled={generating || modelState === "loading" || modelState === "unsupported"}
        onClick={onLoad}
      />
      <Button
        size="sm"
        variant="ghost"
        label={`다운로드 포함 로딩 측정 · ${CHAT_MODEL.size}`}
        disabled={generating || modelState !== "ready" || suiteProgress > 0}
        onClick={onLoadWithDownload}
      />
      <Button
        size="sm"
        variant="ghost"
        label={suiteProgress ? `한국어 테스트 ${suiteProgress}/10` : "한국어 10문항 실행"}
        disabled={modelState !== "ready" || generating || suiteProgress > 0}
        onClick={onRunSuite}
      />
      <Button
        size="sm"
        variant="ghost"
        label="기존 설정 측정"
        disabled={modelState !== "ready" || generating}
        onClick={onSendBaseline}
      />
      <Button
        size="sm"
        variant="ghost"
        label="최적화 설정 측정"
        disabled={modelState !== "ready" || generating}
        onClick={onSendOptimized}
      />
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </details>
  );
}
