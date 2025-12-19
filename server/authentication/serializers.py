from rest_framework import serializers
from django.contrib.auth.models import User
from django.db import transaction
from .models import UserProfile, Transaction  # <--- Make sure Transaction is added here!
import re

# 1. Register Serializer (With Validation)
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    aadhaar_number = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'aadhaar_number']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email address is already registered.")
        return value

    def validate_password(self, value):
        if len(value) < 6:
            raise serializers.ValidationError("Password must be at least 6 characters long.")
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter.")
        if not re.search(r'\d', value):
            raise serializers.ValidationError("Password must contain at least one number.")
        return value

    def create(self, validated_data):
        with transaction.atomic():
            aadhaar_input = validated_data.pop('aadhaar_number')
            password = validated_data.pop('password')

            # Clean Aadhaar: Remove hyphens/spaces
            clean_aadhaar = ''.join(filter(str.isdigit, aadhaar_input))

            user = User.objects.create(**validated_data)
            user.set_password(password)
            user.save()

            profile = UserProfile(user=user)
            profile.set_aadhaar(clean_aadhaar)
            profile.save()

            return user

# 2. User Profile Serializer
class UserProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email')
    username = serializers.CharField(source='user.username')
    aadhaar_number = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ['username', 'email', 'aadhaar_number', 'balance'] # Added balance

    def get_aadhaar_number(self, obj):
        decrypted_value = obj.get_aadhaar()
        if not decrypted_value: return ""
        digits = ''.join(filter(str.isdigit, decrypted_value))
        if len(digits) == 12:
            return f"{digits[:4]}-{digits[4:8]}-{digits[8:]}"
        return decrypted_value

# 3. Transaction Serializer (For History)
class TransactionSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    receiver_name = serializers.CharField(source='receiver.username', read_only=True)

    class Meta:
        model = Transaction
        fields = ['id', 'sender_name', 'receiver_name', 'amount', 'timestamp', 'status']

# 4. Transfer Serializer (For Input)
class TransferSerializer(serializers.Serializer):
    receiver_username = serializers.CharField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)

class UserOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username']