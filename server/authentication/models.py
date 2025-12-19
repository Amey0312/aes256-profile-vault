from django.db import models
from django.contrib.auth.models import User
from .utils import EncryptionManager

# Initialize encryption utility
encryptor = EncryptionManager()

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone_number = models.CharField(max_length=15, blank=True)
    # Storing encrypted data as a TextField to accommodate ciphertext length
    encrypted_aadhaar = models.TextField() 

    def set_aadhaar(self, raw_aadhaar):
        """Encrypts and stores the Aadhaar number."""
        self.encrypted_aadhaar = encryptor.encrypt(raw_aadhaar)

    def get_aadhaar(self):
        """Returns the decrypted Aadhaar number."""
        return encryptor.decrypt(self.encrypted_aadhaar)

    def __str__(self):
        return self.user.username