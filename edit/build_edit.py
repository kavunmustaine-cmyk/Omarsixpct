"""Build the edit for IMG_0086.MOV.

Picks the best take of each line, tightens pauses, cuts on the frame grid, and writes:
  - style-kit/public/cut.mp4   (the spoken cut, cleaned + loudness-normalised audio)
  - style-kit/src/edit.json    (captions, cuts, ink beats, card, outro on the cut timeline)
Run with the whisper venv python (needs numpy):
  ~/.local/pipx/venvs/openai-whisper/bin/python -I edit/build_edit.py
"""
import json, math, re, subprocess, sys, wave
from pathlib import Path
import numpy as np

ROOT = Path("/home/kevin/Omarsixpct")
WORK = ROOT / "edit/work"
SRC = ROOT / "raw footage/IMG_0086.MOV"
FPS = 25

# Chosen takes (source seconds) in playback order, with hot words per take.
TAKES = [
    ((7.08, 10.46), ["library", "scattered"]),          # Imagine your life is a library...
    ((38.48, 44.82), ["different"]),                     # Each book represents a different part...
    ((47.70, 50.82), ["job"]),                           # And your job is to pick them up one by one.
    ((58.32, 63.94), ["once", "back"]),                  # But here's the thing... put them back.
    ((143.62, 145.16), ["understand"]),                  # You have to understand what happened.
    ((122.92, 125.70), ["chapter"]),                     # You have to learn from it and take something...
    ((209.40, 214.10), ["harder", "forget"]),            # Some books will be harder... rather forget.
    ((217.74, 220.60), ["teach"]),                       # But every book has something to teach you.
    ((239.68, 243.88), ["rush", "next"]),                # So don't rush through the library. Read one book...
    ((260.46, 264.36), ["today", "happen"]),             # You don't have to finish... let it happen.
]
MAX_GAP = 0.30  # pauses longer than this inside a take are cut

words = json.load(open(WORK / "words.json"))
for w in words:
    w["t"] = w["word"].strip()

# Transcript fixes where Whisper passes disagreed (source time, heard, correct).
FIXES = [(8.16, "is", "as"), (263.04, "breathing", "reading")]
for at, old, new in FIXES:
    for w in words:
        if abs(w["start"] - at) < 0.3 and w["t"].strip(".,").lower() == old:
            w["t"] = w["t"].replace(old, new)
            w["word"] = w["t"]

# ---------- audio energy (10 ms RMS) ----------
with wave.open(str(WORK / "audio.wav")) as wf:
    sr = wf.getframerate()
    pcm = np.frombuffer(wf.readframes(wf.getnframes()), np.int16).astype(np.float32) / 32768
HOP = sr // 100
rms = np.sqrt(np.convolve(pcm**2, np.ones(HOP) / HOP, "same")[::HOP] + 1e-12)
floor = np.percentile(rms, 15)
thr = floor * 10 ** (6 / 20)  # 6 dB over the noise floor = speech
print(f"noise floor {20*np.log10(floor):.1f} dBFS, speech threshold {20*np.log10(thr):.1f} dBFS")

def loud(i):
    return rms[max(0, i) : i + 3].min() > thr if 0 <= i < len(rms) - 3 else False

def onset(lo, hi):
    for i in range(int(lo * 100), int(hi * 100)):
        if loud(i):
            return i / 100
    return None

def offset(lo, hi):
    for i in range(int(hi * 100), int(lo * 100), -1):
        if loud(i - 2):
            return i / 100
    return None

def neighbours(w):
    i = words.index(w)
    prev_end = words[i - 1]["e_src"] if i > 0 else 0.0
    next_start = words[i + 1]["start"] if i + 1 < len(words) else 1e9
    return prev_end, next_start

for w in words:
    w["e_src"] = w["end"]

# ---------- build sub-ranges ----------
segments = []  # dicts: a, b (source), words, take
for ti, ((a, b), hot) in enumerate(TAKES):
    tw = [w for w in words if w["start"] >= a - 0.01 and w["end"] <= b + 0.01]
    assert tw, f"no words in take {ti}"
    groups, cur = [], [tw[0]]
    for p, n in zip(tw, tw[1:]):
        if n["start"] - p["end"] > MAX_GAP:
            groups.append(cur)
            cur = [n]
        else:
            cur.append(n)
    groups.append(cur)
    for g in groups:
        first, last = g[0], g[-1]
        prev_end, _ = neighbours(first)
        _, next_start = neighbours(last)
        on = onset(max(prev_end, first["start"] - 0.35), first["start"] + 0.6)
        s = (on if on is not None else first["start"]) - 0.10
        s = max(s, prev_end + 0.02 if prev_end < first["start"] else s)
        off = offset(last["end"] - 0.6, min(next_start, last["end"] + 0.35))
        e = (off if off is not None else last["end"]) + 0.15
        e = min(e, next_start - 0.02) if next_start > last["end"] else e
        s = math.floor(s * FPS) / FPS
        e = math.ceil(e * FPS) / FPS
        if segments and segments[-1]["take"] == ti and s <= segments[-1]["b"] + 0.2:
            segments[-1]["b"] = e  # tiny gap: merge
            segments[-1]["words"] += g
        else:
            segments.append({"a": s, "b": e, "words": list(g), "take": ti})

t = 0.0
for sgm in segments:
    sgm["out"] = t
    t += sgm["b"] - sgm["a"]
SPEECH_END = t
print(f"{len(segments)} segments, spoken cut = {SPEECH_END:.2f}s")

def to_out(sgm, x):
    x = min(max(x, sgm["a"]), sgm["b"])
    return round(sgm["out"] + x - sgm["a"], 3)

# ---------- words on the output timeline ----------
outw = []
for sgm in segments:
    hot = set(TAKES[sgm["take"]][1])
    for w in sgm["words"]:
        clean = re.sub(r"[.,!…]+$", "", w["t"]).replace("...", "")
        key = re.sub(r"[^a-z']", "", clean.lower())
        outw.append({"t": clean, "s": to_out(sgm, w["start"]), "e": to_out(sgm, w["end"]),
                     "hotkey": key in hot, "take": sgm["take"], "raw": w["t"]})

# ---------- caption chunks: 1–4 words, break on punctuation / pauses / takes ----------
# 1) phrases: break on punctuation, take changes and pauses; 2) split each phrase evenly into <=4-word chunks
phrases, cur = [], []
for i, w in enumerate(outw):
    cur.append(w)
    nxt = outw[i + 1] if i + 1 < len(outw) else None
    if nxt is None or re.search(r"[.,?!]$", w["raw"]) or nxt["take"] != w["take"] or nxt["s"] - w["e"] > 0.25:
        phrases.append(cur)
        cur = []
chunks = []
MAX_CHARS = 24  # ~26 chars fit one line at 70px; keep a margin so captions never wrap

def split_even(p, k):
    base, extra = divmod(len(p), k)
    out, i = [], 0
    for j in range(k):
        size = base + (1 if j < extra else 0)
        out.append(p[i : i + size])
        i += size
    return out

for p in phrases:
    k = math.ceil(len(p) / 4)
    parts = split_even(p, k)
    while k < len(p) and any(len(" ".join(w["t"] for w in c)) > MAX_CHARS for c in parts):
        k += 1
        parts = split_even(p, k)
    chunks += parts
captions = []
for c in chunks:
    used = False
    ws = []
    for w in c:
        hot = w["hotkey"] and not used
        used = used or hot
        ws.append({"t": w["t"], "s": w["s"], "e": w["e"], "hot": hot})
    captions.append({"words": ws})

def first(word, take, after=0.0):
    for w in outw:
        if w["take"] == take and w["raw"].lower().strip(".,").startswith(word) and w["s"] >= after:
            return w
    raise KeyError((word, take))

def take_span(ti):
    sg = [s for s in segments if s["take"] == ti]
    return sg[0]["out"], sg[-1]["out"] + sg[-1]["b"] - sg[-1]["a"]

# ---------- graphics on the cut timeline ----------
i1a, i1b = take_span(1)
ink1 = {
    "kind": "list", "from": i1a, "to": i1b, "kicker": "Every book is", "hot": "a part of your life",
    "items": [{"label": lbl, "at": round(first(k, 1)["s"] - i1a, 3)}
              for lbl, k in [("Relationships", "relationships"), ("Mistakes", "mistakes"),
                             ("Dreams", "dreams"), ("Experiences", "experiences")]],
}
c_a, _ = take_span(2)
_, c_b = take_span(5)
card = {"from": c_a, "to": c_b, "states": [
    {"at": 0, "label": "01 / THE JOB", "title": "Pick them up", "hot": "one by one", "meter": 0.25},
    {"at": round(first("can't", 3)["s"] - c_a, 3), "label": "02 / THE CATCH", "title": "You can't lift them", "hot": "all at once", "meter": 0.5},
    {"at": round(take_span(4)[0] - c_a, 3), "label": "03 / EACH BOOK", "title": "Understand what happened", "hot": "Learn from it", "meter": 0.75},
    {"at": round(first("take", 5)["s"] - c_a, 3), "label": "04 / EVERY CHAPTER", "title": "Then", "hot": "take something", "meter": 1},
]}
i2a, i2b = take_span(8)
ink2 = {
    "kind": "list", "from": i2a, "to": i2b, "kicker": "Don't rush.", "hot": "One book at a time",
    "items": [{"label": "Read one book", "at": round(first("read", 8)["s"] - i2a, 3)},
              {"label": "Move on to the next", "at": round(first("next", 8)["s"] - i2a, 3)}],
}
OUTRO = 2.8
duration = round(SPEECH_END + 0.2 + OUTRO, 2)
edit = {
    "fps": FPS, "duration": duration, "video": "cut.mp4", "captionY": 0.60, "cardTop": 0.69,
    "cuts": [round(s["out"], 3) for s in segments[1:]],
    "captions": captions, "cards": [card], "inks": [ink1, ink2],
    "outro": {"from": round(SPEECH_END + 0.2, 2), "label": "THE LIBRARY",
              "lines": [{"main": "Read one book"}, {"main": "Learn from every chapter"}, {"main": "Move on to the next"}],
              "cta": "Save this for a hard day"},
}
(ROOT / "style-kit/src/edit.json").write_text(json.dumps(edit, indent=1, ensure_ascii=False))
json.dump(segments, open(WORK / "segments.json", "w"), indent=1, default=str)
for s in segments:
    print(f"  src {s['a']:7.2f}-{s['b']:7.2f} -> out {s['out']:6.2f}  {' '.join(w['t'] for w in s['words'])}")

# ---------- render the spoken cut ----------
if "--json-only" in sys.argv:
    sys.exit(0)
cmd = ["ffmpeg", "-v", "error", "-y"]
for s in segments:
    cmd += ["-ss", f"{s['a']:.3f}", "-t", f"{s['b']-s['a']:.3f}", "-i", str(SRC)]
parts = []
for i, s in enumerate(segments):
    d = s["b"] - s["a"]
    parts.append(f"[{i}:v:0]fps={FPS},setpts=PTS-STARTPTS[v{i}];"
                 f"[{i}:a:0]aformat=channel_layouts=mono,asetpts=PTS-STARTPTS,afade=t=in:d=0.015,afade=t=out:st={d-0.02:.3f}:d=0.02[a{i}];")
n = len(segments)
fc = "".join(parts) + "".join(f"[v{i}][a{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=1[v][acat];" \
     "[acat]highpass=f=75,afftdn=nf=-28,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000,aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo[a]"
out = ROOT / "style-kit/public/cut.mp4"
cmd += ["-filter_complex", fc, "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "medium", "-crf", "16",
        "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(out)]
subprocess.run(cmd, check=True)
print("wrote", out)
