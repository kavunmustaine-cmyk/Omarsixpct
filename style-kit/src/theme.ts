// Six% house style — design tokens.
// Inspired by the reference reels (see ../../taste.md), not copied from them.
import { Easing } from "remotion";
import { loadFont as loadArabic } from "@remotion/google-fonts/IBMPlexSansArabic";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

const arabic = loadArabic("normal", { weights: ["500", "700"], subsets: ["arabic", "latin"] });
const inter = loadInter("normal", { weights: ["500", "700", "800"], subsets: ["latin"] });
const mono = loadMono("normal", { weights: ["500"], subsets: ["latin"] });

export const fonts = {
  arabic: arabic.fontFamily,
  latin: inter.fontFamily,
  mono: mono.fontFamily,
};

// Two worlds: INK (dark explainer) and SAND (light paper). One hot accent, one cool counter-accent.
export const color = {
  ink: "#0F0D0C", // warm near-black, never pure #000
  inkRaised: "#1A1716", // cards on ink
  inkLine: "rgba(255,255,255,0.08)",
  sand: "#F2EDE4", // light-mode ground
  sandRaised: "#FBF8F3",
  chalk: "#FFFFFF",
  chalkDim: "rgba(255,255,255,0.42)", // upcoming caption words
  ember: "#FF5B2E", // THE accent: keywords, active states, glow
  emberGlow: "rgba(255,91,46,0.45)",
  tide: "#22A39A", // counter-accent: only for "after / solved / gain" states
  graphite: "#2A2622", // text on sand
};

// Motion: fast-out, no bounce. Things arrive quickly and settle; they never wobble.
export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1), // expo-out feel
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
};

export const timing = {
  enter: 7, // frames @30fps (~230ms)
  exit: 5, // ~170ms
  swap: 5, // content crossfade inside a persistent container
  stagger: 3, // between sibling elements building in (~100ms)
};

export const FPS = 30;
export const W = 1080;
export const H = 1920;
// Instagram UI-safe zone for captions: keep text between 55% and 72% of height.
export const CAPTION_Y = 0.63;
