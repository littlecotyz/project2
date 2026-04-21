import os
import django
from channels.routing import ProtocolTypeRouter, URLRouter
from core.jwt_middleware import TokenAuthMiddlewareStack
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'taskmanager.settings')
django.setup()

from core import routing as core_routing

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': TokenAuthMiddlewareStack(
        URLRouter(
            core_routing.websocket_urlpatterns
        )
    ),
})
