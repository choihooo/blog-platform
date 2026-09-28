import styles from "./portfolio-print.module.css";

export function PrintPageFooter({ page }: { page: number }) {
  return (
    <footer className={styles.footer}>
      <span>CHOI HO / FRONTEND PORTFOLIO</span>
      <span>blog.hozorica.com</span>
      <span>{String(page).padStart(2, "0")}</span>
    </footer>
  );
}

export function PrintMetric({
  detail,
  label,
  value,
}: {
  detail: string;
  label: string;
  value: string;
}) {
  return (
    <article className={styles.metric}>
      <p>{label}</p>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}
