export function ProjectFeedLoadingSkeleton() {
  return (
    <main aria-label="Work 프로젝트 피드 로딩 중" className="work-feed work-feed--loading">
      <div className="work-feed__loading-grid" aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <div className="work-feed__loading-tile" key={index}>
            <div className="work-feed__loading-image" />
            <div className="work-feed__loading-copy">
              <span className="work-feed__loading-line work-feed__loading-line--wide" />
              <span className="work-feed__loading-line" />
            </div>
          </div>
        ))}
      </div>
      <p className="sr-only" role="status">
        Work 프로젝트를 불러오는 중입니다.
      </p>
    </main>
  );
}

export function ProjectDetailLoadingSkeleton() {
  return (
    <main aria-label="프로젝트 상세 로딩 중" className="project-detail--loading">
      <div className="project-detail__loading-eyebrow" />
      <div className="project-detail__loading-title" />
      <div className="project-detail__loading-description" />
      <div className="project-detail__loading-meta">
        <span />
        <span />
        <span />
      </div>
      <div className="project-detail__loading-section">
        <div className="project-detail__loading-heading" />
        <div className="project-detail__loading-text" />
        <div className="project-detail__loading-text project-detail__loading-text--short" />
        <div className="project-detail__loading-block" />
      </div>
      <p className="sr-only" role="status">
        프로젝트 상세를 불러오는 중입니다.
      </p>
    </main>
  );
}
