from django.shortcuts import render
from transformers import pipeline
import pdfplumber
import os

summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

def index(request):
    return render(request, 'summarizer/index.html')

def summarize_pdf(request):
    if request.method == 'POST' and request.FILES['pdf']:
        pdf_file = request.FILES['pdf']
        media_dir = "media"
        if not os.path.exists(media_dir):
            os.makedirs(media_dir)  # Create the directory if it doesn't exist
        file_path = f"{media_dir}/{pdf_file.name}"
        
        with open(file_path, 'wb+') as destination:
            for chunk in pdf_file.chunks():
                destination.write(chunk)

        # Extract paragraphs
        paragraphs = []
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    for para in text.split('\n\n'):
                        cleaned = para.strip()
                        if len(cleaned.split()) > 10:  # skip short lines
                            paragraphs.append(cleaned)

        # Summarize
        summaries = []
        for para in paragraphs:
            try:
                truncated = ' '.join(para.split()[:1024])
                summary = summarizer(truncated, max_length=60, min_length=20, do_sample=False)[0]['summary_text']
                summaries.append({'original': para, 'summary': summary})
            except Exception as e:
                summaries.append({'original': para, 'summary': f'[Error summarizing paragraph: {str(e)}]'})

        return render(request, 'summarizer/index.html', {'summaries': summaries})

    return render(request, 'summarizer/index.html')
