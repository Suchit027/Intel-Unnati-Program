# recognize/urls.py
from django.urls import path
from . import views, api_views

urlpatterns = [
    path('register/', views.register_person, name='register'),
    path("identify/", views.identify_person, name='identify'),

    path('api/register/', api_views.api_register_person, name='api_register'),
    path('api/identify/', api_views.api_identify_person, name='api_identify'),
    path('api/pdf-summarize/', api_views.api_pdf_summarizer, name='api_pdf_summarizer'),
    path('api/text-to-speech/', api_views.api_text_to_speech, name='api_text_to_speech'),
    path('api/speech-to-text/', api_views.api_speech_to_text, name='api_speech_to_text'),

]

