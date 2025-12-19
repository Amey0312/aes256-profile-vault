from django.test import TestCase
from .utils import EncryptionManager

class EncryptionTests(TestCase):
    def setUp(self):
        self.encryptor = EncryptionManager()
        self.sensitive_data = "1234-5678-9012"

    def test_encryption_decryption_cycle(self):
        """Test that data can be encrypted and successfully decrypted."""
        encrypted = self.encryptor.encrypt(self.sensitive_data)
        decrypted = self.encryptor.decrypt(encrypted)
        self.assertEqual(self.sensitive_data, decrypted)

    def test_encryption_randomness(self):
        """Test that encryption produces different outputs (ciphertext) for the same input 
           (if using a randomized padding scheme like Fernet)."""
        encrypted_1 = self.encryptor.encrypt(self.sensitive_data)
        encrypted_2 = self.encryptor.encrypt(self.sensitive_data)
        
        # Fernet produces different ciphertexts for the same input due to IV/Salt
        self.assertNotEqual(encrypted_1, encrypted_2)
        # But both should decrypt to the same value
        self.assertEqual(self.encryptor.decrypt(encrypted_1), self.sensitive_data)
        self.assertEqual(self.encryptor.decrypt(encrypted_2), self.sensitive_data)
    
    def test_empty_input(self):
        """Test handling of empty strings."""
        self.assertIsNone(self.encryptor.encrypt(""))
        self.assertIsNone(self.encryptor.decrypt(""))