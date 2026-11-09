// 비교 데모에서 옳은 쪽(✓)과 아닌 쪽(✗)을 표시하는 배지

export function CrossBadge() {
  return (
    <svg
      className="size-5 text-neutral-400 dark:text-neutral-500"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM7.28 6.22a.75.75 0 0 0-1.06 1.06L8.94 10l-2.72 2.72a.75.75 0 1 0 1.06 1.06L10 11.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L11.06 10l2.72-2.72a.75.75 0 0 0-1.06-1.06L10 8.94 7.28 6.22Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function CheckBadge() {
  return (
    <svg className="size-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.86-9.94a.75.75 0 1 0-1.22-.87l-2.96 4.15-1.4-1.4a.75.75 0 1 0-1.06 1.06l2.03 2.03a.75.75 0 0 0 1.14-.1l3.47-4.87Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
