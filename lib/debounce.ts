export function createDebouncedTask<T>(callback: (value: T) => void, delay = 300) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  function cancel() {
    clearTimeout(timer);
    timer = undefined;
  }
  return {
    schedule(value: T) {
      cancel();
      timer = setTimeout(() => {
        timer = undefined;
        callback(value);
      }, delay);
    },
    cancel,
  };
}
