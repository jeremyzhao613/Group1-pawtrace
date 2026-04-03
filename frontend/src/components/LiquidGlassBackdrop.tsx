type LiquidGlassBackdropProps = {
  variant?: 'app' | 'login';
};

export function LiquidGlassBackdrop({ variant = 'app' }: LiquidGlassBackdropProps) {
  return (
    <div
      aria-hidden="true"
      className={`liquid-glass-backdrop ${variant === 'login' ? 'liquid-glass-backdrop--login' : 'liquid-glass-backdrop--app'}`}
    >
      <span className="liquid-orb liquid-orb--mint" />
      <span className="liquid-orb liquid-orb--sky" />
      <span className="liquid-orb liquid-orb--pearl" />
      <span className="liquid-orb liquid-orb--rose" />
      <span className="liquid-glass-mesh" />
      <span className="liquid-glass-noise" />
    </div>
  );
}
