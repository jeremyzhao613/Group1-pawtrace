import { graphic } from 'echarts';
import type { EChartsOption } from 'echarts';
import type { ChartSeries } from '@/types';

const rgba = (hex: string, alpha: number) => {
  const normalized = hex.replace('#', '');
  const hexValue =
    normalized.length === 3
      ? normalized
          .split('')
          .map((character) => `${character}${character}`)
          .join('')
      : normalized;

  const numericValue = Number.parseInt(hexValue, 16);
  const red = (numericValue >> 16) & 255;
  const green = (numericValue >> 8) & 255;
  const blue = numericValue & 255;

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

const baseText = 'rgba(223, 244, 255, 0.84)';
const mutedText = 'rgba(163, 201, 214, 0.58)';
const gridLine = 'rgba(116, 230, 255, 0.12)';

export const buildThroughputOption = (
  series: ChartSeries,
  accent: string,
): EChartsOption => ({
  animationDuration: 600,
  grid: {
    top: 24,
    right: 12,
    bottom: 18,
    left: 12,
    containLabel: true,
  },
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(7, 14, 19, 0.96)',
    borderColor: 'rgba(116, 230, 255, 0.16)',
    textStyle: {
      color: baseText,
    },
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: series.labels,
    axisLine: {
      lineStyle: {
        color: gridLine,
      },
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      color: mutedText,
      fontSize: 10,
    },
  },
  yAxis: {
    type: 'value',
    splitLine: {
      lineStyle: {
        color: 'rgba(116, 230, 255, 0.05)',
      },
    },
    axisLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      color: mutedText,
      fontSize: 10,
      formatter: (value: number) => `${value.toFixed(0)} ${series.unit}`,
    },
  },
  series: [
    {
      type: 'line',
      smooth: true,
      showSymbol: false,
      lineStyle: {
        color: accent,
        width: 2.8,
      },
      areaStyle: {
        color: new graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: rgba(accent, 0.42) },
          { offset: 1, color: rgba(accent, 0) },
        ]),
      },
      emphasis: {
        focus: 'series',
      },
      data: series.values,
    },
  ],
});

export const buildAvailabilityOption = (
  series: ChartSeries,
  accent: string,
): EChartsOption => {
  const minimumValue = Math.min(...series.values) - 0.16;
  const maximumValue = Math.max(...series.values) + 0.16;

  return {
    animationDuration: 600,
    grid: {
      top: 24,
      right: 12,
      bottom: 18,
      left: 12,
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(7, 14, 19, 0.96)',
      borderColor: 'rgba(116, 230, 255, 0.16)',
      textStyle: {
        color: baseText,
      },
    },
    xAxis: {
      type: 'category',
      data: series.labels,
      axisLine: {
        lineStyle: {
          color: gridLine,
        },
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: mutedText,
        fontSize: 10,
      },
    },
    yAxis: {
      type: 'value',
      min: Number(minimumValue.toFixed(2)),
      max: Number(maximumValue.toFixed(2)),
      splitLine: {
        lineStyle: {
          color: 'rgba(116, 230, 255, 0.05)',
        },
      },
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: mutedText,
        fontSize: 10,
        formatter: (value: number) => `${value.toFixed(2)}%`,
      },
    },
    series: [
      {
        type: 'bar',
        barWidth: '42%',
        itemStyle: {
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: rgba(accent, 0.75) },
            { offset: 1, color: rgba(accent, 0.22) },
          ]),
          borderRadius: [10, 10, 0, 0],
        },
        data: series.values,
      },
      {
        type: 'line',
        smooth: true,
        showSymbol: false,
        lineStyle: {
          color: '#eff9ff',
          width: 1.6,
        },
        data: series.values,
      },
    ],
  };
};
