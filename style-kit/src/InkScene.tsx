import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { color, ease, fonts, timing } from "./theme";

// Full-screen "INK" explainer beat. Hard-cut in from footage; elements build with a short stagger.
// Layout: kicker + ember headline (top), a draining ring timer (centre), a row of chips that light
// up one by one as the ring drains (bottom-centre). Captions keep running over it.
export const InkScene: React.FC<{
  kicker: string;
  hot: string;
  rtl?: boolean;
  seconds: number; // ring counts down from this
  chips: string[];
  duration: number; // seconds
}> = ({ kicker, hot, rtl, seconds, chips, duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const build = (k: number) =>
    interpolate(frame, [k * timing.stagger, k * timing.stagger + timing.enter], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: ease.out,
    });

  // Ring drains across the scene (after the build), chips light per quarter.
  const runStart = 8;
  const runEnd = duration * fps - 6;
  const p = interpolate(frame, [runStart, runEnd], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const remaining = Math.ceil(seconds * (1 - p) * 10) / 10;
  const R = 190;
  const C = 2 * Math.PI * R;
  const push = interpolate(frame, [0, duration * fps], [1, 1.035]);

  return (
    <AbsoluteFill style={{ background: color.ink, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(60% 38% at 50% 52%, rgba(255,91,46,0.16), transparent 70%)`,
          transform: `scale(${push})`,
        }}
      />
      {/* fine grain so the ink never looks flat/digital */}
      <AbsoluteFill
        style={{
          opacity: 0.06,
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,.5) 0 1px, transparent 1px 3px)",
        }}
      />
      <AbsoluteFill style={{ transform: `scale(${push})`, alignItems: "center" }}>
        <div style={{ marginTop: 250, textAlign: "center", direction: rtl ? "rtl" : "ltr" }}>
          <div
            style={{
              fontFamily: rtl ? fonts.arabic : fonts.latin,
              fontWeight: 500,
              fontSize: 46,
              color: "rgba(255,255,255,0.78)",
              opacity: build(0),
              transform: `translateY(${(1 - build(0)) * 16}px)`,
            }}
          >
            {kicker}
          </div>
          <div
            style={{
              fontFamily: rtl ? fonts.arabic : fonts.latin,
              fontWeight: 700,
              fontSize: 120,
              lineHeight: 1.1,
              color: color.ember,
              textShadow: `0 0 50px ${color.emberGlow}`,
              opacity: build(1),
              transform: `scale(${1.12 - 0.12 * build(1)})`,
            }}
          >
            {hot}
          </div>
        </div>

        <div style={{ position: "relative", marginTop: 70, width: 460, height: 460, opacity: build(2), transform: `scale(${0.9 + 0.1 * build(2)})` }}>
          <svg width={460} height={460} style={{ position: "absolute", inset: 0 }}>
            <circle cx={230} cy={230} r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={18} />
            <circle
              cx={230}
              cy={230}
              r={R}
              fill="none"
              stroke={color.ember}
              strokeWidth={18}
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * p}
              transform="rotate(-90 230 230)"
              style={{ filter: `drop-shadow(0 0 16px ${color.emberGlow})` }}
            />
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ fontFamily: fonts.mono, fontSize: 120, color: color.chalk, letterSpacing: "-0.02em" }}>
              {remaining.toFixed(1)}
            </div>
            <div style={{ fontFamily: fonts.mono, fontSize: 24, letterSpacing: "0.3em", color: "rgba(255,255,255,0.45)" }}>SEC</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 18, marginTop: 70, direction: "ltr" }}>
          {chips.map((c, k) => {
            const lit = p >= (k + 1) / chips.length - 0.001;
            const b = build(3 + k);
            return (
              <div
                key={k}
                style={{
                  padding: "18px 26px",
                  borderRadius: 18,
                  background: lit ? "rgba(255,91,46,0.14)" : color.inkRaised,
                  border: `1px solid ${lit ? "rgba(255,91,46,0.6)" : color.inkLine}`,
                  fontFamily: fonts.mono,
                  fontSize: 26,
                  letterSpacing: "0.08em",
                  color: lit ? color.chalk : "rgba(255,255,255,0.45)",
                  opacity: b,
                  transform: `translateY(${(1 - b) * 20}px)`,
                }}
              >
                {c}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
