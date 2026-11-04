import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import type { ProjectCaseStudy } from "../project-types";
import { getProjectSections } from "../project-content";

export function ProjectWindowSummary({
  project,
  children,
}: {
  project: ProjectCaseStudy;
  children: ReactNode;
}) {
  const sections = getProjectSections(project).slice(0, 3);
  return (
    <div className="desktop-project-summary">
      <div className="desktop-project-heading">
        <h2>{project.name}</h2>
        <span>{project.organization}</span>
      </div>
      <p className="desktop-window-intro">{project.description}</p>
      <div className="desktop-window-actions desktop-preview-actions">
        <Link className="desktop-detail-link" href={`/projects/${project.slug}`}>
          프로젝트 자세히 보기 <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
        {project.evidence?.map((item) => (
          <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer">
            {item.label}
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        ))}
      </div>
      <dl className="desktop-project-meta">
        <div>
          <dt>맡은 일</dt>
          <dd>{project.role}</dd>
        </div>
        {project.period && (
          <div>
            <dt>기간</dt>
            <dd>{project.period}</dd>
          </div>
        )}
        {project.team && (
          <div>
            <dt>참여 형태</dt>
            <dd>{project.team}</dd>
          </div>
        )}
      </dl>
      {project.technologies.length > 0 && (
        <ul className="desktop-preview-technologies" aria-label="사용 기술">
          {project.technologies.map((tech) => (
            <li key={tech}>{tech}</li>
          ))}
        </ul>
      )}
      {project.metrics.length > 0 && (
        <section className="desktop-preview-section" aria-label="주요 성과">
          <h3>주요 성과</h3>
          <dl className="desktop-preview-metrics">
            {project.metrics.map((metric) => (
              <div key={metric.label}>
                <dt>{metric.label}</dt>
                <dd>
                  <strong>{metric.value}</strong>
                  <p>{metric.detail}</p>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}
      {children}
      {sections.length > 0 && (
        <section className="desktop-preview-section">
          <h3>주요 작업</h3>
          <ul className="desktop-preview-links">
            {sections.map((section) => (
              <li key={section.id}>
                <Link href={`/projects/${project.slug}#${section.id}`}>
                  {section.title}
                  <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      {!!project.relatedPosts?.length && (
        <section className="desktop-preview-section">
          <h3>관련 기록</h3>
          <ul className="desktop-preview-links">
            {project.relatedPosts.map((post) => (
              <li key={post.slug}>
                <Link href={`/blog/${post.slug}`}>
                  {post.title}
                  <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
