import os
import mimetypes
from pathlib import Path
from django.shortcuts import render
from .forms import AudioUploadForm
from transformers import pipeline
import ffmpeg

# Load Whisper model once
asr_pipeline = pipeline("automatic-speech-recognition", model="openai/whisper-large-v3")

def transcribe_audio(request):
    transcript = ""
    if request.method == 'POST':
        form = AudioUploadForm(request.POST, request.FILES)
        if form.is_valid():
            audio = request.FILES['audio_file']

            # Ensure media directory exists
            media_dir = Path("media")
            media_dir.mkdir(parents=True, exist_ok=True)

            # Save uploaded file
            input_path = media_dir / audio.name
            with open(input_path, 'wb+') as dest:
                for chunk in audio.chunks():
                    dest.write(chunk)

            # Determine file type
            mime_type, _ = mimetypes.guess_type(str(input_path))
            is_video = mime_type and mime_type.startswith('video')

            # Extract audio if video
            if is_video:
                audio_path = str(input_path) + ".wav"
                ffmpeg.input(str(input_path)).output(audio_path, ac=1, ar='16000').run(overwrite_output=True)
                os.remove(str(input_path))  # Remove original video
            else:
                audio_path = str(input_path)

            # Transcribe
            result = asr_pipeline(audio_path)
            transcript = result['text']

            # Clean up
            os.remove(audio_path)
    else:
        form = AudioUploadForm()

    return render(request, 'transcriber/index.html', {'form': form, 'transcript': transcript})
