from django.db.models.signals import post_save, m2m_changed
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from .models import Notification
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_profile(sender, instance, created, **kwargs):
    """Already handled in models.py - this is just a reference"""
    pass


def send_notification_to_user(user_id, notification_type, message, task=None):
    """Create notification and send via WebSocket"""
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user = User.objects.get(pk=user_id)
        
        notification = Notification.objects.create(
            recipient=user,
            notification_type=notification_type,
            message=message,
            task=task,
        )
        
        # Send via WebSocket (non-blocking)
        channel_layer = get_channel_layer()
        group_name = f'notifications_{user_id}'
        
        from .serializers_notification import NotificationSerializer
        
        serializer = NotificationSerializer(notification)
        
        # Use async_to_sync wrapper to send event
        try:
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    'type': 'notification_message',
                    'notification': serializer.data,
                }
            )
        except Exception as e:
            print(f"Error sending WebSocket notification: {e}")
        
        # Send email if configured
        if settings.EMAIL_HOST:
            try:
                send_mail(
                    subject=f"[TaskManager] {notification_type.replace('_', ' ').title()}",
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=True,
                )
            except Exception as e:
                print(f"Error sending email notification: {e}")
    except Exception as e:
        print(f"Error creating notification: {e}")

