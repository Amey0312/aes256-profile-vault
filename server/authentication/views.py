from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.contrib.auth.models import User
from .models import UserProfile, Transaction
from .serializers import (
    RegisterSerializer, 
    UserProfileSerializer, 
    TransferSerializer, 
    TransactionSerializer,
    UserOptionSerializer  # <--- Ensure this is imported
)

# 1. Registration
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# 2. User Profile (Identity Dashboard)
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.profile
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

# 3. Transfer Funds (Atomic Transaction)
class TransferView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = TransferSerializer(data=request.data)
        if serializer.is_valid():
            receiver_username = serializer.validated_data['receiver_username']
            amount = serializer.validated_data['amount']
            sender = request.user

            if amount <= 0:
                return Response({"error": "Amount must be positive"}, status=status.HTTP_400_BAD_REQUEST)
            
            if sender.username == receiver_username:
                return Response({"error": "Cannot transfer to yourself"}, status=status.HTTP_400_BAD_REQUEST)

            try:
                with transaction.atomic():
                    sender_profile = UserProfile.objects.select_for_update().get(user=sender)
                    receiver_user = get_object_or_404(User, username=receiver_username)
                    receiver_profile = UserProfile.objects.select_for_update().get(user=receiver_user)

                    if sender_profile.balance < amount:
                        raise ValueError("Insufficient funds")

                    sender_profile.balance -= amount
                    receiver_profile.balance += amount
                    
                    sender_profile.save()
                    receiver_profile.save()

                    Transaction.objects.create(
                        sender=sender,
                        receiver=receiver_user,
                        amount=amount,
                        status='SUCCESS'
                    )

                return Response({"message": "Transfer successful"}, status=status.HTTP_200_OK)

            except UserProfile.DoesNotExist:
                return Response({"error": "User profile error"}, status=status.HTTP_400_BAD_REQUEST)
            except ValueError as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({"error": "Transfer failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# 4. Transaction History
class TransactionHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        transactions = Transaction.objects.filter(
            Q(sender=request.user) | Q(receiver=request.user)
        ).order_by('-timestamp')
        
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)

# 5. User List (For Dropdown) <--- This was missing!
class UserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Fetch all users EXCEPT the current user
        users = User.objects.exclude(id=request.user.id).order_by('username')
        serializer = UserOptionSerializer(users, many=True)
        return Response(serializer.data)