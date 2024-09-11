# your_app/routing.py
from django.urls import path
from . import consumers  # Import your WebSocket consumers

websocket_urlpatterns = [
    path('ws/chat/', consumers.ChatConsumer.as_asgi()),  # Example WebSocket route
]
