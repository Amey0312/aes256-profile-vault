from cryptography.fernet import Fernet
from django.conf import settings
import os
from dotenv import load_dotenv

load_dotenv()

class EncryptionManager:
    def __init__(self):
        key = os.getenv('ENCRYPTION_KEY')
        if not key:
            raise ValueError("ENCRYPTION_KEY not found in .env file")
        self.cipher = Fernet(key.encode())

    def encrypt(self, data: str) -> str:
        """Encrypts a raw string and returns a string."""
        if not data:
            return None
        encrypted_bytes = self.cipher.encrypt(data.encode())
        return encrypted_bytes.decode()

    def decrypt(self, token: str) -> str:
        """Decrypts an encrypted string and returns the raw string."""
        if not token:
            return None
        decrypted_bytes = self.cipher.decrypt(token.encode())
        return decrypted_bytes.decode()