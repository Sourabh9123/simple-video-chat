from django.shortcuts import render
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
# Create your views here.
import json
from django.contrib.auth.models import User


class LoginView(GenericAPIView):

    def post(self, request, *args, **kwargs):
        username = request.data.get("username")
        password = request.data.get("password")
        print(username,"------------------------------------------")

        user = User.objects.get(username=username)
        print(user, " -------------------------------------------------")
      
        user_data = {
            "id": user.id,
            "username": user.username,
          
        }
        

        return Response({"response":user_data })