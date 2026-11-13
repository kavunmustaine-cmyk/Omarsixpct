import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CAPTION_Y, color, ease, fonts, H } from "./theme";

export type Word = { t: string; s: number; e: number; hot?: boolean };
export type Chunk = { words: Word[]; en?: string; rtl?: boolean };

// Bilingual, word-by-word captions.
// - 1–4 words per chunk, primary line big + bold, translation small underneath.
// - Spoken words are full white, upcoming words sit at 42% — the eye is pulled along with the voice.
// - "hot" words pop in ember with a short scale settle.
export const Captions: React.FC<{ chunks: Chunk[]; tone?: "ink" | "sand"; y?: number }> = ({
  chunks,
  tone = "ink",
  y = CAPTION_Y,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const now = frame / fps;

  const idx = chunks.findIndex((c, i) => {
    const start = c.words[0].s;
    const next = chunks[i + 1]?.words[0].s ?? c.words[c.words.length - 1].e + 0.35;
    return now >= start && now < next;
  });
  if (idx === -1) return null;
  const chunk = chunks[idx];
  const startF = chunk.words[0].s * fps;

  const enter = interpolate(frame, [startF, startF + 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease.out,
  });

  const on = tone === "ink" ? color.chalk : color.graphite;
  const off = tone === "ink" ? color.chalkDim : "rgba(42,38,34,0.32)";
  const shadow = tone === "ink" ? "0 2px 14px rgba(0,0,0,0.5)" : "none";

  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: H * y,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        opacity: enter,
        transform: `translateY(${(1 - enter) * 14}px)`,
      }}
    >
      <div
        style={{
          direction: chunk.rtl ? "rtl" : "ltr",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: chunk.rtl ? 18 : 16,
          fontFamily: chunk.rtl ? fonts.arabic : fonts.latin,
          fontWeight: 700,
          fontSize: chunk.rtl ? 76 : 70,
          lineHeight: 1.15,
          letterSpacing: chunk.rtl ? 0 : "-0.02em",
          textShadow: shadow,
        }}
      >
        {chunk.words.map((w, i) => {
          const spoken = now >= w.s;
          const pop = interpolate(frame, [w.s * fps, w.s * fps + 6], [1.14, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: ease.out,
          });
          return (
            <span
              key={i}
              style={{
                color: spoken ? (w.hot ? color.ember : on) : off,
                display: "inline-block",
                transform: w.hot && spoken ? `scale(${pop})` : undefined,
                textShadow: w.hot && spoken && tone === "ink" ? `0 0 28px ${color.emberGlow}` : shadow,
              }}
            >
              {w.t}
            </span>
          );
        })}
      </div>
      {chunk.en ? (
        <div
          style={{
            fontFamily: fonts.latin,
            fontWeight: 500,
            fontSize: 34,
            color: tone === "ink" ? "rgba(255,255,255,0.86)" : "rgba(42,38,34,0.7)",
            textShadow: shadow,
          }}
        >
          {chunk.en}
        </div>
      ) : null}
    </div>
  );
};
