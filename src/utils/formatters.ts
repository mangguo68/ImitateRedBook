export function formatLikeCount(count: number): string {
  if (count >= 99990000) {
    return '9999万+'
  } else if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万'
  } else {
    return count.toString()
  }
}
