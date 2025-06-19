import os
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.conf import settings
from transformers import pipeline, SpeechT5Processor, SpeechT5ForTextToSpeech
from datasets import load_dataset
import soundfile as sf
import torch
import pdfplumber
import mimetypes
import ffmpeg
from django.http import JsonResponse
from .models import Person
from .face_utils import extract_embedding, match_embedding
import gc
from pathlib import Path

from transformers import (
    SpeechT5Processor, SpeechT5ForTextToSpeech,
    pipeline
)



@csrf_exempt
def api_pdf_summarizer(request):
    if request.method != 'POST' or 'pdf' not in request.FILES:
        return JsonResponse({'error': 'POST a PDF file under key "pdf"'}, status=400)

    pdf_file = request.FILES['pdf']
    path = os.path.join(settings.MEDIA_ROOT, pdf_file.name)
    with open(path, 'wb+') as dest:
        for chunk in pdf_file.chunks():
            dest.write(chunk)

    paragraphs = []
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                for para in text.split('\n\n'):
                    cleaned = para.strip()
                    if len(cleaned.split()) > 10:
                        paragraphs.append(cleaned)

    summarizer = pipeline("summarization", model="facebook/bart-large-cnn", device=-1)
    summaries = []
    for para in paragraphs:
        try:
            truncated = ' '.join(para.split()[:1024])
            summary = summarizer(truncated, max_length=60, min_length=20, do_sample=False)[0]['summary_text']
            summaries.append(summary)
        except Exception as e:
            summaries.append(f"[Error: {str(e)}]")

    del summarizer
    gc.collect()
    return JsonResponse({'summaries': summaries})

@csrf_exempt
def api_text_to_speech(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST allowed'}, status=405)

    import torch
    import soundfile as sf
    from transformers import (
        SpeechT5Processor, SpeechT5ForTextToSpeech,
        SpeechT5HifiGan
    )
    from datasets import load_dataset

    try:
        text = request.POST.get('text')
        if not text:
            return JsonResponse({'error': 'Text is required'}, status=400)

        # Load all components
        processor = SpeechT5Processor.from_pretrained("microsoft/speecht5_tts")
        model = SpeechT5ForTextToSpeech.from_pretrained("microsoft/speecht5_tts").to("cuda")
        vocoder = SpeechT5HifiGan.from_pretrained("microsoft/speecht5_hifigan").to("cuda")

        dataset = load_dataset("Matthijs/cmu-arctic-xvectors", split="validation")
        speaker_embedding = torch.tensor(dataset[7306]["xvector"]).unsqueeze(0).to("cuda")

        inputs = processor(text=text, return_tensors="pt").to("cuda")

        # Predict spectrogram
        with torch.no_grad():
            spectrogram = model.generate_speech(inputs["input_ids"], speaker_embedding)

        # Convert spectrogram to waveform using vocoder
        with torch.no_grad():
            waveform = vocoder(spectrogram)

        audio_path = os.path.join(settings.MEDIA_ROOT, "output.wav")
        sf.write(audio_path, waveform.squeeze().cpu().numpy(), samplerate=16000)

        # Cleanup
        del model, processor, vocoder, inputs, spectrogram, waveform
        torch.cuda.empty_cache()

        return JsonResponse({'audio_url': f"{settings.MEDIA_URL}output.wav"})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def api_speech_to_text(request):
    if request.method != 'POST' or 'audio' not in request.FILES:
        return JsonResponse({'error': 'POST an audio file under key "audio"'}, status=400)

    audio_file = request.FILES['audio']
    path = os.path.join(settings.MEDIA_ROOT, audio_file.name)
    with open(path, 'wb+') as dest:
        for chunk in audio_file.chunks():
            dest.write(chunk)

    mime_type, _ = mimetypes.guess_type(path)
    is_video = mime_type and mime_type.startswith('video')

    if is_video:
        wav_path = f"{path}.wav"
        ffmpeg.input(path).output(wav_path, ac=1, ar='16000').run(overwrite_output=True)
        os.remove(path)
    else:
        wav_path = path

    asr_pipeline = pipeline(
        "automatic-speech-recognition",
        model="openai/whisper-small",
        device=-1,
    )

    try:
        result = asr_pipeline(wav_path)
        transcript = result['text']
        os.remove(wav_path)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

    del asr_pipeline
    gc.collect()
    return JsonResponse({'transcript': transcript})


# ---- Face Recognition ----
@csrf_exempt
def api_register_person(request):
    if request.method != "POST":
        return JsonResponse({'error': 'Only POST method allowed'}, status=405)
    
    name = request.POST.get('name')
    image = request.FILES.get('image')
    
    if not name or not image:
        return JsonResponse({'error': 'Name and image are required.'}, status=400)

    try:
        person = Person(name=name, image=image)
        embedding = extract_facenet_embedding(image)
        person.set_embedding(embedding)
        person.save()
        return JsonResponse({
            'message': 'Person registered successfully!',
            'person_id': person.id,
            'name': person.name
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def api_identify_person(request):
    if request.method != "POST":
        return JsonResponse({'error': 'Only POST method allowed'}, status=405)
    
    if 'image' not in request.FILES:
        return JsonResponse({'error': 'Image is required'}, status=400)
    
    try:
        image = request.FILES["image"]
        emb = extract_facenet_embedding(image)
        persons = Person.objects.all()
        match, score = match_embedding(emb, persons)
        
        return JsonResponse({
            "match": match.name if match else None,
            "person_id": match.id if match else None,
            "score": float(score),
            "confidence": "high" if score > 0.8 else "medium" if score > 0.6 else "low"
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

