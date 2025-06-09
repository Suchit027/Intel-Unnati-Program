# recognize/face_utils.py
from transformers import AutoFeatureExtractor, AutoModel
from PIL import Image
import torch
import torch.nn.functional as F

extractor = AutoFeatureExtractor.from_pretrained("jayanta/google-vit-base-patch16-224-cartoon-face-recognition")
model = AutoModel.from_pretrained("jayanta/google-vit-base-patch16-224-cartoon-face-recognition")

model.eval()

def extract_embedding(image_path_or_file):
    image = Image.open(image_path_or_file).convert("RGB")
    inputs = extractor(images=image, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs)
    return outputs.last_hidden_state[:, 0, :]  # CLS token

def match_embedding(target_embedding, stored_embeddings):
    best_score = -1.0
    best_person = None
    for person in stored_embeddings:
        stored_emb = torch.tensor(person.get_embedding()).unsqueeze(0)
        score = F.cosine_similarity(target_embedding, stored_emb).item()
        if score > best_score:
            best_score = score
            best_person = person
    return best_person if best_score > 0.85 else None, best_score
