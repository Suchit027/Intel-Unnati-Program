from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .models import Person
from .face_utils import extract_embedding, match_embedding

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
        embedding = extract_embedding(image)
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
        emb = extract_embedding(image)
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
