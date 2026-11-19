"use client";
import { useState } from 'react';
import { createDemoStore } from '../../demo-model';
import { today } from '../../domain/analytics';
import type { Command } from '../../domain/types';
export function useLedger() {
  const [store] = useState(() => createDemoStore(today()));
  const [ledger, setLedger] = useState(() => store.read());
  const [error, setError] = useState('');
  return {
    phase: 'open' as 'loading' | 'error' | 'open', record: {ledger, pending: false}, error, setError,
    conflict: null, busy: false, status: '예시 데이터',
    async execute(command: Command) { store.execute(command); setLedger(store.read()); },
    async resolve(choice: 'local' | 'server') { void choice; },
  };
}
