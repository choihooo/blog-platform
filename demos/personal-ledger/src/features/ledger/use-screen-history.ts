import { useState } from 'react';
export type Screen = 'home' | 'transactions' | 'compare' | 'settings' | 'salary' | 'assets';
// Keep the parent article's browser back/forward history intact.
export function useScreenHistory() { return useState<Screen>('home'); }
