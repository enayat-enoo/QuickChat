/**
 * Formats a timestamp for display inside a message bubble.
 * e.g. "9:41 AM"
 */
export function formatMessageTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Returns a human-readable date label for the date separator.
 * e.g. "Today", "Yesterday", "Monday", "12 Jan 2024"
 */
export function formatDateLabel(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();
  if (isToday) return "Today";

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();
  if (isYesterday) return "Yesterday";

  // Within the last 7 days — show day name
  const daysDiff = (now - date) / (1000 * 60 * 60 * 24);
  if (daysDiff < 7) {
    return date.toLocaleDateString([], { weekday: "long" });
  }

  // Older — show full date
  return date.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Checks if two timestamps are on different calendar days.
 */
export function isDifferentDay(timestamp1, timestamp2) {
  return (
    new Date(timestamp1).toDateString() !== new Date(timestamp2).toDateString()
  );
}