import type { ReactNode } from 'react';
import styles from './visuals.module.css';

export function Frame({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  return <figure className={`not-prose ${styles.frame}`} aria-label={title} aria-description={note}>
    <figcaption className={styles.heading}>{title}</figcaption>
    {children}
  </figure>;
}
