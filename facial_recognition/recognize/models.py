# recognize/models.py
from django.db import models
import json
import numpy as np

class Person(models.Model):
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to="faces/")
    embedding_json = models.TextField(blank=True, null=True)

    def set_embedding(self, embedding_tensor):
        self.embedding_json = json.dumps(embedding_tensor.squeeze(0).tolist())

    def get_embedding(self):
        return np.array(json.loads(self.embedding_json))
