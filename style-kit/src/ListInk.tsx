import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { color, ease, fonts, timing } from "./theme";

// INK beat variant for lists / breakdowns: kicker + Ember headline, then items that land
// one by one, each at the moment it is spoken (`at`, seconds relative to the scene).
// The newest item is lit Ember; earlier ones settle to chalk.
export const ListInk: React.FC<{
  kicker: string;
  hot: string;
  items: { label: string; at: number }[];
  duration: number;
}> = ({ kicker, hot, items, duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const now = frame / fps;
  const b = (startF: number) =>
    interpolate(frame, [startF, startF + timing.enter], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: ease.out,
    });
  const push = interpolate(frame, [0, duration * fps], [1, 1.035]);
  const lastLit = items.reduce((acc, it, k) => (now >= it.at ? k : acc), -1);

  return (
    <AbsoluteFill style={{ background: color.ink, overflow: "hidden" }}>
      <AbsoluteFill
        style={{ background: "radial-gradient(60% 40% at 50% 45%, rgba(255,91,46,0.15), transparent 70%)", transform: `scale(${push})` }}
      />
      <AbsoluteFill
        style={{ opacity: 0.06, backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,.5) 0 1px, transparent 1px 3px)" }}
      />
      <AbsoluteFill style={{ transform: `scale(${push})`, alignItems: "center", paddingTop: 230 }}>
        <div
          style={{
            fontFamily: fonts.latin,
            fontWeight: 500,
            fontSize: 44,
            color: "rgba(255,255,255,0.75)",
            opacity: b(0),
            transform: `translateY(${(1 - b(0)) * 16}px)`,
          }}
        >
          {kicker}
        </div>
        <div
          style={{
            fontFamily: fonts.latin,
            fontWeight: 800,
            fontSize: 112,
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
            textAlign: "center",
            maxWidth: 940,
            color: color.ember,
            textShadow: `0 0 50px ${color.emberGlow}`,
            opacity: b(timing.stagger),
            transform: `scale(${1.1 - 0.1 * b(timing.stagger)})`,
          }}
        >
          {hot}
        </div>
        <div style={{ marginTop: 60, width: 820, display: "flex", flexDirection: "column", gap: 18 }}>
          {items.map((it, k) => {
            const p = b(it.at * fps);
            const lit = k === lastLit;
            return (
              <div
                key={k}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 24,
                  padding: "24px 30px",
                  borderRadius: 20,
                  background: lit ? "rgba(255,91,46,0.13)" : color.inkRaised,
                  border: `1px solid ${lit ? "rgba(255,91,46,0.55)" : color.inkLine}`,
                  opacity: p,
                  transform: `translateX(${(1 - p) * -40}px)`,
                }}
              >
                <span style={{ fontFamily: fonts.mono, fontSize: 26, color: lit ? color.ember : "rgba(255,255,255,0.4)" }}>
                  {String(k + 1).padStart(2, "0")}
                </span>
                <span style={{ fontFamily: fonts.latin, fontWeight: 700, fontSize: 46, color: lit ? color.chalk : "rgba(255,255,255,0.75)" }}>
                  {it.label}
                </span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
