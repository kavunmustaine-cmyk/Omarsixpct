import sys, subprocess, numpy as np, colorsys
def frame(path, t, w=180):
    out = subprocess.run(["ffmpeg","-v","error","-ss",str(t),"-i",path,"-frames:v","1","-vf",f"scale={w}:-2","-f","rawvideo","-pix_fmt","rgb24","-"],capture_output=True,check=True).stdout
    return np.frombuffer(out,np.uint8).reshape(-1,3).astype(int)
for spec in sys.argv[1:]:
    path,t = spec.split("@")
    px = frame(path,t)
    q = (px//24)*24+12
    keys,counts = np.unique(q,axis=0,return_counts=True)
    order = np.argsort(-counts)
    dom = ["#%02x%02x%02x %d%%"%(*keys[i],100*counts[i]//len(px)) for i in order[:5]]
    # most saturated frequent accents
    sat = [(colorsys.rgb_to_hsv(*(keys[i]/255))[1], i) for i in order if counts[i] > len(px)*0.002]
    acc = [ "#%02x%02x%02x"%tuple(keys[i]) for s,i in sorted(sat,reverse=True)[:3] if s>0.45]
    print(f"{spec:16} dominant: {', '.join(dom)} | accents: {', '.join(acc)}")
