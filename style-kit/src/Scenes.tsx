import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { color, ease, fonts, timing } from "./theme";

// Placeholder for raw talking-head footage. Swap for <OffthreadVideo src=...> in real edits.
// `punchAt` simulates the jump-cut rule: alternate 100% / 108% framing on every cut.
export const FootagePlate: React.FC<{ punchAt?: number[] }> = ({ punchAt = [] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cuts = punchAt.filter((t) => frame >= t * fps).length;
  const scale = cuts % 2 === 0 ? 1 : 1.08;
  const drift = interpolate(frame, [0, 600], [0, 40]);
  return (
    <AbsoluteFill style={{ background: "#5a5048", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `scale(${scale}) translateY(${-drift}px)`,
          background:
            "radial-gradient(40% 26% at 50% 30%, #c9b8a6 0%, #8c7a6b 45%, transparent 75%)," +
            "radial-gradient(70% 45% at 50% 85%, #3b3430 0%, transparent 70%)," +
            "linear-gradient(180deg, #b9ada0 0%, #6d625a 60%, #2c2724 100%)",
        }}
      />
      <AbsoluteFill style={{ background: "radial-gradient(90% 70% at 50% 45%, transparent 55%, rgba(0,0,0,0.45))" }} />
      <div
        style={{
          position: "absolute",
          top: 70,
          width: "100%",
          textAlign: "center",
          fontFamily: fonts.mono,
          fontSize: 22,
          letterSpacing: "0.3em",
          color: "rgba(255,255,255,0.55)",
        }}
      >
        RAW FOOTAGE PLACEHOLDER
      </div>
    </AbsoluteFill>
  );
};

// Light "SAND" beat — used for the close / summary. Calm ground, graphite type, ember used once.
export const SandScene: React.FC<{ label: string; lines: { main: string; sub?: string; rtl?: boolean }[]; cta: string; ctaRtl?: boolean }> = ({
  label,
  lines,
  cta,
  ctaRtl,
}) => {
  const frame = useCurrentFrame();
  const b = (k: number) =>
    interpolate(frame, [k * timing.stagger * 2, k * timing.stagger * 2 + timing.enter], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: ease.out,
    });
  return (
    <AbsoluteFill style={{ background: color.sand, alignItems: "center", justifyContent: "center", paddingBottom: 120 }}>
      <div style={{ fontFamily: fonts.mono, fontSize: 28, letterSpacing: "0.3em", color: "rgba(42,38,34,0.5)", opacity: b(0) }}>
        {label}
      </div>
      <div style={{ marginTop: 70, width: 940, display: "flex", flexDirection: "column", gap: 30 }}>
        {lines.map((l, k) => (
          <div
            key={k}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 28,
              padding: "40px 44px",
              borderRadius: 26,
              background: color.sandRaised,
              boxShadow: "0 12px 40px rgba(60,40,20,0.08)",
              opacity: b(k + 1),
              transform: `translateX(${(1 - b(k + 1)) * 40}px)`,
            }}
          >
            <div style={{ fontFamily: fonts.mono, fontSize: 36, color: color.ember }}>{String(k + 1).padStart(2, "0")}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: l.rtl ? fonts.arabic : fonts.latin, fontWeight: 700, fontSize: l.rtl ? 60 : 54, letterSpacing: l.rtl ? 0 : "-0.02em", color: color.graphite, direction: l.rtl ? "rtl" : "ltr" }}>{l.main}</div>
              {l.sub ? <div style={{ fontFamily: fonts.latin, fontWeight: 500, fontSize: 32, color: "rgba(42,38,34,0.6)", marginTop: 6 }}>{l.sub}</div> : null}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 80,
          padding: "26px 56px",
          borderRadius: 999,
          background: color.graphite,
          color: color.sand,
          fontFamily: ctaRtl ? fonts.arabic : fonts.latin,
          fontWeight: 700,
          fontSize: 46,
          opacity: b(lines.length + 2),
          transform: `scale(${0.92 + 0.08 * b(lines.length + 2)})`,
        }}
      >
        {cta}
      </div>
    </AbsoluteFill>
  );
};
