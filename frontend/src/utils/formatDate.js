const formatWithOptions = (value, options) =>
  new Intl.DateTimeFormat("en-US", options).format(new Date(value));

export const formatDate = (value) =>
  formatWithOptions(value, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

export const formatDateTime = (value) =>
  formatWithOptions(value, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });

export const formatRelativeTime = (value) => {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.round(diff / (1000 * 60));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;

  return formatDate(value);
};

export const formatDuration = (milliseconds) => {
  if (!milliseconds && milliseconds !== 0) return "Unknown latency";
  if (milliseconds < 1000) return `${milliseconds} ms`;
  return `${(milliseconds / 1000).toFixed(1)} s`;
};

