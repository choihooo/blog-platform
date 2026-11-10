const partsFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Seoul",
});

function parseDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function dateParts(date: Date) {
  const parts = Object.fromEntries(
    partsFormatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
  return {
    year: parts.year,
    month: String(Number(parts.month)),
    day: String(Number(parts.day)),
    dayPeriod:
      parts.dayPeriod === "AM" ? "오전" : parts.dayPeriod === "PM" ? "오후" : parts.dayPeriod,
    hour: String(Number(parts.hour)),
    minute: parts.minute,
  };
}

export function formatPostDate(value: string) {
  const date = parseDate(value);
  if (!date) return value;
  const parts = dateParts(date);
  return `${parts.year}. ${parts.month}. ${parts.day}.`;
}

export function formatPostDateTime(value: string) {
  const date = parseDate(value);
  if (!date) return value;
  const parts = dateParts(date);
  return `${parts.year}. ${parts.month}. ${parts.day}. ${parts.dayPeriod} ${parts.hour}:${parts.minute}`;
}
