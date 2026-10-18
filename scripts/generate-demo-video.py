"""Generate an original schematic video for demonstrating playback only."""
from PIL import Image, ImageDraw, ImageFont
import imageio_ffmpeg, subprocess, math
from pathlib import Path
out=Path('server/assets'); out.mkdir(parents=True,exist_ok=True)
ffmpeg=imageio_ffmpeg.get_ffmpeg_exe()
proc=subprocess.Popen([ffmpeg,'-y','-f','rawvideo','-vcodec','rawvideo','-s','640x400','-pix_fmt','rgb24','-r','24','-i','-','-an','-vcodec','libx264','-pix_fmt','yuv420p','-movflags','+faststart',str(out/'movement.mp4')],stdin=subprocess.PIPE,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
try: font=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',16)
except: font=ImageFont.load_default()
for frame in range(144):
    image=Image.new('RGB',(640,400),'#e9f0e2'); d=ImageDraw.Draw(image)
    d.ellipse((180,40,465,325),fill='#dee8d2');d.ellipse((150,337,490,357),fill='#ceddc3')
    d.line((320,150,320,260),fill='#477c68',width=48)
    d.ellipse((297,90,343,138),fill='#e5b99a');d.ellipse((296,83,345,107),fill='#54473c')
    d.line((320,255,280,337),fill='#344e49',width=22);d.line((320,255,360,337),fill='#344e49',width=22)
    t=math.sin(frame/144*math.pi*2)*.7
    for side in [-1,1]:
        x=320+side*(65+25*math.cos(t)); y=185+45*math.sin(t)
        d.line((320+side*20,165,x,y),fill='#477c68',width=16)
        d.ellipse((x-7,y-7,x+7,y+7),fill='#e5b99a')
    d.text((25,20),'TECHNISCHE DEMONSTRATION',fill='#48633b',font=font)
    d.text((25,368),'Schematische Bewegung - keine therapeutische Anleitung',fill='#667c58',font=font)
    proc.stdin.write(image.tobytes())
proc.stdin.close()
if proc.wait()!=0:raise RuntimeError('Video encoding failed')
(out/'captions.vtt').write_text('WEBVTT\n\n00:00:00.000 --> 00:00:06.000\nSchematische Bewegung zur technischen Demonstration. Keine therapeutische Anleitung.\n',encoding='utf-8')
print('Demo video generated:', (out/'movement.mp4').stat().st_size, 'bytes')
