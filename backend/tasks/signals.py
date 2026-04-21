from django.db.models.signals import post_save, m2m_changed
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta
from .models import Task, TaskComment
from core.signals import send_notification_to_user


@receiver(m2m_changed, sender=Task.assigned_to.through)
def task_assigned_to_changed(sender, instance, action, pk_set, **kwargs):
    """Notify users when they are assigned to a task"""
    if action == 'post_add' and pk_set:
        for user_id in pk_set:
            send_notification_to_user(
                user_id,
                'task_assigned',
                f'You have been assigned to task: {instance.title}',
                task=instance
            )


@receiver(post_save, sender=TaskComment)
def comment_added_to_task(sender, instance, created, **kwargs):
    """Notify users involved in the task when a comment is added"""
    if created:
        # Notify task creator
        if instance.task.created_by != instance.author:
            send_notification_to_user(
                instance.task.created_by.id,
                'comment_added',
                f'{instance.author.username} commented on task: {instance.task.title}',
                task=instance.task
            )
        
        # Notify all assignees
        for assignee in instance.task.assigned_to.exclude(pk=instance.author.id):
            send_notification_to_user(
                assignee.id,
                'comment_added',
                f'{instance.author.username} commented on task: {instance.task.title}',
                task=instance.task
            )


@receiver(post_save, sender=Task)
def task_deadline_approaching(sender, instance, created, **kwargs):
    """Check if task deadline is approaching and notify assignees"""
    if not created and instance.deadline:
        now = timezone.now()
        deadline = instance.deadline
        time_until_deadline = deadline - now
        
        # Notify if deadline is within 24 hours and task is not done
        if timedelta(hours=0) < time_until_deadline <= timedelta(hours=24) and instance.status != 'done':
            for assignee in instance.assigned_to.all():
                send_notification_to_user(
                    assignee.id,
                    'deadline_approaching',
                    f'Deadline approaching for task: {instance.title}',
                    task=instance
                )
