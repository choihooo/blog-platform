import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { BatteryFull, Signal, Wifi } from 'lucide-react';
import styles from './iphone-mockup.module.css';

type IPhoneMockupProps = {
  children: ReactNode;
  className?: string;
  screenClassName?: string;
  screenRef?: Ref<HTMLDivElement>;
  screenProps?: Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className'>;
  statusTone?: 'dark' | 'light';
};

/** Phone chrome shared by interactive demos and static article illustrations. */
export function IPhoneMockup({ children, className = '', screenClassName = '', screenRef, screenProps, statusTone = 'dark' }: IPhoneMockupProps) {
  return <div className={`${styles.phone} ${className}`}>
    <div {...screenProps} ref={screenRef} className={`${styles.screen} ${screenClassName}`}>
      <div className={styles.statusBar} data-tone={statusTone} aria-hidden="true">
        <span>9:41</span>
        <span className={styles.island} />
        <span className={styles.statusIcons}><Signal size={13} /><Wifi size={13} /><BatteryFull size={19} /></span>
      </div>
      {children}
      <div className={styles.homeIndicator} aria-hidden="true" />
    </div>
  </div>;
}
