# recognize/urls.py
from django.urls import path
from . import views, api_views

urlpatterns = [
    path('register/', views.register_person, name='register'),
    path("identify/", views.identify_person, name='identify'),

    # New api end points
    path('api/register/', api_views.api_register_person, name='api_register'),
    path('api/identify/', api_views.api_identify_person, name='api_identify'),
]

