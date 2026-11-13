import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { color, ease, fonts, H, timing } from "./theme";

export type CardState = {
  at: number; // seconds (relative to the card's Sequence)
  label: string; // mono label, e.g. "01 / RULE"
  title: string; // primary line
  hot?: string; // accent line under the title (ember)
  rtl?: boolean;
  meter: number; // 0..1 — fills ember, turns tide at 1
};

// A persistent "explainer card" that lives in the TOP THIRD (captions own the lower middle,
// so the two never fight). The card enters once; afterwards only its contents swap.
export const OverlayCard: React.FC<{ states: CardState[]; out: number; top?: number }> = ({ states, out, top = 0.12 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const now = frame / fps;

  const enter = interpolate(frame, [0, timing.enter], [0, 1], { extrapolateRight: "clamp", easing: ease.out });
  const exit = interpolate(frame, [out * fps - timing.exit, out * fps], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease.inOut,
  });

  let i = 0;
  states.forEach((s, k) => {
    if (now >= s.at) i = k;
  });
  const s = states[i];
  const sF = s.at * fps;
  const swap = i === 0 ? 1 : interpolate(frame, [sF, sF + timing.swap], [0, 1], { extrapolateRight: "clamp", easing: ease.out });

  // Meter eases from previous state's value to this one's.
  const prev = states[i - 1]?.meter ?? 0;
  const meter = interpolate(frame, [sF, sF + 14], [prev, s.meter], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.out });
  const done = meter > 0.999;
  const SEG = 12;

  return (
    <div
      style={{
        position: "absolute",
        left: 56,
        right: 56,
        top: H * top,
        padding: "34px 40px 36px",
        borderRadius: 30,
        background: "rgba(22,19,18,0.78)",
        backdropFilter: "blur(18px)",
        border: `1px solid ${color.inkLine}`,
        boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
        opacity: enter * exit,
        transform: `translateY(${(1 - enter) * -24}px) scale(${0.97 + 0.03 * enter})`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: fonts.mono, fontSize: 24, letterSpacing: "0.18em", color: "rgba(255,255,255,0.5)" }}>
          {s.label}
        </span>
        <span
          style={{
            width: 14,
            height: 14,
            borderRadius: 7,
            background: done ? color.tide : color.ember,
            boxShadow: `0 0 18px ${done ? color.tide : color.emberGlow}`,
          }}
        />
      </div>

      <div
        style={{
          marginTop: 22,
          direction: s.rtl ? "rtl" : "ltr",
          opacity: swap,
          transform: `translateY(${(1 - swap) * 10}px)`,
        }}
      >
        <div
          style={{
            fontFamily: s.rtl ? fonts.arabic : fonts.latin,
            fontWeight: 500,
            fontSize: 44,
            color: "rgba(255,255,255,0.88)",
          }}
        >
          {s.title}
        </div>
        {s.hot ? (
          <div
            style={{
              fontFamily: s.rtl ? fonts.arabic : fonts.latin,
              fontWeight: 700,
              fontSize: 76,
              lineHeight: 1.1,
              marginTop: 6,
              color: done ? color.tide : color.ember,
              textShadow: `0 0 34px ${done ? "rgba(34,163,154,0.4)" : color.emberGlow}`,
            }}
          >
            {s.hot}
          </div>
        ) : null}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 28 }}>
        {Array.from({ length: SEG }).map((_, k) => {
          const fill = Math.max(0, Math.min(1, meter * SEG - k));
          return (
            <div key={k} style={{ flex: 1, height: 12, borderRadius: 4, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
              <div style={{ width: `${fill * 100}%`, height: "100%", background: done ? color.tide : color.ember }} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
