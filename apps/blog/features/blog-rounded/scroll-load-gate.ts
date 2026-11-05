export function createScrollLoadGate() {
  let loading = false;
  let completedAt: number | null = null;
  return {
    request(scrollY: number, maxScrollY = Infinity) {
      const threshold = completedAt === null ? null : Math.min(completedAt, maxScrollY - 1);
      if (loading || (maxScrollY > 0 && threshold !== null && scrollY <= threshold)) return false;
      loading = true;
      return true;
    },
    complete(scrollY: number) {
      loading = false;
      completedAt = scrollY;
    },
  };
}
