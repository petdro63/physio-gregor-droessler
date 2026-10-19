"""Convert verified public-domain CDC GIFs to local stills and silent videos."""
import hashlib
import json
import subprocess
import sys
from pathlib import Path
from urllib.parse import quote
from PIL import Image, ImageOps

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tmp/media-tools'))
import imageio_ffmpeg

specs=[('biceps-curl','Biceps curl','Bizepscurl im Sitz'),('hip-abduction','Hip abduction','Seitliches Beinheben mit Halt'),('knee-extension','Knee extension','Kniestreckung im Sitz'),('squat','Squat','Aufstehen und Hinsetzen')]
manifest=[]
for key,name,title in specs:
    source=ROOT/f'tmp/research/cdc/{key}.gif'
    gif=Image.open(source)
    if gif.format!='GIF' or gif.n_frames<2: raise ValueError(f'Invalid animation: {source}')
    out=ROOT/f'server/assets/catalog/cdc-{key}'
    out.mkdir(parents=True,exist_ok=True)
    # Keep the native aspect ratio and original image pixels; pad odd sizes only.
    frames=[]
    for i in range(gif.n_frames):
        gif.seek(i)
        rgb=Image.new('RGB',gif.size,'white')
        rgba=gif.convert('RGBA');rgb.paste(rgba,mask=rgba.getchannel('A'))
        duration=max(gif.info.get('duration',100),40)/1000
        frames.append((rgb,duration))
    frames[0][0].save(out/'start.png')
    frames[len(frames)//2][0].save(out/'movement.png')
    duration=sum(d for _,d in frames)
    fps=25
    ffmpeg=imageio_ffmpeg.get_ffmpeg_exe()
    width,height=gif.size
    args=[ffmpeg,'-hide_banner','-loglevel','error','-y','-f','rawvideo','-vcodec','rawvideo','-s',f'{width}x{height}','-pix_fmt','rgb24','-r',str(fps),'-i','-','-an','-vf','pad=ceil(iw/2)*2:ceil(ih/2)*2:color=white','-vcodec','libx264','-pix_fmt','yuv420p','-movflags','+faststart',str(out/'video.mp4')]
    process=subprocess.Popen(args,stdin=subprocess.PIPE)
    for im,seconds in frames:
        for _ in range(max(1,round(seconds*fps))): process.stdin.write(im.tobytes())
    process.stdin.close()
    if process.wait()!=0: raise RuntimeError('Video encoding failed')
    caption=f'{title}. Allgemeine CDC-Bewegungsanimation. Belastung und Bewegungsumfang individuell festlegen.'
    (out/'captions.vtt').write_text('WEBVTT\n\n00:00:00.000 --> 00:00:30.000\n'+caption+'\n',encoding='utf-8')
    manifest.append(dict(id='cdc-'+key,title=title,creator='Centers for Disease Control and Prevention (CDC)',sourceUrl='https://commons.wikimedia.org/wiki/File:'+quote(name+'-CDC strength training for older adults.gif'),license='Public Domain – US-Bundesbehörde CDC',licenseUrl='https://commons.wikimedia.org/wiki/Template:PD-USGov-HHS-CDC',changes='GIF in MP4 konvertiert; zwei Standbilder und eigene deutsche Untertitel erstellt. Kein Ton. Keine Bewegungsinterpolation.',reviewedOn='2026-10-19',sourceSha256=hashlib.sha256(source.read_bytes()).hexdigest(),duration=duration,files=['start.png','movement.png','video.mp4','captions.vtt']))
(ROOT/'src/catalog-media.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'{len(manifest)} media sets with 2 stills, MP4 and captions each')
