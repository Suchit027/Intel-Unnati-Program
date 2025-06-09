from django.urls import path
from .views import transcribe_audio

urlpatterns = [
    path('', transcribe_audio, name='transcribe_audio'),
]
