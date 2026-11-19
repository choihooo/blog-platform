// The embedded demo must never register the production app's service worker.
export function usePwa() { return { available: false, update() {} }; }
