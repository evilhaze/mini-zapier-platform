'use client';

export function LandingBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Large blurred shapes */}
      <div className="landing-bg-layer landing-bg-layer--large" />

      {/* Medium lightning icons */}
      <div className="landing-bg-layer landing-bg-layer--medium" />

      {/* Fine pattern layer */}
      <div className="landing-bg-layer landing-bg-layer--fine" />
    </div>
  );
}

