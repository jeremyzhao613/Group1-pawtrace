import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

interface ChartPanelProps {
  option: EChartsOption;
  subtitle: string;
  title: string;
}

export const ChartPanel = ({
  option,
  subtitle,
  title,
}: ChartPanelProps) => (
  <section className="hud-panel p-5">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="eyebrow">{title}</p>
        <p className="mt-2 text-sm text-[var(--muted)]">{subtitle}</p>
      </div>
      <span className="hud-chip !px-3 !py-2 text-[0.66rem]">Live</span>
    </div>

    <div className="mt-4">
      <ReactECharts
        lazyUpdate
        notMerge
        option={option}
        opts={{ renderer: 'svg' }}
        style={{ height: 190 }}
      />
    </div>
  </section>
);
