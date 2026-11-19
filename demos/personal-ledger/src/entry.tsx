import { createRoot } from 'react-dom/client';
import { LedgerApp } from './features/ledger/ledger-app';

createRoot(document.getElementById('root')!).render(<LedgerApp />);
