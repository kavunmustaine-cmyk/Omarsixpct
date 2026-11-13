# Six% — Taste Profile v1

Built from 4 reference reels (2026-11-12). This is a house style **inspired by** them, not a copy of any one.
Every edit should follow this file unless the brief says otherwise.

| Ref | Creator | What I took from it |
|---|---|---|
| ref1 | Six% (Arabic, 41s) | B-roll hook, two-person jump cuts, bilingual stacked captions |
| ref2 | Sarene Alsharif (EN, 49s) | Persistent top card that "updates" with the talk, calm word captions |
| ref3 | six% auto (Arabic, 57s) | Dark explainer beats, one hot accent colour, cards that swap content, captions that survive cuts |
| ref4 | AI with Akram (EN, 95s) | Light paper world, spoken-word highlighting, step progress, soft cards |

---

## 1. Pace

**Measured in the references**

| | ref1 | ref2 | ref3 | ref4 |
|---|---|---|---|---|
| Visual change every | 1.7 s | ~2.5 s (card) / 5.5 s (frame) | 3.3 s | ~3–5 s |
| Hard cuts | 15 in 41 s | 0 (one take) | 3 (to/from full-screen graphics) | 0 (all graphic) |
| Dead air (silence ≥ 0.25 s at −35 dB) | none | none | none | 1 × 0.28 s |

Takeaway: all four run a continuous music bed under the voice, with every pause cut, so there is never a silent moment.

**Our rules**
- **Hook in 0–3 s.** Open on the boldest line or an off-format shot (b-roll, a graphic, a number). Never open on "hi guys".
- **Something changes every 1.5–2.5 s**: a cut, a punch-in, a caption keyword pop, or a card update. Never more than 3 s of an unchanged frame.
- **Cut every pause > 0.3 s.** Keep breaths only where a beat needs to land.
- **Jump cuts alternate framing**: 100% → 108% → 100%. With two speakers, cut between them instead.
- **One full-screen INK beat every ~15–20 s** to reset attention. 3–5 s long, hard cut in and out.
- **Length:** 40–60 s. Close with one line and one action (save / comment / follow). No long outros.

## 2. Captions

- **Bilingual stack** (our signature): Arabic primary (big, bold), English translation underneath (about 45% of the Arabic size). English-only videos drop the second line.
- **1–4 words per chunk**, and a new chunk with each phrase. Never two lines of primary text.
- **Word-by-word reveal**: spoken words full white, upcoming words at 42% opacity, so the eye follows the voice.
- **Hot words** (numbers, the payoff noun, the verb of the idea) turn **Ember** with a short scale settle (114% → 100%, 200 ms) and a soft glow. At most 1–2 per chunk.
- **Position:** the rule is *never over the face, never under the Instagram UI* (keep everything above 84% of height).
  - Footage with headroom: captions' top edge at 63%; overlay cards in the top third.
  - Tight framing (eyes above ~35%, like IMG_0086): captions just under the chin (60%); cards on the chest, below the captions (69–84%).
  - Captions and cards never collide.
- **Captions survive cuts.** The same chunk keeps playing across a hard cut into an INK scene.
- **Type:** IBM Plex Sans Arabic 700 / Inter 700 (EN primary) / Inter 500 (EN translation). A soft shadow, never a box or outline.

## 3. Colour

Two worlds, **one** hot accent. The accent is reserved for meaning: if everything is orange, nothing is.

| Token | Hex | Use |
|---|---|---|
| Ink | `#0F0D0C` | Full-screen explainer ground (warm, never pure black) |
| Ink raised | `#1A1716` | Cards/chips on ink |
| Sand | `#F2EDE4` | Light "paper" beats: summaries, lists, closes |
| Chalk | `#FFFFFF` | Captions and primary text on ink/footage |
| Graphite | `#2A2622` | Text on sand |
| **Ember** | `#FF5B2E` | THE accent: hot words, active states, rings, glow |
| Tide | `#22A39A` | Counter-accent, only for "after / solved / gained" moments |

- Footage stays natural: a light warm grade, no heavy LUTs. The graphics carry the colour.
- Ember glow is allowed on ink only; on sand, Ember is flat.

## 4. Motion

- **Feel:** fast out, soft settle, **no bounce**. Easing `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Enter 230 ms** (7f @30fps), **exit 170 ms**, **content swap 170 ms** (crossfade + 10 px rise).
- **Build with stagger**: siblings arrive about 100 ms apart (headline → main visual → chips).
- **Persistent containers:** a card enters once, then only its contents change. No card enters and leaves for every sentence.
- **Slow push** on full-screen scenes (100% → 103.5% over the beat) so nothing is ever static.
- **Meaningful motion only:** rings drain, meters fill, chips light up in sequence with the speech. Decoration that doesn't track the talk gets cut.
- Hard cuts between worlds (footage ↔ ink ↔ sand). No whip pans or zoom transitions.

## 5. Deliberately NOT copied

- No pixel-art mascot or avatar (ref2, ref4).
- No dotted-grid paper or serif-italic card titles (ref4).
- No hub-and-spoke node diagrams with dashed connectors (ref3). We use rings, meters and chip rows.
- No handwritten kicker font (ref2).
- No red-on-black only: our accent is Ember orange with a Teal counter-state, plus a light Sand world.

## 6. Building blocks (Remotion) — `style-kit/`

| Component | What it does |
|---|---|
| `Captions` | Bilingual word-by-word captions with Ember hot words |
| `OverlayCard` | Top-third persistent card: mono label, title, hot line, segmented meter (Ember → Tide at 100%) |
| `InkScene` | Full-screen dark beat: kicker, Ember headline, draining ring timer, chips lighting in sequence |
| `SandScene` | Light close: numbered rule cards + pill CTA |
| `FootagePlate` | Placeholder for raw footage; demonstrates the 100/108% punch-in rule |

Render the demo: `cd style-kit && npm run render` → `out/style-demo.mp4`
Live preview: `npm run studio`

## 7. Edit checklist

1. Transcribe with Whisper (`--word_timestamps True`), cut all pauses > 0.3 s and every fumbled retake.
2. Find the hook line and move it to 0 s if it isn't already there.
3. Mark 1–2 hot words per sentence.
4. Place an INK beat at the main idea and every ~15–20 s after.
5. Add a persistent card wherever the speaker lists, compares or counts.
6. Check: nothing static for > 3 s, captions never overlap cards, Ember used only for meaning.
7. Close on the SAND scene with a single action.
