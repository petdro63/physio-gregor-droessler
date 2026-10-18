# Original German narration for the demonstration. Uses installed Windows TTS.
Add-Type -AssemblyName System.Speech
$physioRoot = Split-Path -Parent $PSScriptRoot
$physioVoiceFile = Join-Path $physioRoot 'server/assets/knie-strecken-de-voice.wav'
$physioNarrator = [System.Speech.Synthesis.SpeechSynthesizer]::new()
try {
    $physioNarrator.SelectVoice('Microsoft Katja')
    $physioNarrator.Rate = -1
    $physioNarrator.SetOutputToWaveFile($physioVoiceFile)
    $physioNarrator.Speak('Setzen Sie sich aufrecht hin. Strecken Sie ein Knie langsam nach vorn. Senken Sie das Bein anschließend kontrolliert wieder ab. Atmen Sie ruhig weiter.')
}
finally { $physioNarrator.Dispose() }
