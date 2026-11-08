export function getPostRows<T>(posts: T[], visible: number, columns: number): T[][] {
  const rows: T[][] = [];
  for (let index = 0; index < Math.min(visible, posts.length); index += columns) {
    rows.push(posts.slice(index, Math.min(index + columns, visible)));
  }
  return rows;
}
