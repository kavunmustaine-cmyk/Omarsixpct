import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Captions, Chunk } from "./Captions";
import { InkScene } from "./InkScene";
import { ListInk } from "./ListInk";
import { CardState, OverlayCard } from "./OverlayCard";
import { SandScene } from "./Scenes";

export type EditData = {
  fps: number;
  duration: number; // seconds
  video: string; // file in public/
  captionY?: number; // fraction of height (default from theme)
  cardTop?: number; // fraction of height
  cuts: number[]; // jump-cut times (s) in the edited video -> framing alternates
  captions: Chunk[];
  cards: { from: number; to: number; states: CardState[] }[];
  inks: (
    | { kind: "list"; from: number; to: number; kicker: string; hot: string; items: { label: string; at: number }[] }
    | { kind: "ring"; from: number; to: number; kicker: string; hot: string; seconds: number; chips: string[] }
  )[];
  outro?: { from: number; label: string; lines: { main: string; sub?: string; rtl?: boolean }[]; cta: string; ctaRtl?: boolean };
};

// Talking-head plate: 100% / 108% framing alternates on every jump cut, plus a slow 2% drift
// within each shot so a held frame is never fully static.
const Footage: React.FC<{ src: string; cuts: number[] }> = ({ src, cuts }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const n = cuts.filter((c) => t >= c).length;
  const shotStart = n === 0 ? 0 : cuts[n - 1];
  const base = n % 2 === 0 ? 1 : 1.08;
  const drift = 1 + Math.min(0.02, (t - shotStart) * 0.004);
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <OffthreadVideo
        src={staticFile(src)}
        style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${base * drift})`, transformOrigin: "50% 38%" }}
      />
    </AbsoluteFill>
  );
};

export const EditVideo: React.FC<{ data: EditData }> = ({ data }) => {
  const f = (s: number) => Math.round(s * data.fps);
  const end = data.outro ? data.outro.from : data.duration;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Sequence from={0} durationInFrames={f(data.duration)}>
        <Footage src={data.video} cuts={data.cuts} />
      </Sequence>

      {data.inks.map((k, i) => (
        <Sequence key={`ink${i}`} from={f(k.from)} durationInFrames={f(k.to - k.from)}>
          {k.kind === "list" ? (
            <ListInk kicker={k.kicker} hot={k.hot} items={k.items} duration={k.to - k.from} />
          ) : (
            <InkScene kicker={k.kicker} hot={k.hot} seconds={k.seconds} chips={k.chips} duration={k.to - k.from} />
          )}
        </Sequence>
      ))}

      {data.cards.map((c, i) => (
        <Sequence key={`card${i}`} from={f(c.from)} durationInFrames={f(c.to - c.from)}>
          <OverlayCard states={c.states} out={c.to - c.from} top={data.cardTop} />
        </Sequence>
      ))}

      <Sequence from={0} durationInFrames={f(end)}>
        <Captions chunks={data.captions} y={data.captionY} />
      </Sequence>

      {data.outro ? (
        <Sequence from={f(data.outro.from)} durationInFrames={f(data.duration - data.outro.from)}>
          <SandScene label={data.outro.label} lines={data.outro.lines} cta={data.outro.cta} ctaRtl={data.outro.ctaRtl} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};
