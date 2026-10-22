#!/usr/bin/env python3
"""Create self-hosted, script-free animated GIF artwork for the GitHub profile."""
from pathlib import Path
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets"
OUT.mkdir(exist_ok=True)
W, H = 1050, 348
PALETTE = [(76, 225, 199), (125, 159, 255), (193, 120, 255), (255, 149, 101), (113, 211, 254)]
FONT_ROOT = "/usr/share/fonts/truetype/dejavu"
FONT_BOLD = f"{FONT_ROOT}/DejaVuSans-Bold.ttf"
FONT_REG = f"{FONT_ROOT}/DejaVuSans.ttf"
FONT_MONO = f"{FONT_ROOT}/DejaVuSansMono.ttf"
brand = ImageFont.truetype(FONT_BOLD, 124)
lead = ImageFont.truetype(FONT_REG, 26)
meta = ImageFont.truetype(FONT_MONO, 12)
terminal_font = ImageFont.truetype(FONT_MONO, 16)

def interpolate(a, b, f):
    f = f * f * (3 - 2 * f)
    return tuple(round(a[i] * (1-f) + b[i] * f) for i in range(3))

def color(t):
    v = (t % 1) * len(PALETTE)
    return interpolate(PALETTE[int(v)], PALETTE[(int(v)+1) % len(PALETTE)], v-int(v))

def rgba(c, opacity):
    return (*c, opacity)

Y, X = np.mgrid[:H, :W]
glow_a = np.exp(-(((X-815)/280)**2 + ((Y-168)/190)**2) * 1.28)
glow_b = np.exp(-(((X-945)/345)**2 + ((Y-240)/235)**2) * 1.34)

def hero_frame(i, count=28):
    phase = i / count
    accent, secondary = color(phase), color(phase+.29)
    glow = np.clip(glow_a * .30 + glow_b * .12, 0, .42)
    arr = np.stack([
        8 + 4*X/W + accent[0]*glow*.59 + secondary[0]*glow_b*.04,
        14 + 2*Y/H + accent[1]*glow*.52 + secondary[1]*glow_b*.05,
        22 + 2*X/W + accent[2]*glow*.51 + secondary[2]*glow_b*.05,
    ], axis=2)
    image = Image.fromarray(np.uint8(np.clip(arr, 0, 255)), "RGB").convert("RGBA")
    overlay = Image.new("RGBA", image.size, (0,0,0,0))
    d = ImageDraw.Draw(overlay)
    for x in range(28,W,46):
        d.line([(x,20),(x,H-20)], fill=(185,215,233,12))
    for y in range(30,H,46):
        d.line([(28,y),(W-28,y)], fill=(185,215,233,11))
    d.line([(30,62),(W-30,62)],fill=(175,207,223,38))
    d.line([(30,H-55),(W-30,H-55)],fill=(175,207,223,38))
    cx,cy = 840,174
    for k in range(12):
        rx, ry = 85+k*9, 110-k*4
        start=-150+k*17+round(phase*35)
        d.arc((cx-rx,cy-ry,cx+rx,cy+ry),start=start,end=start+275,
              fill=rgba(accent if k%2==0 else secondary,65),width=2)
    for k in range(23):
        a=k*math.tau/23+phase*math.tau/8
        radius=100+24*math.sin(k*2.24+phase*math.tau)
        x=cx+radius*math.cos(a)
        y=cy+radius*math.sin(a)*.79
        d.ellipse((x-2,y-2,x+2,y+2),fill=rgba(accent,140 if k%4 else 235))
    for k in range(4):
        rr=58+k*33
        start=k*57+round(phase*110)
        d.arc((cx-rr,cy-rr,cx+rr,cy+rr),start=start,end=start+84,
              fill=rgba(accent,155-k*24),width=2)
    d.ellipse((cx-18,cy-18,cx+18,cy+18),outline=rgba(secondary,210),width=2)
    d.ellipse((cx-5,cy-5,cx+5,cy+5),fill=rgba(accent,240))
    for k in range(20):
        amp=.5+.5*math.sin(k*.6+phase*math.tau)
        x=918+k*4
        d.line((x,39,x,39+round(4+10*amp)),
               fill=rgba(accent,80+round(amp*140)),width=2)
    image = Image.alpha_composite(image, overlay)
    d = ImageDraw.Draw(image)
    d.text((45,30),"S K U U I L L   /   D E V E L O P E R   P R O F I L E",
           font=meta,fill=(181,206,220,240))
    d.text((37,83),"SKULL",font=brand,fill=(240,247,252,255))
    bounds = d.textbbox((37,83),"SKULL",font=brand)
    d.ellipse((bounds[2]+9,184,bounds[2]+24,199),fill=rgba(accent,255))
    d.text((45,232),"Software that moves ideas forward.",font=lead,fill=(220,234,242,255))
    d.text((45,H-38),"WEB   /   MOBILE   /   BACKEND   /   AUTOMATION",
           font=meta,fill=(163,194,208,245))
    d.text((840,H-38),"SK / SIGNAL",font=meta,fill=rgba(accent,245))
    return image.convert("RGB").quantize(colors=64,method=Image.Quantize.MEDIANCUT,
                                           dither=Image.Dither.NONE)

frames = [hero_frame(i) for i in range(28)]
frames[0].save(OUT/"hero-kinetic-v2.gif",save_all=True,append_images=frames[1:],
               optimize=True,disposal=2,loop=0,duration=130)

lines = [
    '$ git commit -m "ship useful software"',
    '$ npm run check    - 0 errors',
    '$ deploy --production    - ready',
    '$ designing, building, automating...'
]
term = []
for i in range(24):
    tw,th=1050,88
    im=Image.new("RGB",(tw,th),(10,18,27))
    d=ImageDraw.Draw(im)
    d.rounded_rectangle((2,2,tw-3,th-3),radius=16,outline=(51,71,82),width=2)
    for k,c in enumerate([(255,112,120),(255,203,96),(76,225,199)]):
        d.ellipse((26+k*17,20,34+k*17,28),fill=c)
    d.text((102,15),"skull@studio:~",font=meta,fill=(140,184,195))
    line=lines[(i//6)%len(lines)]
    d.text((34,49),line[:min(len(line),6+(i%6)*10)]+("|" if i%4<2 else " "),
           font=terminal_font,fill=color(i/24))
    term.append(im.quantize(colors=48,method=Image.Quantize.MEDIANCUT))
term[0].save(OUT/"terminal-v2.gif",save_all=True,append_images=term[1:],
             optimize=True,disposal=2,loop=0,duration=240)

for path in [OUT/"hero-kinetic-v2.gif",OUT/"terminal-v2.gif"]:
    print(f"{path.name}: {path.stat().st_size} bytes")
