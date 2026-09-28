import styles from "./portfolio-preview.module.css";

export function FrameMeta({ current, label }: { current: string; label: string }) {
  return (
    <div className={styles.frameMeta}>
      <span>{current} / 04</span>
      <span>{label}</span>
      <span>CHOI HO · FRONTEND ENGINEER</span>
    </div>
  );
}

export function AssetPlaceholder({
  className = "",
  eyebrow,
  title,
  specification,
}: {
  className?: string;
  eyebrow: string;
  title: string;
  specification: string;
}) {
  return (
    <div className={`${styles.assetPlaceholder} ${className}`}>
      <div className={styles.assetGrid} aria-hidden="true" />
      <div className={styles.assetCross} aria-hidden="true">
        <span />
        <span />
      </div>
      <div className={styles.assetCopy}>
        <span>{eyebrow}</span>
        <strong>{title}</strong>
        <small>{specification}</small>
      </div>
    </div>
  );
}

export function Metric({
  caption,
  label,
  value,
}: {
  caption: string;
  label: string;
  value: string;
}) {
  return (
    <div className={styles.metric}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{caption}</small>
    </div>
  );
}
