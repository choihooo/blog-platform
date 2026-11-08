import { EmptyState } from "@hozui/react";
import type { AnalyticsConnection } from "@blog-platform/core/analytics";

const copy: Record<AnalyticsConnection["status"], { title: string; description: string }> = {
  connected: {
    title: "분석 데이터가 아직 없습니다.",
    description: "연결은 정상입니다. Google 데이터 제공 지연 또는 최근 트래픽 부족일 수 있습니다.",
  },
  "missing-config": {
    title: "분석 연결 설정이 필요합니다.",
    description:
      "GA4_PROPERTY_ID, SEARCH_CONSOLE_PROPERTY, Google service account credential을 설정하세요.",
  },
  unauthorized: {
    title: "분석 속성 권한을 확인하세요.",
    description: "서비스 계정이 GA4 속성과 Search Console property를 읽을 수 있어야 합니다.",
  },
  error: {
    title: "분석 데이터를 불러오지 못했습니다.",
    description:
      "일시 장애 또는 quota 상태를 확인하세요. 마지막 성공 snapshot이 있으면 표시됩니다.",
  },
};

export function AnalyticsEmptyState({ connection }: { connection: AnalyticsConnection }) {
  const state = copy[connection.status];
  return (
    <EmptyState
      className="rounded-lg border border-border bg-card px-5 py-12"
      density="compact"
      description={connection.message ?? state.description}
      media="icon"
      title={state.title}
    />
  );
}
