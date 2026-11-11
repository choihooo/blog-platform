'use client';

import Image from 'next/image';
import { useEffect, useId, useReducer, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { ArrowLeft, ChevronRight, Crosshair, Minus, Plus, RotateCcw, Users, X } from 'lucide-react';
import { IPhoneMockup } from '@/components/IPhoneMockup';
import { initialState, members, places, snapSheet, stops, transition } from './model';
import { MapBackdrop } from './MapBackdrop';
import pin1 from './assets/pin-1.svg';
import pin2 from './assets/pin-2.svg';
import pin3 from './assets/pin-3.svg';
import pin4 from './assets/pin-4.svg';
import profile1 from './assets/profile-1.svg';
import profile2 from './assets/profile-2.svg';
import profile3 from './assets/profile-3.svg';
import profile4 from './assets/profile-4.svg';
import styles from './moping.module.css';

const pins = [pin1, pin2, pin3, pin4];
const profiles = [profile1, profile2, profile3, profile4];

export function MopingDemo({ snapshot }: { snapshot?: { reveal: number; label: string } } = {}) {
  const [liveState, dispatch] = useReducer(transition, initialState);
  const state = snapshot ? { ...initialState, reveal: snapshot.reveal } : liveState;
  const snapshotHost = useRef<HTMLElement>(null);
  const [snapshotScale, setSnapshotScale] = useState(0.5);
  const isSnapshot = Boolean(snapshot);
  useEffect(() => {
    if (!isSnapshot || !snapshotHost.current) return;
    const observer = new ResizeObserver(([entry]) => setSnapshotScale(Math.min(1, entry.contentRect.width / 350)));
    observer.observe(snapshotHost.current);
    return () => observer.disconnect();
  }, [isSnapshot]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [screenHeight, setScreenHeight] = useState(680);
  const screen = useRef<HTMLDivElement>(null);
  const handle = useRef<HTMLDivElement>(null);
  const detailBack = useRef<HTMLButtonElement>(null);
  const detailTrigger = useRef<HTMLButtonElement>(null);
  const drag = useRef<{ pointer: number; y: number; start: number; reveal: number } | null>(null);
  const descriptionId = useId();
  useEffect(() => {
    const element = screen.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setScreenHeight(entry.contentRect.height));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  // Keep the meeting title and profiles visible even in a narrow article column.
  const minimumReveal = Math.max(stops[0], Math.min(0.52, 180 / screenHeight));
  const reveal = snapshot ? snapshot.reveal : Math.max(state.reveal, minimumReveal);
  const selected = places.find(place => place.id === state.selectedId);
  const visible = places.filter(place => state.member === null || place.members.includes(state.member));
  const reset = () => { dispatch({ type: 'reset' }); setDetailOpen(false); };

  function beginDrag(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { pointer: event.pointerId, y: event.clientY, start: reveal, reveal };
    setIsDragging(true);
  }
  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    const active = drag.current;
    if (!active || active.pointer !== event.pointerId) return;
    const height = screen.current?.getBoundingClientRect().height ?? 700;
    active.reveal = Math.max(minimumReveal, Math.min(stops[2], active.start + (active.y - event.clientY) / height));
    dispatch({ type: 'sheet', reveal: active.reveal });
  }
  function endDrag(event: PointerEvent<HTMLDivElement>, cancelled = false) {
    const active = drag.current;
    if (!active || active.pointer !== event.pointerId) return;
    if (!cancelled && Math.abs(active.reveal - active.start) < 0.01) {
      dispatch({ type: 'advance-sheet' });
    } else {
      dispatch({ type: 'sheet', reveal: cancelled ? active.start : snapSheet(active.reveal) });
    }
    drag.current = null;
    setIsDragging(false);
  }
  const closeDetail = () => { setDetailOpen(false); requestAnimationFrame(() => detailTrigger.current?.focus()); };

  return <figure ref={snapshotHost} className={`not-prose ${styles.frame} ${snapshot ? styles.snapshot : ''}`} style={snapshot ? { '--snapshot-scale': snapshotScale } as CSSProperties : undefined} role={snapshot ? 'img' : undefined} aria-label={snapshot ? `바텀시트 ${snapshot.label} 고정 화면` : '아이폰 안에서 체험하는 모핑'} aria-describedby={snapshot ? undefined : descriptionId} data-sheet-reveal={snapshot?.reveal}>
    <figcaption className={styles.toolbar}>
      <span>{snapshot ? snapshot.label : '모핑 공유 지도'}</span>
      {!snapshot && <button type="button" onClick={reset}><RotateCcw size={13} aria-hidden="true" /> 처음으로</button>}
    </figcaption>
    {!snapshot && <p id={descriptionId} className={styles.srOnly}>모핑 저장소의 디자인과 에셋을 활용한 재현 데모입니다. 지도와 참여자 데이터는 예시입니다. 핀을 누르면 장소 정보가 나타납니다. 다른 핀을 누르면 이전 핀의 크기가 복원됩니다. 빈 지도를 누르거나 Escape를 누르면 선택이 해제됩니다. 바텀시트 손잡이를 드래그하거나 초점을 맞추고 위아래 방향키로 펼칠 수 있습니다.</p>}
    <div className={styles.stage}>
      <IPhoneMockup className={snapshot ? styles.snapshotPhone : undefined} screenClassName={snapshot ? styles.snapshotScreen : undefined} screenRef={screen} statusTone={detailOpen ? 'light' : 'dark'} screenProps={{ inert: isSnapshot, 'aria-hidden': isSnapshot || undefined, onKeyDown: event => {
          if (event.key === 'Escape') {
            if (detailOpen) closeDetail();
            else dispatch({ type: 'clear' });
          }
        } }}>
          <div className={styles.map} inert={detailOpen}>
            <MapBackdrop />
            <button type="button" className={styles.mapClear} aria-label="지도 빈 곳 눌러 핀 선택 해제" onClick={() => dispatch({ type: 'clear' })} />
            <div className={styles.mapTitle} aria-hidden="true">MOPING</div>
            <span className={styles.mapBadge}>예시 지도</span>
            {visible.map(place => <button key={place.id} type="button" className={styles.pin}
              style={{ '--pin-x': `${place.x}%`, '--pin-y': `${place.y}%` } as CSSProperties}
              aria-label={`${place.name} 핀`} aria-pressed={state.selectedId === place.id}
              tabIndex={place.y + 4 >= (1 - minimumReveal) * 100 ? -1 : 0}
              aria-hidden={place.y + 4 >= (1 - minimumReveal) * 100 || undefined}
              onFocus={() => {
                // Keyboard navigation must reveal a pin obscured by the sheet.
                if (place.y + 4 >= (1 - reveal) * 100) dispatch({ type: 'sheet', reveal: stops[0] });
              }}
              onClick={() => {
                dispatch({ type: 'select', id: place.id });
                if (place.y + 4 >= (1 - Math.max(reveal, 0.52)) * 100) requestAnimationFrame(() => handle.current?.focus());
              }}>
              <Image src={pins[place.level - 1]} width={35} height={40} alt="" draggable={false} />
              <span>{place.name}</span>
            </button>)}
          </div>
          <div className={styles.sheet} inert={detailOpen} style={{ transform: `translateY(${(1 - reveal / 0.8) * 100}%)` }} data-dragging={isDragging}>
            <button type="button" className={styles.location} aria-label="지도 선택 초기화" onClick={() => dispatch({ type: 'clear' })}><Crosshair size={21} aria-hidden="true" /></button>
            <div className={styles.sheetViewport} style={{ height: `${reveal / 0.8 * 100}%` }}>
            <div ref={handle} className={styles.handle} role="slider" tabIndex={0} aria-label="바텀시트 펼침 정도" aria-valuemin={Math.round(minimumReveal * 100)} aria-valuemax={80} aria-valuenow={Math.round(reveal * 100)} aria-valuetext={state.reveal < 0.4 ? '접힘' : state.reveal < 0.7 ? '절반 펼침' : '펼침'} aria-orientation="vertical"
              onPointerDown={beginDrag} onPointerMove={moveDrag} onPointerUp={event => endDrag(event)} onPointerCancel={event => endDrag(event, true)} onLostPointerCapture={event => endDrag(event, true)}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  dispatch({ type: 'advance-sheet' });
                  return;
                }
                const index = stops.indexOf(snapSheet(state.reveal) as typeof stops[number]);
                if (['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
                  event.preventDefault();
                  const target = event.key === 'Home' ? stops[0] : event.key === 'End' ? stops[2] : stops[Math.max(0, Math.min(2, index + (event.key === 'ArrowUp' ? 1 : -1)))];
                  dispatch({ type: 'sheet', reveal: target });
                }
              }}><span /></div>
            <div className={styles.sheetControls}>
              <button type="button" onClick={() => dispatch({ type: 'advance-sheet' })}>{state.reveal < 0.7 ? <Plus size={14} /> : <Minus size={14} />}<span>{state.reveal < 0.4 ? '펼치기' : state.reveal < 0.7 ? '더 펼치기' : '접기'}</span></button>
            </div>
            {selected ? <div className={styles.selectedContent}>
              <div className={styles.placeHeading}><div><span>{selected.category}</span><h3>{selected.name}</h3></div><button type="button" aria-label="장소 선택 해제" onClick={() => dispatch({ type: 'clear' })}><X size={20} /></button></div>
              <div className={styles.savedBy}><span><Users size={14} /> {selected.members.length}</span><span>{members.filter(member => selected.members.includes(member.id)).map(member => member.name).join(', ')}</span></div>
              {state.reveal >= 0.45 && <button ref={detailTrigger} type="button" className={styles.detailButton} onClick={() => { setDetailOpen(true); requestAnimationFrame(() => detailBack.current?.focus()); }}>자세히 보러 가기 <ChevronRight size={16} /></button>}
            </div> : <>
              <div className={styles.meetingTitle}><h3>연남동 주말 모임</h3><button type="button" onClick={reset} aria-label="모임 지도 새로고침"><RotateCcw size={17} /></button></div>
              <div className={styles.members}>
                <button type="button" className={styles.member} aria-pressed={state.member === null} onClick={() => { if (state.member !== null) dispatch({ type: 'filter', member: state.member }); }}><span className={styles.allProfiles}><Users size={23} /></span><span>전체</span></button>
                {members.map(member => <button type="button" key={member.id} className={styles.member} aria-pressed={state.member === member.id} onClick={() => dispatch({ type: 'filter', member: member.id })}><Image src={profiles[member.level - 1]} width={54} height={54} alt="" /><span>{member.name}</span></button>)}
              </div>
              {state.reveal >= 0.45 && <div className={styles.list} aria-label="등록된 장소 목록">
                {visible.map(place => <button type="button" key={place.id} className={styles.placeRow} onClick={() => dispatch({ type: 'select', id: place.id })}><Image src={profiles[place.level - 1]} width={36} height={36} alt="" /><span><strong>{place.name}</strong><small>{place.category}</small></span><span className={styles.rowAction}>상세정보<ChevronRight size={12} /></span></button>)}
              </div>}
            </>}
            </div>
          </div>
          {detailOpen && selected && <section className={styles.detailPage} aria-label={`${selected.name} 예시 상세 정보`}>
            <button ref={detailBack} type="button" onClick={closeDetail}><ArrowLeft size={20} /> 지도로 돌아가기</button>
            <Image src={profiles[selected.level - 1]} width={84} height={84} alt="" />
            <span className={styles.detailCategory}>{selected.category}</span><h3>{selected.name}</h3><p>{selected.address}</p>
            <div className={styles.savedBy}><Users size={16} /><span>{members.filter(member => selected.members.includes(member.id)).map(member => member.name).join(', ')} 님이 저장했어요</span></div>
            <p className={styles.exampleNote}>재현 데모의 예시 장소 정보입니다.</p>
          </section>}
      </IPhoneMockup>
    </div>
    {!snapshot && <div className={styles.srOnly} role="status">{selected ? `${selected.name} 선택됨` : '선택 해제, 장소 목록 표시'}</div>}
  </figure>;
}
