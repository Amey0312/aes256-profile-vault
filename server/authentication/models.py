from django.db import models
from django.contrib.auth.models import User
from .utils import EncryptionManager

encryptor = EncryptionManager()

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    encrypted_aadhaar = models.TextField()
    # New Field: Wallet Balance (Default 10,000 for testing)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=10000.00)

    def set_aadhaar(self, raw_aadhaar):
        self.encrypted_aadhaar = encryptor.encrypt(raw_aadhaar)

    def get_aadhaar(self):
        return encryptor.decrypt(self.encrypted_aadhaar)

    def __str__(self):
        return self.user.username

# New Model: Audit Log
class Transaction(models.Model):
    sender = models.ForeignKey(User, related_name='sent_transactions', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='received_transactions', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='SUCCESS')

    def __str__(self):
        return f"{self.sender} -> {self.receiver}: {self.amount}"