"""Convert the locally recorded, original WebM animation into app assets."""
from pathlib import Path
import shutil, subprocess, sys
import imageio_ffmpeg

if len(sys.argv) != 2:
    raise SystemExit('Aufruf: python scripts/finish-knee-video.py PFAD_ZUR_EIGENEN_WEBM_DATEI')
source=Path(sys.argv[1]).resolve()
if not source.is_file():
    raise SystemExit('Die eigene Aufnahme fehlt.')
assets=Path('server/assets');assets.mkdir(parents=True,exist_ok=True)
output=Path('output');output.mkdir(parents=True,exist_ok=True)
tmp=Path('tmp/video-qa');tmp.mkdir(parents=True,exist_ok=True)
ffmpeg=imageio_ffmpeg.get_ffmpeg_exe()
def run(args):
    result=subprocess.run([ffmpeg,'-hide_banner','-loglevel','error','-y',*args],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    if result.returncode:
        raise RuntimeError(result.stderr.decode('utf-8',errors='replace'))
video=assets/'knie-avatar-de.mp4'
run(['-i',str(source),'-i',str(assets/'knie-strecken-de-voice.wav'),'-map','0:v:0','-map','1:a:0','-vf','fps=30,tpad=stop_mode=clone:stop_duration=0.2','-t','16','-c:v','libx264','-preset','medium','-crf','20','-pix_fmt','yuv420p','-c:a','aac','-ar','48000','-b:a','160k','-af','adelay=700,apad,loudnorm=I=-18:TP=-1.5:LRA=7','-movflags','+faststart',str(video)])
run(['-ss','6.3','-i',str(video),'-frames:v','1','-q:v','2',str(assets/'knie-avatar-de-poster.jpg')])
for at,label in [(1,'ausgang'),(6.3,'streckung'),(8.7,'absenken')]:
    run(['-ss',str(at),'-i',str(video),'-frames:v','1',str(tmp/(label+'.png'))])
vtt='''WEBVTT

00:00:00.700 --> 00:00:03.200
Setzen Sie sich aufrecht hin.

00:00:03.200 --> 00:00:06.800
Strecken Sie ein Knie langsam nach vorn.

00:00:06.800 --> 00:00:10.400
Senken Sie das Bein anschließend kontrolliert wieder ab.

00:00:10.400 --> 00:00:13.200
Atmen Sie ruhig weiter.

00:00:13.200 --> 00:00:16.000
Demonstrationsentwurf: vor therapeutischer Verwendung fachlich prüfen.
'''
(assets/'knie-avatar-de.vtt').write_text(vtt,encoding='utf-8')
shutil.copyfile(video,output/'knie-im-sitzen-eigene-animation-de.mp4')
shutil.copyfile(assets/'knie-avatar-de-poster.jpg',output/'knie-eigene-animation-vorschau.jpg')
print('MP4, deutsche Untertitel, Poster und drei Prüfbilder erstellt.')
