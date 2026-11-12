export type SheetSizing = 'fixed' | 'responsive';

// useDrawer.ts at 992d3cd: the previous top point was -500px.
// This compares travel from y=0, not the original drawer's visible height.
export function upperSheetTravel(height: number, sizing: SheetSizing): number {
  if (sizing === 'fixed') return 500;
  const ratio = height <= 668 ? 0.55 : height <= 850 ? 0.6 : 0.575;
  return height * ratio;
}
