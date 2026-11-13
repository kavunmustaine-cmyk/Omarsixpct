import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Captions, Chunk } from "./Captions";
import { InkScene } from "./InkScene";
import { OverlayCard } from "./OverlayCard";
import { FootagePlate, SandScene } from "./Scenes";
import { FPS } from "./theme";

// Word timings are hand-placed for the demo. In real edits they come from Whisper (--word_timestamps True).
const w = (t: string, s: number, e: number, hot = false) => ({ t, s, e, hot });

const captions: Chunk[] = [
  { rtl: true, en: "The first 3 seconds", words: [w("أول", 0.15, 0.45), w("3", 0.45, 0.7, true), w("ثواني", 0.7, 1.05)] },
  { rtl: true, en: "are everything", words: [w("هي", 1.15, 1.35), w("كل", 1.35, 1.55, true), w("شي", 1.55, 1.95, true)] },
  { rtl: true, en: "If you don't stop the scroll", words: [w("إذا", 2.15, 2.35), w("ما", 2.35, 2.5), w("وقّفت", 2.5, 2.85), w("السكرول", 2.85, 3.35, true)] },
  { rtl: true, en: "nobody hears the rest", words: [w("ما", 3.45, 3.6), w("حدا", 3.6, 3.8), w("رح", 3.8, 3.95), w("يسمع", 3.95, 4.2), w("الباقي", 4.2, 4.7)] },
  { rtl: true, en: "You have to stop the eye", words: [w("لازم", 5.0, 5.3), w("توقّف", 5.3, 5.7), w("العين", 5.7, 6.2, true)] },
  { rtl: true, en: "before you get to the idea", words: [w("قبل", 6.45, 6.7), w("ما", 6.7, 6.85), w("توصل", 6.85, 7.2), w("للفكرة", 7.2, 7.8)] },
  { rtl: true, en: "Something new every two seconds", words: [w("كل", 8.7, 8.9), w("ثانيتين", 8.9, 9.35), w("شي", 9.35, 9.55), w("جديد", 9.55, 10.0, true)] },
  { rtl: true, en: "and people stay with you", words: [w("والناس", 10.4, 10.8), w("بتضل", 10.8, 11.15), w("معك", 11.15, 11.7, true)] },
];

const s = (sec: number) => Math.round(sec * FPS);

export const DEMO_SECONDS = 15;

export const Demo: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    {/* Beat 1 — footage, hook captions, one punch-in jump cut */}
    <Sequence from={0} durationInFrames={s(4.8)}>
      <FootagePlate punchAt={[2.1]} />
    </Sequence>

    {/* Beat 2 — hard cut to INK explainer */}
    <Sequence from={s(4.8)} durationInFrames={s(3.6)}>
      <InkScene kicker="عندك" hot="3 ثواني" rtl seconds={3} chips={["HOOK", "CAPTION", "MOTION", "CTA"]} duration={3.6} />
    </Sequence>

    {/* Beat 3 — back to footage (other framing) with persistent card */}
    <Sequence from={s(8.4)} durationInFrames={s(3.8)}>
      <FootagePlate punchAt={[0]} />
    </Sequence>
    <Sequence from={s(8.5)} durationInFrames={s(3.7)}>
      <OverlayCard
        out={3.7}
        states={[
          { at: 0, label: "01 / RULE", title: "كل ثانيتين", hot: "شي جديد", rtl: true, meter: 0.5 },
          { at: 1.9, label: "02 / RESULT", title: "الناس بتضل", hot: "لآخر الفيديو", rtl: true, meter: 1 },
        ]}
      />
    </Sequence>

    {/* Captions run across beats 1–3 (they survive cuts) */}
    <Sequence from={0} durationInFrames={s(12.2)}>
      <Captions chunks={captions} />
    </Sequence>

    {/* Beat 4 — light SAND close */}
    <Sequence from={s(12.2)} durationInFrames={s(DEMO_SECONDS - 12.2)}>
      <SandScene
        label="SIX% — STYLE KIT"
        lines={[
          { main: "اكسب العين بأول 3 ثواني", sub: "Win the eye in 3 seconds", rtl: true },
          { main: "شي جديد كل ثانيتين", sub: "Something new every 2 seconds", rtl: true },
          { main: "لون واحد للتركيز", sub: "One accent colour for focus", rtl: true },
        ]}
        cta="احفظ الفيديو"
        ctaRtl
      />
    </Sequence>
  </AbsoluteFill>
);
