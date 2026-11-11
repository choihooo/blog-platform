export type DemoState = { selectedId: string | null; member: number | null; reveal: number };
export type DemoAction =
  | { type: 'select'; id: string }
  | { type: 'clear' }
  | { type: 'filter'; member: number }
  | { type: 'sheet'; reveal: number }
  | { type: 'advance-sheet' }
  | { type: 'reset' };

export const initialState: DemoState = { selectedId: null, member: null, reveal: 0.28 };
export const stops = [0.28, 0.52, 0.8] as const;

export function snapSheet(reveal: number): number {
  return stops.reduce<number>((closest, stop) => Math.abs(stop - reveal) < Math.abs(closest - reveal) ? stop : closest, stops[0]);
}

export function transition(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case 'select': return { ...state, selectedId: action.id, reveal: Math.max(state.reveal, 0.52) };
    case 'clear': return { ...state, selectedId: null, reveal: stops[0] };
    case 'filter': return { ...state, selectedId: null, member: state.member === action.member ? null : action.member };
    case 'sheet': return { ...state, reveal: Math.max(stops[0], Math.min(stops[2], action.reveal)) };
    case 'advance-sheet': return { ...state, reveal: state.reveal < stops[1] - 0.01 ? stops[1] : state.reveal < stops[2] - 0.01 ? stops[2] : stops[0] };
    case 'reset': return initialState;
  }
}

// Example content for the reconstruction; not live service data or venue coordinates.
export const members = [
  { id: 1, name: '지우', level: 2 },
  { id: 2, name: '민서', level: 3 },
  { id: 3, name: '하린', level: 4 },
] as const;

export const places = [
  { id: 'bread', name: '맛있는 빵집', category: '베이커리', level: 4, x: 57, y: 32, members: [1, 2, 3], address: '연남동 골목 안, 갓 구운 빵이 있는 곳' },
  { id: 'bar', name: '더 루미니', category: 'BAR', level: 3, x: 26, y: 43, members: [1, 2], address: '연남동에서 함께 이야기 나눌 공간' },
  { id: 'coffee', name: '리틀포레스트 커피', category: '카페', level: 1, x: 79, y: 44, members: [3], address: '산책하다 잠깐 쉬어갈 카페' },
  { id: 'chili', name: 'chili2', category: '음식점', level: 3, x: 39, y: 20, members: [1, 2], address: '친구들과 함께 가고 싶은 음식점' },
  { id: 'dining', name: '토끼다이닝', category: '음식점', level: 2, x: 76, y: 16, members: [2], address: '모임에서 함께 고른 저녁 식사 후보' },
  { id: 'cafe', name: '유채색', category: '카페', level: 1, x: 23, y: 61, members: [1], address: '다음 모임에 들러보고 싶은 카페' },
  { id: 'pizza', name: '더피자', category: '음식점', level: 2, x: 66, y: 59, members: [2], address: '여럿이 함께 나눠 먹을 저녁 메뉴' },
];
