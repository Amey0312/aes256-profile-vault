from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    aadhaar_number = serializers.CharField(write_only=True)  # Input only

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'aadhaar_number']

    def create(self, validated_data):
        # 1. Pop sensitive data
        aadhaar = validated_data.pop('aadhaar_number')
        password = validated_data.pop('password')

        # 2. Create standard User
        user = User.objects.create(**validated_data)
        user.set_password(password) # Standard Django Password Hashing
        user.save()

        # 3. Create Profile and Encrypt Aadhaar
        profile = UserProfile(user=user)
        profile.set_aadhaar(aadhaar) # Using our custom encryption method
        profile.save()

        return user

class UserProfileSerializer(serializers.ModelSerializer):
    aadhaar_number = serializers.SerializerMethodField()
    email = serializers.EmailField(source='user.email')
    username = serializers.CharField(source='user.username')

    class Meta:
        model = UserProfile
        fields = ['username', 'email', 'aadhaar_number']

    def get_aadhaar_number(self, obj):
        # Decrypt logic happens here before sending to frontend
        return obj.get_aadhaar()