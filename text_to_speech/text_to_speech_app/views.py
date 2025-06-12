from django.shortcuts import render
from transformers import SpeechT5Processor, SpeechT5ForTextToSpeech
from datasets import load_dataset
import torch
import soundfile as sf
import os

# Load once
processor = SpeechT5Processor.from_pretrained("microsoft/speecht5_tts")
model = SpeechT5ForTextToSpeech.from_pretrained("microsoft/speecht5_tts")
dataset = load_dataset("Matthijs/cmu-arctic-xvectors", split="validation")
speaker_embedding = torch.tensor(dataset[7306]["xvector"]).unsqueeze(0)

def synthesize_text(text, path):
    inputs = processor(text=text, return_tensors="pt")
    speech = model.generate_speech(inputs["input_ids"], speaker_embedding)
    sf.write(path, speech.numpy(), 16000, format='WAV')

def index(request):
    return render(request, 'text_to_speech_app/index.html')

def speak(request):
    if request.method == 'POST':
        text = request.POST.get('text')
        output_path = os.path.join('text_to_speech_app', 'static', 'audio', 'output.wav')
        synthesize_text(text, output_path)

        return render(request, 'text_to_speech_app/index.html', {
            'audio_url': '/static/audio/output.wav'
        })
    return render(request, 'text_to_speech_app/index.html')
