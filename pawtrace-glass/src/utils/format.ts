const compactFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

export const formatMetricValue = (
  value: number,
  unit: string,
  decimals = 0,
) => {
  if (unit === 'people' || unit === 'devices') {
    return compactFormatter.format(value);
  }

  return `${value.toFixed(decimals)} ${unit}`.trim();
};

export const formatDelta = (value: number) => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};

export const formatNetworkValue = (value: number, suffix: string) => {
  if (suffix === '%') {
    return `${value.toFixed(2)}%`;
  }

  if (suffix === 'ms') {
    return `${value.toFixed(0)} ms`;
  }

  return `${value.toFixed(1)} ${suffix}`;
};

export const formatClock = (value: Date) =>
  new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Shanghai',
  }).format(value);

export const formatLongDate = (value: Date) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Shanghai',
  }).format(value);
