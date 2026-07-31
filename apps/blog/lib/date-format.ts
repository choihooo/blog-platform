const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  timeZone: "Asia/Seoul",
});

const dateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
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

export function formatPostDate(value: string) {
  const date = parseDate(value);
  return date ? dateFormatter.format(date) : value;
}

export function formatPostDateTime(value: string) {
  const date = parseDate(value);
  return date ? dateTimeFormatter.format(date) : value;
}
