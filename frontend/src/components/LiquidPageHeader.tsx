type HeaderStat = {
  label: string;
  value: string;
};

type LiquidPageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  stats?: HeaderStat[];
};

export function LiquidPageHeader({
  eyebrow,
  title,
  description,
  stats = [],
}: LiquidPageHeaderProps) {
  return (
    <section className="liquid-page-hero">
      <div className="space-y-2">
        <p className="liquid-kicker">{eyebrow}</p>
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight text-dark sm:text-[2rem]">{title}</h2>
          <p className="max-w-2xl text-sm leading-6 text-gray-600 sm:text-[15px]">{description}</p>
        </div>
      </div>
      {stats.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {stats.map((stat) => (
            <div key={`${stat.label}-${stat.value}`} className="liquid-inline-stat">
              <span className="liquid-inline-stat__value">{stat.value}</span>
              <span className="liquid-inline-stat__label">{stat.label}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
